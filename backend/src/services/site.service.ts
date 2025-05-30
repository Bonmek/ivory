import { Request } from "express";
import { TaskService } from "./task.service";
import { FileService } from "./file.service";
import {
  inputCreateSiteScheme,
  inputSetAttributesScheme,
  inputDeleteBlobScheme,
  inputPreviewSiteScheme,
  inputUpdateSiteScheme,
  inputTransferOwnerScheme,
} from "../models/inputScheme";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";
import AdmZip from "adm-zip";
import config from "../config/config";
import { WalrusClient } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export class SiteService {
  private taskService: TaskService;
  private fileService: FileService;
  private walrusClient: WalrusClient;
  private keypair: Ed25519Keypair;

  constructor() {
    this.taskService = new TaskService();
    this.fileService = new FileService();

    const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
    this.walrusClient = new WalrusClient({
      network: "mainnet",
      suiClient,
      storageNodeClientOptions: {
        timeout: config.blockchain.storageTimeout,
      },
    });
    const hex = process.env.SUI_HEX || "";
    const secretKey = Uint8Array.from(Buffer.from(hex, "hex"));
    this.keypair = Ed25519Keypair.fromSecretKey(secretKey);
  }

  async handlePreview(req: Request) {
    let extractPath: string | null = null;
    let outputZipPath: string | null = null;
    let indexDir: string | null = null;

    if (!req.file) {
      await this.fileService.cleanupAllDirectories();
      throw new Error("No file uploaded");
    }

    try {
      const zipFile = req.file;
      extractPath = path.join(__dirname, "../temp", Date.now().toString());

      await this.fileService.extractZip(zipFile.path, extractPath);

      const attributes = req.body.attributes
        ? typeof req.body.attributes === "string"
          ? JSON.parse(req.body.attributes)
          : req.body.attributes
        : {};

      const attributes_data = inputPreviewSiteScheme.safeParse(attributes);

      if (!attributes_data.success) {
        await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
        await this.fileService.cleanupAllDirectories();
        throw new Error(JSON.stringify(attributes_data.error.errors));
      }

      if (attributes_data.data.is_build === "1") {
        if (await this.fileService.containsJavaScriptFiles(extractPath)) {
          await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
          await this.fileService.cleanupAllDirectories();
          throw new Error(
            "JavaScript files found in the uploaded zip. Only static files are allowed."
          );
        }
        indexDir = await this.fileService.findIndexHtmlPath(extractPath);
      } else if (attributes_data.data.is_build === "0") {
        const buildDir = path.join(extractPath, attributes_data.data.root);
        const packageJsonPath = path.join(buildDir, "package.json");

        if (!(await fs.pathExists(packageJsonPath))) {
          await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
          await this.fileService.cleanupAllDirectories();
          throw new Error("package.json not found in specified root directory");
        }

        try {
          const buildTool = await this.fileService.detectBuildTool2(buildDir);
          if (buildTool) {
            await this.fileService.modifyBuildConfig(
              buildTool.configPath,
              buildTool.tool,
              attributes_data.data
            );
          }

          await new Promise((resolve, reject) => {
            const install = exec(attributes_data.data.install_command, {
              cwd: buildDir,
            });
            install.on("exit", (code) => {
              if (code !== 0) {
                reject(new Error(`Install failed with code ${code}`));
                return;
              }

              const build = exec(attributes_data.data.build_command, {
                cwd: buildDir,
              });
              build.on("exit", (code) => {
                if (code !== 0) {
                  reject(new Error(`Build failed with code ${code}`));
                  return;
                }
                resolve(true);
              });
            });
          });

          const distPath = path.join(buildDir, attributes_data.data.output_dir);
          const indexPath = path.join(distPath, "index.html");

          if (!(await fs.pathExists(indexPath))) {
            await this.fileService.cleanupFiles(
              extractPath,
              zipFile.path,
              null
            );
            await this.fileService.cleanupAllDirectories();
            throw new Error("index.html not found in dist folder");
          }

          indexDir = distPath;
        } catch {
          await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
          await this.fileService.cleanupAllDirectories();
          throw new Error("Build process failed");
        }
      }

      if (!indexDir) {
        await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
        await this.fileService.cleanupAllDirectories();
        throw new Error("index.html not found");
      }

      outputZipPath = path.join(__dirname, "../outputs", `${uuidv4()}}.zip`);
      await fs.ensureDir(path.dirname(outputZipPath));
      await this.fileService.createZip(indexDir, outputZipPath);

      return {
        extractPath,
        outputZipPath,
        indexDir,
      };
    } catch (error) {
      await this.fileService.cleanupFiles(
        extractPath,
        req.file?.path,
        outputZipPath
      );
      await this.fileService.cleanupAllDirectories();
      throw error;
    }
  }

  async handleCreateSite(req: Request) {
    if (!req.file) {
      await this.fileService.cleanupAllDirectories();
      throw new Error("No file uploaded");
    }

    const zipFile = req.file;

    const attributes = req.body.attributes
      ? typeof req.body.attributes === "string"
        ? JSON.parse(req.body.attributes)
        : req.body.attributes
      : null;

    if (!attributes) {
      throw new Error("No attributes provided");
    }

    const attributes_data = inputCreateSiteScheme.safeParse(attributes);

    if (!attributes_data || !attributes_data.success) {
      throw new Error(JSON.stringify(attributes_data.error.errors));
    }

    const extractPath = path.join(
      __dirname,
      "../temp",
      attributes_data.data["site-name"]
    );
    try {
      await this.fileService.extractZip(zipFile.path, extractPath);
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

      await fs.writeJson(
        path.join(extractPath, "ws-resources.json"),
        wsResources,
        {
          spaces: 2,
        }
      );

      const outputZipPath = path.join(
        __dirname,
        "../outputs",
        `${attributes_data.data["site-name"]}.zip`
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

      const zipBuffer = await fs.readFile(outputZipPath);
      const uuid = uuidv4();
      let new_blob_data;
      try {
        new_blob_data = await this.walrusClient.writeBlob({
          blob: zipBuffer,
          deletable: true,
          epochs: Number(attributes_data.data.epochs),
          signer: this.keypair,
          attributes: { uuid },
        });
      } catch {
        console.log("error");
      }

      if (!new_blob_data || new_blob_data == null) {
        await this.fileService.cleanupFiles(
          extractPath,
          zipFile.path,
          outputZipPath
        );
        await this.fileService.cleanupAllDirectories();
        throw new Error("WriteBlob success but data is undefined");
      }

      const blob_id = new_blob_data.blobId;
      const blob_object_id = new_blob_data.blobObject.id.id;
      try {
        await this.walrusClient.executeWriteBlobAttributesTransaction({
          signer: this.keypair,
          blobObjectId: blob_object_id,
          attributes: {
            ...attributes_data.data,
            blobId: blob_id,
            type: "stie",
          },
        });
      } catch {
        console.log("error excute");
      }

      let check_blob_id;
      try {
        check_blob_id = await this.walrusClient.readBlobAttributes({
          blobObjectId: blob_object_id,
        });
      } catch {
        throw new Error("Failed to add blobId to attributes");
      }
      if (!check_blob_id || !check_blob_id.blobId) {
        throw new Error("blobId or attributes is undefined");
      }

      const [response] = await this.taskService.createTask(
        "publish",
        blob_object_id
      );

      await this.fileService.cleanupFiles(
        extractPath,
        zipFile.path,
        outputZipPath
      );
      await this.fileService.cleanupAllDirectories();

      return {
        blob_object_id,
        taskName: response.name,
      };
    } catch (error) {
      await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
      await this.fileService.cleanupAllDirectories();
      throw error;
    }
  }

  async handleUpdateSite(req: Request) {
    if (!req.file) {
      await this.fileService.cleanupAllDirectories();
      throw new Error("No file uploaded");
    }

    const zipFile = req.file;

    const attributes = req.body.attributes
      ? typeof req.body.attributes === "string"
        ? JSON.parse(req.body.attributes)
        : req.body.attributes
      : null;

    if (!attributes) {
      throw new Error("No attributes provided");
    }

    const attributes_data = inputUpdateSiteScheme.safeParse(attributes);
    if (!attributes_data || !attributes_data.success) {
      throw new Error(JSON.stringify(attributes_data.error.errors));
    }
    const { old_object_id, ...updated_data } = attributes_data.data;

    let old_attributes;
    try {
      old_attributes = await this.walrusClient.readBlobAttributes({
        blobObjectId: old_object_id,
      });
    } catch {
      throw new Error("Failed to add blobId to attributes");
    }
    if (!old_attributes || !old_attributes.blobId) {
      throw new Error("blobId or attributes is undefined");
    }

    const old_site_name = old_attributes["site-name"];
    const old_site_id = old_attributes.site_id;

    const extractPath = path.join(
      __dirname,
      "../temp",
      attributes_data.data["site-name"]
    );
    try {
      await this.fileService.extractZip(zipFile.path, extractPath);
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

      await fs.writeJson(
        path.join(extractPath, "ws-resources.json"),
        wsResources,
        {
          spaces: 2,
        }
      );

      const outputZipPath = path.join(
        __dirname,
        "../outputs",
        `${attributes_data.data["site-name"]}.zip`
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

      const zipBuffer = await fs.readFile(outputZipPath);
      const uuid = uuidv4();

      let new_blob_data;
      try {
        new_blob_data = await this.walrusClient.writeBlob({
          blob: zipBuffer,
          deletable: true,
          epochs: Number(updated_data.epochs),
          signer: this.keypair,
          attributes: { uuid },
        });
      } catch {
        console.log("error");
      }

      if (!new_blob_data || new_blob_data == null) {
        await this.fileService.cleanupFiles(
          extractPath,
          zipFile.path,
          outputZipPath
        );
        await this.fileService.cleanupAllDirectories();
        throw new Error("WriteBlob success but data is undefined");
      }

      let attributesUpdate;
      if (old_attributes.site_status && old_attributes.site_status !== null) {
        attributesUpdate = {
          site_status: "0",
          status: "0",
          "site-name": old_site_name,
          site_id: old_site_id,
        };
      } else {
        attributesUpdate = {
          status: "0",
          "site-name": old_site_name,
          site_id: old_site_id,
        };
      }

      const updateBlobAttributes = {
        ...attributesUpdate,
        ...updated_data,
      };

      const blob_id = new_blob_data.blobId;
      const blob_object_id = new_blob_data.blobObject.id.id;
      try {
        await this.walrusClient.executeWriteBlobAttributesTransaction({
          signer: this.keypair,
          blobObjectId: blob_object_id,
          attributes: {
            ...updateBlobAttributes,
            blobId: blob_id,
            type: "stie",
          },
        });
      } catch {
        console.log("error excute");
      }

      let check_blob_id;
      try {
        check_blob_id = await this.walrusClient.readBlobAttributes({
          blobObjectId: blob_object_id,
        });
      } catch {
        throw new Error("Failed to add blobId to attributes");
      }
      if (!check_blob_id || !check_blob_id.blobId) {
        throw new Error("blobId or attributes is undefined");
      }

      const [response] = await this.taskService.createTask(
        "publish",
        blob_object_id
      );

      await this.fileService.cleanupFiles(
        extractPath,
        zipFile.path,
        outputZipPath
      );
      await this.fileService.cleanupAllDirectories();

      return {
        blob_object_id,
        taskName: response.name,
      };
    } catch (error) {
      await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
      await this.fileService.cleanupAllDirectories();
      throw error;
    }
  }

  async handleTransferOwner(req: Request) {
    const object_id = req.query.object_id;
    const new_owner_address = req.query.new_owner_address;

    if (!object_id || !new_owner_address) {
      throw new Error("Object ID and SuiNS are required in query parameters");
    }

    const attributes_data = inputTransferOwnerScheme.safeParse({
      object_id,
      new_owner_address,
    });

    if (!attributes_data.success) {
      throw new Error(JSON.stringify(attributes_data.error.errors));
    }

    await this.walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes_data.data.object_id,
      signer: this.keypair,
      attributes: {
        owner: attributes_data.data.new_owner_address,
      },
    });
  }

  async handleSetAttributes(req: Request) {
    const object_id = req.query.object_id;
    const sui_ns = req.query.sui_ns;

    if (!object_id || !sui_ns) {
      throw new Error("Object ID and SuiNS are required in query parameters");
    }

    const attributes_data = inputSetAttributesScheme.safeParse({
      object_id,
      sui_ns,
    });

    if (!attributes_data.success) {
      throw new Error(JSON.stringify(attributes_data.error.errors));
    }

    await this.walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes_data.data.object_id,
      signer: this.keypair,
      attributes: {
        sui_ns: attributes_data.data.sui_ns,
      },
    });
  }

  async handleDeleteSite(req: Request) {
    const object_id = req.query.object_id;

    if (!object_id) {
      throw new Error("Object ID is required in query parameters");
    }

    const attributes_data = inputDeleteBlobScheme.safeParse({ object_id });

    if (!attributes_data.success) {
      throw new Error(JSON.stringify(attributes_data.error.errors));
    }

    await this.walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes_data.data.object_id,
      signer: this.keypair,
      attributes: { status: "3" },
    });

    const [response] = await this.taskService.createTask(
      "delete_site",
      String(object_id)
    );

    return {
      taskName: response.name,
    };
  }

  async handleAddSiteId(req: Request) {
    const object_id = req.query.object_id;

    if (!object_id) {
      throw new Error("Object ID is required in query parameters");
    }

    const attributes_data = inputDeleteBlobScheme.safeParse({ object_id });

    if (!attributes_data.success) {
      throw new Error(JSON.stringify(attributes_data.error.errors));
    }

    await this.walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes_data.data.object_id,
      signer: this.keypair,
      attributes: { site_status: "0", status: "0" },
    });

    const [response] = await this.taskService.createTask(
      "get_site_id",
      attributes_data.data.object_id
    );

    return {
      taskName: response.name,
    };
  }
}
