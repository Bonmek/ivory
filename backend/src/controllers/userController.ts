import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra';
import unzipper from 'unzipper';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import { cleanupAllDirectories } from '../utils/cleanupAllDirectories';
import { cleanupFiles } from '../utils/cleanupFiles';
import { containsJavaScriptFiles } from '../utils/containsJavaScriptFiles';
import { detectBuildTool } from '../utils/detectBuildTool';
import { modifyBuildConfig } from '../utils/modifyBuildConfig';
import { findIndexHtmlPath } from '../utils/findIndexHtmlPath';

const input = require("../models/inputScheme");

interface ZodError {
    message: string;
    path: string[];
}

export const preview = async (req: Request, res: Response) => {
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
        const attributes_data = input.safeParse(attributes);
        if (!attributes_data.success) {
            await cleanupFiles(extractPath, zipFile.path, null);
            await cleanupAllDirectories();
            res.status(400).json({
                statusCode: 0,
                errors: attributes_data.error.errors.map((err: ZodError) => ({
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

}
