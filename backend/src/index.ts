import express from "express";
import fs from "fs-extra";
import path from "path";
import unzipper from "unzipper";
import { readFile } from "fs/promises";
import { exec } from "child_process";
import AdmZip from "adm-zip";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import "./github/githubAuth";
import { githubRoutes } from "./github/routes";

import {
  inputWriteBlobScheme,
  inputDeleteBlobScheme,
  inputSetAttributesScheme,
  inputUpdateWriteBlobScheme,
} from "./schemas/inputScheme";
import { CloudTasksClient } from "@google-cloud/tasks";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Length"],
  })
);
app.use(
  session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(githubRoutes);

const hex = process.env.SUI_Hex || "";
const secretKey = Uint8Array.from(Buffer.from(hex, "hex"));
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
const walrusClient = new WalrusClient({
  network: "mainnet",
  suiClient,
});

const tasksClient = new CloudTasksClient();
const parent = tasksClient.queuePath(
  process.env.PROJECT_ID || "",
  process.env.REGION || "",
  process.env.CLOUD_NAME || ""
);

const upload = multer({ dest: "uploads/" });

const commonOutputDirs = ["build", "dist", "out", ".next"];

const findPackageJsonPath = async (dir: string): Promise<string | null> => {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      const found = await findPackageJsonPath(fullPath);
      if (found) return found;
    } else if (file === "package.json") {
      return dir;
    }
  }
  return null;
};

const findIndexHtmlPath = async (dir: string): Promise<string | null> => {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      const found = await findIndexHtmlPath(fullPath);
      if (found) return found;
    } else if (file === "index.html") {
      return path.dirname(fullPath);
    }
  }
  return null;
};

const findIndexHtmlInKnownDirs = async (
  baseDir: string
): Promise<string | null> => {
  for (const outDirName of commonOutputDirs) {
    const candidateDir = path.join(baseDir, outDirName);
    const indexPath = path.join(candidateDir, "index.html");
    if (await fs.pathExists(indexPath)) {
      return candidateDir;
    }
  }
  return null;
};

app.post("/process-site", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      statusCode: 0,
      error: "No file uploaded",
    });
    return;
  }

  const zipFile = req.file;
  const extractPath = path.join(__dirname, "temp", Date.now().toString());
  await fs
    .createReadStream(zipFile.path)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  const attributes = req.body.attributes
    ? typeof req.body.attributes === "string"
      ? JSON.parse(req.body.attributes)
      : req.body.attributes
    : {};
  const attributes_data = inputWriteBlobScheme.safeParse(attributes);
  if (!attributes_data.success) {
    res.status(400).json({
      statusCode: 0,
      errors: attributes_data.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  let indexDir: string | null;

  if (attributes_data.data.is_build === "0") {
    const buildDir = await findPackageJsonPath(extractPath);
    if (!buildDir) throw new Error("package.json not found");
    await new Promise((resolve, reject) => {
      exec(attributes_data.data.install_command, { cwd: buildDir }, (err) => {
        if (err) return reject(err);
        exec(attributes_data.data.build_command, { cwd: buildDir }, (err2) => {
          if (err2) return reject(err2);
          resolve(true);
        });
      });
    });
    indexDir = await findIndexHtmlInKnownDirs(buildDir);
    if (!indexDir) {
      indexDir = await findIndexHtmlPath(extractPath);
    }
  } else {
    indexDir = await findIndexHtmlPath(extractPath);
  }

  if (!indexDir) throw new Error("index.html not found");
  const wsResources = {
    headers: {},
    routes: {},
    metadata: {
      link: "https://subdomain.wal.app/",
      image_url: "https://www.walrus.xyz/walrus-site",
      description: "This is a walrus site.",
      project_url: "https://github.com/MystenLabs/walrus-sites/",
      creator: "MystenLabs",
    },
    ignore: ["/private/", "/secret.txt", "/images/tmp/*"],
  };

  await fs.writeJson(path.join(indexDir, "ws-resources.json"), wsResources, {
    spaces: 2,
  });

  const outputZipPath = path.join(
    __dirname,
    "outputs",
    `${uuidv4()}_${Date.now()}.zip`
  );
  await fs.ensureDir(path.dirname(outputZipPath));
  const zip = new AdmZip();

  const addFilesToZip = async (dir: string, baseInZip = "") => {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await addFilesToZip(fullPath, path.join(baseInZip, entry));
      } else {
        const fileContent = await fs.readFile(fullPath);
        zip.addFile(path.join(baseInZip, entry), fileContent);
      }
    }
  };

  await addFilesToZip(indexDir);
  zip.writeZip(outputZipPath);

  let new_blob_data;
  let write_blob_attempts = 0;
  const delay = 1000;
  const max_attempts_write_blob = 2;
  const max_attempts_set_status = 5;
  const zipBuffer = await readFile(outputZipPath);
  while (write_blob_attempts < max_attempts_write_blob) {
    try {
      new_blob_data = await walrusClient.writeBlob({
        blob: zipBuffer,
        deletable: true,
        epochs: Number(attributes_data.data.epochs),
        signer: keypair,
        attributes: { ...attributes_data.data, forceId: uuidv4() },
      });
      console.log("wrote blob");
      if (
        new_blob_data.blobObject.certified_epoch ||
        new_blob_data.blobObject.certified_epoch !== null
      ) {
        break;
      }
      write_blob_attempts++;
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message: "Failed to write blob to Walrus",
          error_details: error,
        },
      });
      return;
    }

    if (write_blob_attempts === max_attempts_write_blob) {
      let set_status_attempts = 0;
      while (set_status_attempts < max_attempts_set_status) {
        try {
          await walrusClient.executeWriteBlobAttributesTransaction({
            blobObjectId: new_blob_data.blobObject.id.id,
            signer: keypair,
            attributes: { status: "2" },
          });
          break;
        } catch (error) {
          set_status_attempts++;
          if (set_status_attempts === max_attempts_set_status) {
            if (error instanceof Error) {
              res.status(502).json({
                statusCode: 0,
                error: {
                  error_message:
                    "Failed to change status code to 2 in blob attributes",
                  error_details: error,
                },
              });
              return;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      res.status(504).json({
        statusCode: 0,
        error: "Certified epoch is null",
      });
      return;
    }
  }

  if (!new_blob_data) {
    res.status(503).json({
      statusCode: 0,
      error: "WriteBlob success but data is undefined",
    });
    return;
  }

  const blobObjectId = new_blob_data.blobObject.id.id;

  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: blobObjectId,
      signer: keypair,
      attributes: { blobId: new_blob_data.blobId },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message:
            "Failed to execute write blob attributes transaction to Walrus",
          error_details: error,
        },
      });
      return;
    }
  }

  let check_blob_id;

  try {
    check_blob_id = await walrusClient.readBlobAttributes({
      blobObjectId: blobObjectId,
    });
  } catch (error) {
    res.status(502).json({
      statusCode: 0,
      error: {
        error_message: "Failed to read blob attributes from Walrus",
        error_details: error,
      },
    });
    return;
  }

  if (!check_blob_id || !check_blob_id.blobId) {
    res.status(502).json({
      statusCode: 0,
      error: "Failed to add blobId to attributes",
    });
    return;
  }

  let response;
  try {
    const payload = {
      arg1: "publish",
      arg2: blobObjectId,
    };

    [response] = await tasksClient.createTask({
      parent,
      task: {
        httpRequest: {
          httpMethod: "POST",
          url: `https://${process.env.JOB_ID}.${process.env.REGION}.run.app`,
          headers: {
            "Content-Type": "application/json",
          },
          body: Buffer.from(JSON.stringify(payload)).toString("base64"),
          oidcToken: {
            serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      error: {
        error_message: "Failed to create task",
        error_details: error,
      },
    });
    return;
  }

  if (response.name) {
    res.status(200).json({
      statusCode: 1,
      objectId: blobObjectId,
      taskName: `Created task ${response.name}`,
    });
  }
});

// app.post("/process-site", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     res.status(400).json({
//       statusCode: 0,
//       error: "No file uploaded",
//     });
//     return;
//   }

//   const zipFile = req.file;
//   const extractPath = path.join(__dirname, "temp", Date.now().toString());
//   await fs
//     .createReadStream(zipFile.path)
//     .pipe(unzipper.Extract({ path: extractPath }))
//     .promise();

//   const attributes = req.body.attributes
//     ? typeof req.body.attributes === "string"
//       ? JSON.parse(req.body.attributes)
//       : req.body.attributes
//     : {};
//   const attributes_data = inputWriteBlobScheme.safeParse(attributes);
//   if (!attributes_data.success) {
//     res.status(400).json({
//       statusCode: 0,
//       errors: attributes_data.error.errors.map((err) => ({
//         error_message: err.message,
//         error_field: err.path.join("."),
//       })),
//     });
//     return;
//   }

//   let indexDir: string | null;

//   if (attributes_data.data.is_build === "0") {
//     const buildDir = await findPackageJsonPath(extractPath);
//     if (!buildDir) throw new Error("package.json not found");
//     await new Promise((resolve, reject) => {
//       exec(attributes_data.data.install_command, { cwd: buildDir }, (err) => {
//         if (err) return reject(err);
//         exec(attributes_data.data.build_command, { cwd: buildDir }, (err2) => {
//           if (err2) return reject(err2);
//           resolve(true);
//         });
//       });
//     });
//     indexDir = await findIndexHtmlInKnownDirs(buildDir);
//     if (!indexDir) {
//       indexDir = await findIndexHtmlPath(extractPath);
//     }
//   } else {
//     indexDir = await findIndexHtmlPath(extractPath);
//   }

//   if (!indexDir) throw new Error("index.html not found");
//   const wsResources = {
//     headers: {},
//     routes: {},
//     metadata: {
//       link: "https://subdomain.wal.app/",
//       image_url: "https://www.walrus.xyz/walrus-site",
//       description: "This is a walrus site.",
//       project_url: "https://github.com/MystenLabs/walrus-sites/",
//       creator: "MystenLabs",
//     },
//     ignore: ["/private/", "/secret.txt", "/images/tmp/*"],
//   };

//   await fs.writeJson(path.join(indexDir, "ws-resources.json"), wsResources, {
//     spaces: 2,
//   });

//   const outputZipPath = path.join(
//     __dirname,
//     "outputs",
//     `${attributes_data.data["site-name"].replace(
//       /\s+/g,
//       "_"
//     )}_${Date.now()}.zip`
//   );
//   await fs.ensureDir(path.dirname(outputZipPath));
//   const zip = new AdmZip();

//   const addFilesToZip = async (dir: string, baseInZip = "") => {
//     const entries = await fs.readdir(dir);
//     for (const entry of entries) {
//       const fullPath = path.join(dir, entry);
//       const stat = await fs.stat(fullPath);
//       if (stat.isDirectory()) {
//         await addFilesToZip(fullPath, path.join(baseInZip, entry));
//       } else {
//         const fileContent = await fs.readFile(fullPath);
//         zip.addFile(path.join(baseInZip, entry), fileContent);
//       }
//     }
//   };

//   await addFilesToZip(indexDir);
//   zip.writeZip(outputZipPath);

//   let new_blob_data;
//   let write_blob_attempts = 0;
//   const delay = 1000;
//   const max_attempts_write_blob = 2;
//   const max_attempts_set_status = 5;
//   const zipBuffer = await readFile(outputZipPath);
//   while (write_blob_attempts < max_attempts_write_blob) {
//     try {
//       new_blob_data = await walrusClient.writeBlob({
//         blob: zipBuffer,
//         deletable: true,
//         epochs: Number(attributes_data.data.epochs),
//         signer: keypair,
//         attributes: { ...attributes_data.data, forceId: uuidv4() },
//       });
//       if (
//         new_blob_data.blobObject.certified_epoch ||
//         new_blob_data.blobObject.certified_epoch !== null
//       ) {
//         break;
//       }
//       write_blob_attempts++;
//       await new Promise((resolve) => setTimeout(resolve, delay));
//     } catch (error) {
//       res.status(502).json({
//         statusCode: 0,
//         error: {
//           error_message: "Failed to write blob to Walrus",
//           error_details: error,
//         },
//       });
//       return;
//     }

//     if (write_blob_attempts === max_attempts_write_blob) {
//       let set_status_attempts = 0;
//       while (set_status_attempts < max_attempts_set_status) {
//         try {
//           await walrusClient.executeWriteBlobAttributesTransaction({
//             blobObjectId: new_blob_data.blobObject.id.id,
//             signer: keypair,
//             attributes: { status: "2" },
//           });
//           break;
//         } catch (error) {
//           set_status_attempts++;
//           if (set_status_attempts === max_attempts_set_status) {
//             if (error instanceof Error) {
//               res.status(502).json({
//                 statusCode: 0,
//                 error: {
//                   error_message:
//                     "Failed to change status code to 2 in blob attributes",
//                   error_details: error,
//                 },
//               });
//               return;
//             }
//           }
//           await new Promise((resolve) => setTimeout(resolve, delay));
//         }
//       }
//       res.status(504).json({
//         statusCode: 0,
//         error: "Certified epoch is null",
//       });
//       return;
//     }
//   }

//   if (!new_blob_data) {
//     res.status(503).json({
//       statusCode: 0,
//       error: "WriteBlob success but data is undefined",
//     });
//     return;
//   }

//   const blobObjectId = new_blob_data.blobObject.id.id;

//   try {
//     await walrusClient.executeWriteBlobAttributesTransaction({
//       blobObjectId: blobObjectId,
//       signer: keypair,
//       attributes: { blobId: new_blob_data.blobId },
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(502).json({
//         statusCode: 0,
//         error: {
//           error_message:
//             "Failed to execute write blob attributes transaction to Walrus",
//           error_details: error,
//         },
//       });
//       return;
//     }
//   }

//   let check_blob_id;

//   try {
//     check_blob_id = await walrusClient.readBlobAttributes({
//       blobObjectId: blobObjectId,
//     });
//   } catch (error) {
//     res.status(502).json({
//       statusCode: 0,
//       error: {
//         error_message: "Failed to read blob attributes from Walrus",
//         error_details: error,
//       },
//     });
//     return;
//   }

//   if (!check_blob_id || !check_blob_id.blobId) {
//     res.status(502).json({
//       statusCode: 0,
//       error: "Failed to add blobId to attributes",
//     });
//     return;
//   }

//   let response;
//   try {
//     const payload = {
//       "arg1": "publish",
//       "arg2": blobObjectId
//     };

//     [response] = await tasksClient.createTask({
//       parent,
//       task: {
//         httpRequest: {
//           httpMethod: 'POST',
//           url: `https://job-777397487566.asia-southeast1.run.app`,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: Buffer.from(JSON.stringify(payload)).toString('base64'),
//           oidcToken: {
//             serviceAccountEmail: 'cloud-tasks-http-request@ivory-project-457721.iam.gserviceaccount.com',
//           },
//         },
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       statusCode: 0,
//       error: {
//         error_message:
//           "Failed to create task",
//         error_details: error,
//       },
//     });
//     return;
//   }

//   if (response.name) {
//     res.status(200).json({
//       statusCode: 1,
//       objectId: blobObjectId,
//       taskName: `Created task ${response.name}`,
//     });
//   }

//   // Delete the uploaded zip file
//   try {
//     await fs.unlink(zipFile.path);
//   } catch (error) {
//     console.error("Failed to delete zip file:", error);
//   }
// });

app.put("/set-attributes", async (req, res) => {
  const object_id = req.query.object_id;
  const sui_ns = req.query.sui_ns;

  if (!object_id) {
    res.status(400).json({
      statusCode: 0,
      error: "Object ID is required in query parameters",
    });
    return;
  }

  if (!sui_ns) {
    res.status(400).json({
      statusCode: 0,
      error: "Sui Service name(SuiNS) is required in query parameters",
    });
    return;
  }

  const attributes_data = inputSetAttributesScheme.safeParse({
    object_id,
    sui_ns,
  });

  if (!attributes_data.success) {
    res.status(400).json({
      statusCode: 0,
      errors: attributes_data.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes_data.data.object_id,
      signer: keypair,
      attributes: { sui_ns: attributes_data.data.sui_ns },
    });
  } catch (error) {
    res.status(502).json({
      statusCode: 0,
      error: {
        error_message: "Failed to add sui service name to blob attributes",
        error_details: error,
      },
    });
    return;
  }
  res.status(200).json({
    statusCode: 1,
    message: "Sui service name added to blob attributes successfully",
  });
});

app.put("/update-blob-n-run-job", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      statusCode: 0,
      error: "No file uploaded",
    });
    return;
  }

  const zipFile = req.file;
  const extractPath = path.join(__dirname, "temp", Date.now().toString());
  await fs
    .createReadStream(zipFile.path)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  const attributes = req.body.attributes
    ? typeof req.body.attributes === "string"
      ? JSON.parse(req.body.attributes)
      : req.body.attributes
    : {};
  const attributes_data = inputUpdateWriteBlobScheme.safeParse(attributes);
  if (!attributes_data.success) {
    res.status(400).json({
      statusCode: 0,
      errors: attributes_data.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  let indexDir: string | null;

  if (attributes_data.data.is_build === "0") {
    const buildDir = await findPackageJsonPath(extractPath);
    if (!buildDir) throw new Error("package.json not found");
    await new Promise((resolve, reject) => {
      exec(attributes_data.data.install_command, { cwd: buildDir }, (err) => {
        if (err) return reject(err);
        exec(attributes_data.data.build_command, { cwd: buildDir }, (err2) => {
          if (err2) return reject(err2);
          resolve(true);
        });
      });
    });
    indexDir = await findIndexHtmlInKnownDirs(buildDir);
    if (!indexDir) {
      indexDir = await findIndexHtmlPath(extractPath);
    }
  } else {
    indexDir = await findIndexHtmlPath(extractPath);
  }

  if (!indexDir) throw new Error("index.html not found");
  const wsResources = {
    headers: {},
    routes: {},
    metadata: {
      link: "https://subdomain.wal.app/",
      image_url: "https://www.walrus.xyz/walrus-site",
      description: "This is a walrus site.",
      project_url: "https://github.com/MystenLabs/walrus-sites/",
      creator: "MystenLabs",
    },
    ignore: ["/private/", "/secret.txt", "/images/tmp/*"],
  };

  await fs.writeJson(path.join(indexDir, "ws-resources.json"), wsResources, {
    spaces: 2,
  });

  const outputZipPath = path.join(
    __dirname,
    "outputs",
    `${attributes_data.data["old_object_id"].replace(
      /\s+/g,
      "_"
    )}_${Date.now()}.zip`
  );
  await fs.ensureDir(path.dirname(outputZipPath));
  const zip = new AdmZip();

  const addFilesToZip = async (dir: string, baseInZip = "") => {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await addFilesToZip(fullPath, path.join(baseInZip, entry));
      } else {
        const fileContent = await fs.readFile(fullPath);
        zip.addFile(path.join(baseInZip, entry), fileContent);
      }
    }
  };

  await addFilesToZip(indexDir);
  zip.writeZip(outputZipPath);

  let new_blob_data;
  let write_blob_attempts = 0;
  const delay = 1000;
  const max_attempts_write_blob = 2;
  const max_attempts_set_status = 5;
  const zipBuffer = await readFile(outputZipPath);
  const { old_object_id, ...updated_data } = attributes_data.data;
  while (write_blob_attempts < max_attempts_write_blob) {
    try {
      new_blob_data = await walrusClient.writeBlob({
        blob: zipBuffer,
        deletable: true,
        epochs: Number(attributes_data.data.epochs),
        signer: keypair,
        attributes: { ...updated_data },
      });
      if (
        new_blob_data.blobObject.certified_epoch ||
        new_blob_data.blobObject.certified_epoch !== null
      ) {
        break;
      }
      write_blob_attempts++;
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message: "Failed to write blob to Walrus",
          error_details: error,
        },
      });
      return;
    }

    if (write_blob_attempts === max_attempts_write_blob) {
      let set_status_attempts = 0;
      while (set_status_attempts < max_attempts_set_status) {
        try {
          await walrusClient.executeWriteBlobAttributesTransaction({
            blobObjectId: new_blob_data.blobObject.id.id,
            signer: keypair,
            attributes: { status: "2" },
          });
          break;
        } catch (error) {
          set_status_attempts++;
          if (set_status_attempts === max_attempts_set_status) {
            if (error instanceof Error) {
              res.status(502).json({
                statusCode: 0,
                error: {
                  error_message:
                    "Failed to change status code to 2 in blob attributes",
                  error_details: error,
                },
              });
              return;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      res.status(504).json({
        statusCode: 0,
        error: "Certified epoch is null",
      });
      return;
    }
  }

  if (!new_blob_data) {
    res.status(503).json({
      statusCode: 0,
      error: "WriteBlob success but data is undefined",
    });
    return;
  }

  const blobObjectId = new_blob_data.blobObject.id.id;

  const old_attributes = await walrusClient.readBlobAttributes({
    blobObjectId: old_object_id,
  });

  if (!old_attributes) {
    res.status(404).json({
      statusCode: 0,
      error: "blob data not found",
    });
    return;
  }

  const old_site_name = old_attributes["site-name"];
  const old_site_id = old_attributes["site_id"];
  const site_statuss = old_attributes["site_status"];
  let attributesUpdate;
  if (site_statuss && site_statuss !== null) {
    attributesUpdate = {
      site_status: "0",
      status: "0",
      blobId: new_blob_data.blobId,
      "site-name": old_site_name,
      site_id: old_site_id,
    };
  } else {
    attributesUpdate = {
      status: "0",
      blobId: new_blob_data.blobId,
      "site-name": old_site_name,
      site_id: old_site_id,
    };
  }
  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: blobObjectId,
      signer: keypair,
      attributes: attributesUpdate
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message:
            "Failed to execute write blob attributes transaction to Walrus",
          error_details: error,
        },
      });
      return;
    }
  }

  try {
    await walrusClient.executeDeleteBlobTransaction({
      signer: keypair,
      blobObjectId: old_object_id,
    });
  } catch (error) {
    res.status(502).json({
      statusCode: 0,
      error: {
        error_message:
          "Failed to execute delete blob attributes transaction to Walrus",
        error_details: error,
      },
    });
    return;
  }

  let response;
  try {
    const payload = {
      arg1: "publish",
      arg2: blobObjectId,
    };

    [response] = await tasksClient.createTask({
      parent,
      task: {
        httpRequest: {
          httpMethod: "POST",
          url: `https://${process.env.JOB_ID}.${process.env.REGION}.run.app`,
          headers: {
            "Content-Type": "application/json",
          },
          body: Buffer.from(JSON.stringify(payload)).toString("base64"),
          oidcToken: {
            serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      error: {
        error_message: "Failed to create task",
        error_details: error,
      },
    });
    return;
  }

  if (response.name) {
    res.status(200).json({
      statusCode: 1,
      objectId: blobObjectId,
      taskName: `Created task ${response.name}`,
    });
  }
});

app.delete("/delete-site", async (req, res) => {
  const object_id = req.query.object_id;

  if (!object_id) {
    res.status(400).json({
      statusCode: 0,
      error: "Object ID is required in query parameters",
    });
    return;
  }

  const attributes_data = inputDeleteBlobScheme.safeParse({ object_id });

  if (!attributes_data.success) {
    res.status(400).json({
      statusCode: 0,
      error: attributes_data.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: String(object_id),
      signer: keypair,
      attributes: { staus: "3" },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message:
            "Failed to execute write blob attributes transaction to Walrus",
          error_details: error,
        },
      });
      return;
    }
  }

  let response;
  try {
    const payload = {
      arg1: "delete_site",
      arg2: object_id,
    };

    [response] = await tasksClient.createTask({
      parent,
      task: {
        httpRequest: {
          httpMethod: "POST",
          url: `https://${process.env.JOB_ID}.${process.env.REGION}.run.app`,
          headers: {
            "Content-Type": "application/json",
          },
          body: Buffer.from(JSON.stringify(payload)).toString("base64"),
          oidcToken: {
            serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      error: {
        error_message: "Failed to create task",
        error_details: error,
      },
    });
    return;
  }

  if (response.name) {
    res.status(200).json({
      statusCode: 1,
      taskName: `Created task ${response.name}`,
    });
  }
});

app.put("/add-site-id", async (req, res) => {
  const object_id = req.query.object_id;

  if (!object_id) {
    res.status(400).json({
      statusCode: 0,
      error: "Object ID is required in query parameters",
    });
    return;
  }

  const attributes_data = inputDeleteBlobScheme.safeParse({ object_id });

  if (!attributes_data.success) {
    res.status(400).json({
      statusCode: 0,
      error: attributes_data.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: String(object_id),
      signer: keypair,
      attributes: { site_status: "0" },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message:
            "Failed to execute write blob attributes transaction to Walrus",
          error_details: error,
        },
      });
      return;
    }
  }

  let response;
  try {
    const payload = {
      arg1: "get_site_id",
      arg2: object_id,
    };

    [response] = await tasksClient.createTask({
      parent,
      task: {
        httpRequest: {
          httpMethod: "POST",
          url: `https://${process.env.JOB_ID}.${process.env.REGION}.run.app`,
          headers: {
            "Content-Type": "application/json",
          },
          body: Buffer.from(JSON.stringify(payload)).toString("base64"),
          oidcToken: {
            serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      error: {
        error_message: "Failed to create task",
        error_details: error,
      },
    });
    return;
  }

  if (response.name) {
    res.status(200).json({
      statusCode: 1,
      taskName: `Created task ${response.name}`,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
