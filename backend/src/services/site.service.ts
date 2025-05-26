// src/services/site.service.ts
import { Request } from 'express';
import { WalrusService } from './walrus.service';
import { TaskService } from './task.service';
import { FileService } from './file.service';
import { inputWriteBlobScheme, inputSetAttributesScheme, inputDeleteBlobScheme, inputPreviewSiteScheme } from '../models/inputScheme';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';

export class SiteService {
    private walrusService: WalrusService;
    private taskService: TaskService;
    private fileService: FileService;

    constructor() {
        this.walrusService = new WalrusService();
        this.taskService = new TaskService();
        this.fileService = new FileService();
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
                    throw new Error("JavaScript files found in the uploaded zip. Only static files are allowed.");
                }
                indexDir = await this.fileService.findIndexHtmlPath(extractPath);
            } else if (attributes_data.data.is_build === "0") {
                const buildDir = path.join(extractPath, attributes_data.data.root);
                const packageJsonPath = path.join(buildDir, "package.json");

                if (!await fs.pathExists(packageJsonPath)) {
                    await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
                    await this.fileService.cleanupAllDirectories();
                    throw new Error("package.json not found in specified root directory");
                }

                try {
                    const buildTool = await this.fileService.detectBuildTool(buildDir);
                    if (buildTool) {
                        await this.fileService.modifyBuildConfig(buildTool.configPath, buildTool.tool, attributes_data.data);
                    }

                    await new Promise((resolve, reject) => {
                        const install = exec(attributes_data.data.install_command, { cwd: buildDir });
                        install.on('exit', (code) => {
                            if (code !== 0) {
                                reject(new Error(`Install failed with code ${code}`));
                                return;
                            }

                            const build = exec(attributes_data.data.build_command, { cwd: buildDir });
                            build.on('exit', (code) => {
                                if (code !== 0) {
                                    reject(new Error(`Build failed with code ${code}`));
                                    return;
                                }
                                resolve(true);
                            });
                        })
                    })

                    const distPath = path.join(buildDir, attributes_data.data.output_dir);
                    const indexPath = path.join(distPath, 'index.html');

                    if (!await fs.pathExists(indexPath)) {
                        await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
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
            await this.fileService.createZip(indexDir, outputZipPath);

            return {
                extractPath,
                outputZipPath,
                indexDir
            };

        } catch (error) {
            await this.fileService.cleanupFiles(extractPath, req.file?.path, outputZipPath);
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

        const attributes_data = inputWriteBlobScheme.safeParse(attributes);

        if (!attributes_data || !attributes_data.success) {
            console.log('error', attributes_data.error.errors);
            await this.fileService.cleanupAllDirectories();
            throw new Error(JSON.stringify(attributes_data.error.errors));
        }

        const extractPath = path.join(__dirname, "../temp", attributes_data.data["site-name"]);
        try {
            await this.fileService.extractZip(zipFile.path, extractPath);
            // console.log(attributes_data.data);
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
            }

            await addFilesToZip(extractPath);
            zip.writeZip(outputZipPath);


            const zipBuffer = await fs.readFile(outputZipPath);

            const new_blob_data = await this.walrusService.writeBlob(zipBuffer, {
                ...attributes_data.data
            });

            if (!new_blob_data) {
                throw new Error("WriteBlob success but data is undefined");
            }

            const blob_id = new_blob_data.blobId;
            const blob_object_id = new_blob_data.blobObject.id.id;

            await this.walrusService.executeWriteBlobAttributesTransaction(
                { blobId: blob_id, blobObjectId: blob_object_id }
            );

            let check_blob_id;
            try {
                check_blob_id = await this.walrusService.readBlobAttributes(blob_object_id);
            } catch (error) {
                throw new Error("Failed to add blobId to attributes");
            }

            if (!check_blob_id || !check_blob_id.blobId) {
                throw new Error("blobId or attributes is undefined");
            }
            // console.log('check_blob_id', check_blob_id);
            const [response] = await this.taskService.createTask("publish", blob_object_id);

            await this.fileService.cleanupFiles(extractPath, zipFile.path, outputZipPath);
            await this.fileService.cleanupAllDirectories();

            return {
                blob_object_id,
                taskName: response.name
            };
        } catch (error) {
            await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
            await this.fileService.cleanupAllDirectories();
            throw error;
        }
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

        await this.walrusService.addSuiNS({
            object_id: attributes_data.data.object_id,
            sui_ns: attributes_data.data.sui_ns
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

        await this.walrusService.setDeleteError(
            { object_id: String(object_id), status: "3" }
        );

        const [response] = await this.taskService.createTask("delete_site", String(object_id));

        return {
            taskName: response.name
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

        await this.walrusService.setSiteStatus(
            { object_id: String(object_id), site_status: "0", status: "0" }
        );

        const [response] = await this.taskService.createTask("get_site_id", String(object_id));

        return {
            taskName: response.name
        };
    }
}