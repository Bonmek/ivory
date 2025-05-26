// src/services/github.service.ts
import axios from 'axios';
import { Repository, GitHubBranch, RepositoryType, GitHubBranchType } from '../models/githubScheme';

export class GitHubService {
    async getUser(accessToken: string): Promise<{ username: string }> {
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return { username: response.data.login };
    }

    async getRepositories(accessToken: string): Promise<Repository[]> {
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'node.js',
            },
            params: {
                sort: 'updated',
                per_page: 100,
                visibility: 'all',
            },
        });

        return response.data.map((repo: RepositoryType) => ({
            id: repo.id,
            name: repo.name,
            complete_name: repo.full_name,
            description: repo.description,
            private: repo.private,
            html_url: repo.html_url,
            updated_at: repo.updated_at,
            language: repo.language,
            visibility: repo.visibility,
            default_branch: repo.default_branch,
            owner: repo.owner.login
        }));
    }

    async getBranches(accessToken: string, owner: string, repo: string): Promise<GitHubBranch[]> {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data.map((branch: GitHubBranchType) => ({
            name: branch.name,
            commit: branch.commit ? branch.commit.sha : null,
            protected: branch.protected || false,
        }));
    }

    async getRepositoryContents(accessToken: string, owner: string, repo: string, branch?: string) {
        const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'node.js',
            },
        });

        const defaultBranch = repoResponse.data.default_branch;
        const branchToUse = branch || defaultBranch;

        const branchResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/branches/${branchToUse}`,
            {
                headers: {
                    Authorization: `token ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'node.js',
                },
            }
        );

        const treeSha = branchResponse.data.commit.commit.tree.sha;

        const treeResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
            {
                headers: {
                    Authorization: `token ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'node.js',
                },
            }
        );

        return treeResponse.data.tree;
    }

    async downloadRepository(accessToken: string, owner: string, repo: string, branch: string = 'main') {
        const response = await axios({
            method: 'get',
            url: `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`,
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'node.js',
            },
            responseType: 'arraybuffer',
            maxContentLength: 100 * 1024 * 1024,
            timeout: 30000,
        });

        return response.data;
    }
}