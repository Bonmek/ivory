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

// Add these helper functions at the top level
async function containsJavaScriptFiles(dir: string): Promise<boolean> {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      if (await containsJavaScriptFiles(fullPath)) {
        return true;
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      return true;
    }
  }
  return false;
}

async function detectBuildTool(buildDir: string): Promise<{ tool: string; configPath: string } | null> {
  const configFiles = [
    { tool: 'vite', patterns: ['vite.config.ts', 'vite.config.js'] },
    { tool: 'webpack', patterns: ['webpack.config.js', 'webpack.config.ts'] },
    { tool: 'rollup', patterns: ['rollup.config.js', 'rollup.config.ts'] }
  ];

  for (const { tool, patterns } of configFiles) {
    for (const pattern of patterns) {
      const configPath = path.join(buildDir, pattern);
      if (await fs.pathExists(configPath)) {
        return { tool, configPath };
      }
    }
  }
  return null;
}

async function modifyBuildConfig(configPath: string, tool: string, attributes_data: TypeOf<typeof inputWriteBlobScheme>): Promise<void> {
  const content = await fs.readFile(configPath, 'utf-8');
  let modifiedContent = content;

  switch (tool) {
    case 'vite':
      // Add or modify base and build.outDir
      if (!content.includes('base:')) {
        modifiedContent = modifiedContent.replace(
          /export default defineConfig\(\{/,
          `export default defineConfig({\n  base: "./",\n  build: {\n    outDir: "${attributes_data.output_dir}",\n  },`
        );
      }
      break;
    case 'webpack':
      // Add or modify output.path and output.publicPath
      if (!content.includes('output:')) {
        modifiedContent = modifiedContent.replace(
          /module.exports = \{/,
          'module.exports = {\n  output: {\n    path: path.resolve(__dirname, "dist"),\n    publicPath: "./",\n  },'
        );
      }
      break;
    case 'rollup':
      // Add or modify output.dir and output.assetFileNames
      if (!content.includes('output:')) {
        modifiedContent = modifiedContent.replace(
          /export default \{/,
          'export default {\n  output: {\n    dir: "dist",\n    assetFileNames: "[name][extname]",\n  },'
        );
      }
      break;
  }

  await fs.writeFile(configPath, modifiedContent, 'utf-8');
}

// Helper function to clean up files
async function cleanupFiles(extractPath: string | null, uploadPath: string | null, outputPath: string | null) {
  try {
    await Promise.all([
      extractPath ? fs.remove(extractPath) : Promise.resolve(),
      uploadPath ? fs.remove(uploadPath) : Promise.resolve(),
      outputPath ? fs.remove(outputPath) : Promise.resolve()
    ]);
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Helper function to clean up all directories
async function cleanupAllDirectories() {
  try {
    const dirs = ['outputs', 'temp', 'uploads'];
    await Promise.all(
      dirs.map(async dir => {
        const dirPath = path.join(__dirname, dir);
        if (await fs.pathExists(dirPath)) {
          const files = await fs.readdir(dirPath);
          await Promise.all(
            files.map(file => fs.remove(path.join(dirPath, file)))
          );
          await fs.remove(dirPath);
        }
      })
    );
  } catch (error) {
    console.error("Error cleaning up directories:", error);
  }
}

app.post("/preview", upload.single("file"), async (req, res) => {
  const startTime = performance.now();
  console.log('Start processing:', new Date().toISOString());
  let extractPath: string | null = null;
  let outputZipPath: string | null = null;
  let indexDir: string | null = null;

  if (!req.file) {
    await cleanupAllDirectories();
    res.status(400).json({
      statusCode: 0,
      error: "No file uploaded",
    });
    return;
  }

  try {
    const zipFile = req.file;
    extractPath = path.join(__dirname, "temp", Date.now().toString());
    
    const extractStart = performance.now();
    await fs
      .createReadStream(zipFile.path)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();
    console.log(`File extraction took: ${(performance.now() - extractStart).toFixed(2)}ms`);

    const attributes = req.body.attributes
      ? typeof req.body.attributes === "string"
        ? JSON.parse(req.body.attributes)
        : req.body.attributes
      : {};
    console.log('Received attributes from frontend:', JSON.stringify(attributes, null, 2));
    const attributes_data = inputWriteBlobScheme.safeParse(attributes);
    if (!attributes_data.success) {
      await cleanupFiles(extractPath, zipFile.path, null);
      await cleanupAllDirectories();
      res.status(400).json({
        statusCode: 0,
        errors: attributes_data.error.errors.map((err) => ({
          error_message: err.message,
          error_field: err.path.join("."),
        })),
      });
      return;
    }

    if (attributes_data.data.is_build === "1") {
      if (await containsJavaScriptFiles(extractPath)) {
        await cleanupFiles(extractPath, zipFile.path, null);
        await cleanupAllDirectories();
        res.status(404).json({
          statusCode: 0,
          error: "JavaScript files found in the uploaded zip. Only static files are allowed when is_build is 1.",
        });
        return;
      }
      indexDir = await findIndexHtmlPath(extractPath);
    } else if (attributes_data.data.is_build === "0") {
      const buildDir = path.join(extractPath, attributes_data.data.root);
      const packageJsonPath = path.join(buildDir, "package.json");
      console.log('buildDir', buildDir);
      console.log('packageJsonPath', packageJsonPath);

      if (!await fs.pathExists(packageJsonPath)) {
        await cleanupFiles(extractPath, zipFile.path, null);
        await cleanupAllDirectories();
        res.status(404).json({
          statusCode: 0,
          error: "package.json not found in specified root directory",
        });
        return;
      }

      try {
        const buildTool = await detectBuildTool(buildDir);
        if (buildTool) {
          await modifyBuildConfig(buildTool.configPath, buildTool.tool, attributes_data.data);
        }

        const buildStart = performance.now();
        await new Promise((resolve, reject) => {
          const install = exec(attributes_data.data.install_command, { cwd: buildDir });
          install.on('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`Install failed with code ${code}`));
              return;
            }
            console.log(`Install took: ${(performance.now() - buildStart).toFixed(2)}ms`);

            const buildCommandStart = performance.now();
            const build = exec(attributes_data.data.build_command, { cwd: buildDir });
            build.on('exit', (code) => {
              if (code !== 0) {
                reject(new Error(`Build failed with code ${code}`));
                return;
              }
              console.log(`Build took: ${(performance.now() - buildCommandStart).toFixed(2)}ms`);
              resolve(true);
            });
          });
        });

        const distPath = path.join(buildDir, attributes_data.data.output_dir);
        const indexPath = path.join(distPath, 'index.html');
        
        if (!await fs.pathExists(indexPath)) {
          await cleanupFiles(extractPath, zipFile.path, null);
          await cleanupAllDirectories();
          res.status(404).json({
            statusCode: 0,
            error: "index.html not found in dist folder",
          });
          return;
        }
        
        indexDir = distPath;
      } catch (error) {
        await cleanupFiles(extractPath, zipFile.path, null);
        await cleanupAllDirectories();
        console.error("Build process failed:", error);
        res.status(500).json({
          statusCode: 0,
          error: "Build process failed",
        });
        return;
      }
    }

    if (!indexDir) {
      await cleanupFiles(extractPath, zipFile.path, null);
      await cleanupAllDirectories();
      res.status(400).json({
        statusCode: 0,
        error: "index.html not found",
      });
      return;
    }

    const zipStart = performance.now();
    outputZipPath = path.join(__dirname, "outputs", `${uuidv4()}_${Date.now()}.zip`);
    await fs.ensureDir(path.dirname(outputZipPath));
    
    const zip = new AdmZip();
    zip.addLocalFolder(indexDir);
    zip.writeZip(outputZipPath);
    console.log(`ZIP creation took: ${(performance.now() - zipStart).toFixed(2)}ms`);

    res.download(outputZipPath, "output.zip", async (err) => {
      if (err) {
        console.error("Error sending file:", err);
        await cleanupFiles(extractPath, zipFile.path, outputZipPath);
        await cleanupAllDirectories();
        res.status(500).json({
          statusCode: 0,
          error: "Failed to send ZIP file",
        });
      }

      const cleanupStart = performance.now();
      await cleanupFiles(extractPath, zipFile.path, outputZipPath);
      await cleanupAllDirectories();
      console.log(`Cleanup took: ${(performance.now() - cleanupStart).toFixed(2)}ms`);
      
      console.log(`Total processing time: ${(performance.now() - startTime).toFixed(2)}ms`);
    });
  } catch (error) {
    console.error("Preview processing error:", error);
    await cleanupFiles(extractPath, req.file?.path, outputZipPath);
    await cleanupAllDirectories();
    res.status(500).json({
      statusCode: 0,
      error: "Internal server error during preview processing"
    });
  }
});

app.post("/process-site", upload.single("file"), async (req, res) => {
  if (!req.file) {
    await cleanupAllDirectories();
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
    await cleanupAllDirectories();
    res.status(400).json({
      statusCode: 0,
      errors: attributes_data.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }
  
  const extractPath = path.join(__dirname, "temp", attributes_data.data["site-name"]);
  try {
    await fs
      .createReadStream(zipFile.path)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

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

    await fs.writeJson(path.join(extractPath, "ws-resources.json"), wsResources, {
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

    await addFilesToZip(extractPath);
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
        await cleanupFiles(extractPath, zipFile.path, outputZipPath);
        await cleanupAllDirectories();
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
              await cleanupFiles(extractPath, zipFile.path, outputZipPath);
              await cleanupAllDirectories();
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
        await cleanupFiles(extractPath, zipFile.path, outputZipPath);
        await cleanupAllDirectories();
        res.status(504).json({
          statusCode: 0,
          error: "Certified epoch is null",
        });
        return;
      }
    }

    if (!new_blob_data) {
      await cleanupFiles(extractPath, zipFile.path, outputZipPath);
      await cleanupAllDirectories();
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
      await cleanupFiles(extractPath, zipFile.path, outputZipPath);
      await cleanupAllDirectories();
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
      await cleanupFiles(extractPath, zipFile.path, outputZipPath);
      await cleanupAllDirectories();
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
      await cleanupFiles(extractPath, zipFile.path, outputZipPath);
      await cleanupAllDirectories();
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
      await cleanupFiles(extractPath, zipFile.path, outputZipPath);
      await cleanupAllDirectories();
      res.status(500).json({
        statusCode: 0,
        error: {
          error_message: "Failed to create task",
          error_details: error,
        },
      });
      return;
    }

    await cleanupFiles(extractPath, zipFile.path, outputZipPath);
    await cleanupAllDirectories();

    if (response.name) {
      res.status(200).json({
        statusCode: 1,
        objectId: blobObjectId,
        taskName: `Created task ${response.name}`,
      });
    }
  } catch (error) {
    await cleanupFiles(extractPath, zipFile.path, null);
    await cleanupAllDirectories();
    res.status(500).json({
      statusCode: 0,
      error: "Internal server error during site processing"
    });
  }
});

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
    if (!buildDir) {
      res.status(400).json({
        statusCode: 0,
        error: "package.json not found",
      });
      return;
    }
    try {
      await new Promise((resolve, reject) => {
        exec(
          attributes_data.data.install_command,
          { cwd: buildDir },
          (err, stdout, stderr) => {
            if (err) {
              console.error("install error", err);
              console.error("install stderr", stderr);
              return reject(err);
            }
            console.log("install stdout", stdout);

            exec(
              attributes_data.data.build_command,
              { cwd: buildDir },
              (err2, stdout2, stderr2) => {
                if (err2) {
                  console.error("build error", err2);
                  console.error("build stderr", stderr2);
                  return reject(err2);
                }
                console.log("build stdout", stdout2);
                resolve(true);
              }
            );
          }
        );
      });
    } catch (error) {
      console.error("Build process failed:", error);
      res.status(500).json({
        statusCode: 0,
        error: "Build process failed",
      });
      return;
    }
    indexDir = await findIndexHtmlInKnownDirs(buildDir);
    if (!indexDir) {
      indexDir = await findIndexHtmlPath(extractPath);
    }
  } else {
    indexDir = await findIndexHtmlPath(extractPath);
  }

  if (!indexDir) {
    res.status(400).json({
      statusCode: 0,
      error: "index.html not found",
    });
    return;
  }
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
      attributes: attributesUpdate,
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

app.delete("/return2zero", async (req, res) => {
  let response;
  try {
    const payload = {
      arg1: "set_zero",
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
