// src/controllers/site.controller.ts
import { Request, Response } from 'express';
import { SiteService } from '../services/site.service';
import { FileService } from '../services/file.service';

export class SiteController {
    private siteService: SiteService;
    private fileService: FileService;

    constructor() {
        this.siteService = new SiteService();
        this.fileService = new FileService();
    }

    test = async (req: Request, res: Response) => {
        res.status(200).json({
            statusCode: 1,
            message: "Test endpoint",
        });
    }

    previewSite = async (req: Request, res: Response) => {
        try {
            const result = await this.siteService.handlePreview(req);
            res.download(result.outputZipPath, "output.zip", async (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                    await this.fileService.cleanupFiles(result.extractPath, req.file?.path ?? null, result.outputZipPath);
                    await this.fileService.cleanupAllDirectories();
                    res.status(500).json({
                        statusCode: 0,
                        error: "Failed to send ZIP file",
                    });
                }
                await this.fileService.cleanupFiles(result.extractPath, req.file?.path ?? null, result.outputZipPath);
                await this.fileService.cleanupAllDirectories();
            });
        } catch (error) {
            console.error("Preview processing error:", error);
            await this.fileService.cleanupFiles(null, req.file?.path ?? null, null);
            await this.fileService.cleanupAllDirectories();
            res.status(500).json({
                statusCode: 0,
                error: "Internal server error during preview processing"
            });
        }
    }

    createSite = async (req: Request, res: Response) => {
        try {
            const result = await this.siteService.handleCreateSite(req);
            res.status(200).json({
                statusCode: 1,
                objectId: result.blob_object_id,
                taskName: `Created task ${result.taskName}`,
            });
        } catch {
            await this.fileService.cleanupFiles(null, req.file?.path ?? null, null);
            await this.fileService.cleanupAllDirectories();
            res.status(500).json({
                statusCode: 0,
                error: "Internal server error during site processing"
            });
        }
    }

    updateSite = async (req: Request, res: Response) => {
        try {
            const result = await this.siteService.handleUpdateSite(req);
            res.status(200).json({
                statusCode: 1,
                objectId: result.blob_object_id,    
            });
        } catch {
            res.status(500).json({
                statusCode: 0,
                error: "Internal server error during site processing"
            });
        }
    }

    setAttributes = async (req: Request, res: Response) => {
        try {
            await this.siteService.handleSetAttributes(req);
            res.status(200).json({
                statusCode: 1,
                message: "Sui service name added to blob attributes successfully",
            });
        } catch (error) {
            res.status(502).json({
                statusCode: 0,
                error: {
                    error_message: "Failed to add sui service name to blob attributes",
                    error_details: error,
                },
            });
        }
    }

    deleteSite = async (req: Request, res: Response) => {
        try {
            const result = await this.siteService.handleDeleteSite(req);
            res.status(200).json({
                statusCode: 1,
                taskName: `Created task ${result.taskName}`,
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 0,
                error: {
                    error_message: "Failed to create task",
                    error_details: error,
                },
            });
        }
    }

    addSiteId = async (req: Request, res: Response) => {
        try {
            const result = await this.siteService.handleAddSiteId(req);
            res.status(200).json({
                statusCode: 1,
                taskName: `Created task ${result.taskName}`,
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 0,
                error: {
                    error_message: "Failed to create task",
                    error_details: error,
                },
            });
        }
    }
}