// src/services/site.service.ts
import { Request } from 'express';
import { WalrusService } from './walrus.service';
import { TaskService } from './task.service';
import { FileService } from './file.service';
import { inputWriteBlobScheme, inputSetAttributesScheme, inputDeleteBlobScheme } from '../models/inputScheme';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';

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
        console.log('Start processing:', new Date().toISOString());
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

            const extractStart = performance.now();
            await this.fileService.extractZip(zipFile.path, extractPath);
            console.log(`File extraction took: ${(performance.now() - extractStart).toFixed(2)}ms`);

            const attributes = req.body.attributes
                ? typeof req.body.attributes === "string"
                    ? JSON.parse(req.body.attributes)
                    : req.body.attributes
                : {};

            console.log('Received attributes from frontend:', JSON.stringify(attributes, null, 2));
            const attributes_data = inputWriteBlobScheme.safeParse(attributes);

            if (!attributes_data.success) {
                await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
                await this.fileService.cleanupAllDirectories();
                throw new Error(JSON.stringify(attributes_data.error.errors));
            }

            if (attributes_data.data.is_build === "1") {
                if (await this.fileService.containsJavaScriptFiles(extractPath)) {
                    await this.fileService.cleanupFiles(extractPath, zipFile.path, null);
                    await this.fileService.cleanupAllDirectories();
                    throw new Error("JavaScript files found in the uploaded zip. Only static files are allowed when is_build is 1.");
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

                    await this.fileService.executeBuildCommand(attributes_data.data.install_command, buildDir);
                    await this.fileService.executeBuildCommand(attributes_data.data.build_command, buildDir);

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

            const zipStart = performance.now();
            outputZipPath = path.join(__dirname, "../outputs", `${uuidv4()}_${Date.now()}.zip`);
            await this.fileService.createZip(indexDir, outputZipPath);
            console.log(`ZIP creation took: ${(performance.now() - zipStart).toFixed(2)}ms`);

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

    async handleProcessSite(req: Request) {
        if (!req.file) {
            await this.fileService.cleanupAllDirectories();
            throw new Error("No file uploaded");
        }

        const zipFile = req.file;
        const attributes = req.body.attributes
            ? typeof req.body.attributes === "string"
                ? JSON.parse(req.body.attributes)
                : req.body.attributes
            : {};

        const attributes_data = inputWriteBlobScheme.safeParse(attributes);
        if (!attributes_data.success) {
            await this.fileService.cleanupAllDirectories();
            throw new Error(JSON.stringify(attributes_data.error.errors));
        }

        const extractPath = path.join(__dirname, "../temp", attributes_data.data["site-name"]);
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

            await fs.writeJson(path.join(extractPath, "ws-resources.json"), wsResources, {
                spaces: 2,
            });

            const outputZipPath = path.join(__dirname, "../outputs", `${uuidv4()}_${Date.now()}.zip`);
            await this.fileService.createZip(extractPath, outputZipPath);

            const zipBuffer = await fs.readFile(outputZipPath);
            const new_blob_data = await this.walrusService.writeBlob(zipBuffer, {
                ...attributes_data.data,
                forceId: uuidv4()
            });

            if (!new_blob_data) {
                throw new Error("WriteBlob success but data is undefined");
            }

            const blobObjectId = new_blob_data.blobObject.id.id;

            await this.walrusService.executeWriteBlobAttributesTransaction(
                blobObjectId,
                { ...attributes_data.data, blobId: new_blob_data.blobId }
            );

            const check_blob_id = await this.walrusService.readBlobAttributes(blobObjectId);
            if (!check_blob_id || !check_blob_id.blobId) {
                throw new Error("Failed to add blobId to attributes");
            }

            const [response] = await this.taskService.createTask({
                arg1: "publish",
                arg2: blobObjectId,
            });

            await this.fileService.cleanupFiles(extractPath, zipFile.path, outputZipPath);
            await this.fileService.cleanupAllDirectories();

            return {
                blobObjectId,
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

        const [response] = await this.taskService.createTask({
            arg1: "delete_site",
            arg2: String(object_id),
        });

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

        const [response] = await this.taskService.createTask({
            arg1: "get_site_id",
            arg2: String(object_id),
        });

        return {
            taskName: response.name
        };
    }
}