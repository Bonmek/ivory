// src/@types/github.ts
import { Request } from 'express';
import { z } from 'zod';

export interface GitHubProfile {
    username: string;
    accessToken: string;
}

export const RepositorySchema = z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    description: z.string().nullable(),
    private: z.boolean(),
    html_url: z.string().url(),
    updated_at: z.string(),
    language: z.string().nullable(),
    visibility: z.string(),
    default_branch: z.string(),
    owner: z.object({
        login: z.string()
    })
});

export const GitHubBranchSchema = z.object({
    name: z.string(),
    commit: z.object({
        sha: z.string()
    }).nullable(),
    protected: z.boolean()
});

export type GitHubBranchType = z.infer<typeof GitHubBranchSchema>;

export type RepositoryType = z.infer<typeof RepositorySchema>;

export interface Repository {
    id: number;
    name: string;
    complete_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    updated_at: string;
    language: string | null;
    visibility: string;
    default_branch: string;
    owner: string;
}

export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
    } | null;
    protected: boolean;
}

export interface AuthenticatedRequest extends Request {
    user?: GitHubProfile;
}