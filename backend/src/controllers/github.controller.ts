// src/controllers/github.controller.ts
import { Request, Response } from 'express';
import { GitHubService } from '../services/github.service';
import { AuthenticatedRequest } from '../models/githubScheme';
import AdmZip from 'adm-zip';
import archiver from 'archiver';
import stream from 'stream';

export class GitHubController {
    private githubService: GitHubService;

    constructor() {
        this.githubService = new GitHubService();
    }

    getUser = async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.isAuthenticated() || !authReq.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        try {
            const user = await this.githubService.getUser(authReq.user.accessToken);
            res.json({ user: user.username });
        } catch {
            res.status(401).json({ error: 'Failed to fetch user data' });
        }
    }

    getRepositories = async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.isAuthenticated() || !authReq.user) {
            return res.status(401).send('Unauthorized');
        }

        try {
            const repositories = await this.githubService.getRepositories(authReq.user.accessToken);
            res.json(repositories);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unknown error' });
            }
        }
    }

    getBranches = async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.isAuthenticated() || !authReq.user) {
            return res.status(401).send('Unauthorized');
        }

        const { owner, repo } = req.params;

        try {
            const branches = await this.githubService.getBranches(
                authReq.user.accessToken,
                owner,
                repo
            );
            res.json(branches);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to fetch branches' });
            }
        }
    }

    getRepositoryContents = async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.isAuthenticated() || !authReq.user) {
            return res.status(401).send('Unauthorized');
        }

        const { owner, repo } = req.params;
        const branch = req.query.branch as string | undefined;

        try {
            const contents = await this.githubService.getRepositoryContents(
                authReq.user.accessToken,
                owner,
                repo,
                branch
            );
            res.json(contents);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to fetch repository contents' });
            }
        }
    }

    downloadRepository = async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.isAuthenticated() || !authReq.user) {
            return res.status(401).send('Unauthorized');
        }

        const { owner, repo } = req.params;
        const branch = (req.query.branch as string) || 'main';

        try {
            const data = await this.githubService.downloadRepository(
                authReq.user.accessToken,
                owner,
                repo,
                branch
            );

            const zip = new AdmZip(data);
            const entries = zip.getEntries();
            const archive = archiver('zip', { zlib: { level: 9 } });
            const passthrough = new stream.PassThrough();

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=${repo}-${branch}-flat.zip`);

            archive.pipe(passthrough);
            passthrough.pipe(res);

            for (const entry of entries) {
                const pathParts = entry.entryName.split('/');
                if (pathParts.length > 1) {
                    const flattenedPath = pathParts.slice(1).join('/');
                    if (!entry.isDirectory) {
                        archive.append(entry.getData(), { name: flattenedPath });
                    }
                }
            }

            await archive.finalize();
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to download repository' });
            }
        }
    }
}