import { Router, Request, Response } from "express";
import passport from "passport";
import axios, { AxiosResponse } from "axios";
import { GitHubProfile, Repository } from "../@types/github";

// Extend Request interface for authenticated user
export interface AuthenticatedRequest extends Request {
  user?: GitHubProfile;
}

const router = Router();

// Authentication routes
router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    res.redirect(`${process.env.FRONTEND_URL}?success=true`);
  }
);

// User endpoint
router.get("/api/user", ((req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.isAuthenticated() && authReq.user) {
    res.json({ user: authReq.user.username });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
}) as import("express").RequestHandler);

// Repositories endpoint
router.get("/api/repositories", (async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.isAuthenticated() || !authReq.user) {
    return res.status(401).send("Unauthorized");
  }

  const accessToken = authReq.user.accessToken;

  try {
    const response: AxiosResponse<unknown[]> = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "node.js",
        },
        params: {
          sort: "updated",
          per_page: 100,
          visibility: "all",
        },
      }
    );

    const repositories: Repository[] = (response.data as unknown[]).map(
      (repoUnknown) => {
        const repo = repoUnknown as Record<string, unknown>;
        return {
          id: repo.id as number,
          name: repo.name as string,
          complete_name: repo.full_name as string,
          description: repo.description as string | null,
          private: repo.private as boolean,
          html_url: repo.html_url as string,
          updated_at: repo.updated_at as string,
          language: repo.language as string | null,
          visibility: repo.visibility as string,
          default_branch: repo.default_branch as string,
          owner: (repo.owner as Record<string, unknown>).login as string,
        };
      }
    );

    res.json(repositories);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Repository fetch error:", err.message);
      res
        .status(err.response?.status || 500)
        .json({ error: err.response?.data?.message || err.message });
    } else if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
}) as import("express").RequestHandler);

// Repository download endpoint
router.get("/api/repositories/:owner/:repo/download", (async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.isAuthenticated() || !authReq.user) {
    return res.status(401).send("Unauthorized");
  }

  const accessToken = authReq.user.accessToken;
  const { owner, repo } = req.params;
  const branch = (req.query.branch as string) || "main";

  try {
    // Verify repository access
    const repoCheckResponse: AxiosResponse<unknown> = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "node.js",
        },
      }
    );

    // @ts-expect-error: dynamic property from API
    const defaultBranch = repoCheckResponse.data.default_branch;
    const actualBranch = branch || defaultBranch;

    // Download repository
    const response: AxiosResponse<Buffer> = await axios({
      method: "get",
      url: `https://api.github.com/repos/${owner}/${repo}/zipball/${actualBranch}`,
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "node.js",
      },
      responseType: "arraybuffer",
      maxContentLength: 100 * 1024 * 1024, // 100MB max size
      timeout: 30000, // 30 second timeout
    });

    // Set download headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${repo}-${actualBranch}.zip`
    );
    res.setHeader("Content-Length", response.data.length);

    res.send(response.data);
  } catch (err: unknown) {
    let statusCode = 500;
    let errorMessage = "An unknown error occurred";
    let details = "";
    if (axios.isAxiosError(err)) {
      statusCode = err.response?.status || 500;
      details = err.message;
      if (err.response) {
        switch (statusCode) {
          case 401:
            errorMessage = "Authentication failed. Please log in again.";
            break;
          case 403:
            errorMessage =
              "Access denied. Please ensure you have access to this repository.";
            break;
          case 404:
            errorMessage =
              "Repository not found or you don't have access to it.";
            break;
          case 451:
            errorMessage = "Repository unavailable due to legal reasons.";
            break;
          default:
            errorMessage =
              err.response.data?.message || "Failed to download repository";
        }
      } else if (err.code === "ECONNABORTED") {
        statusCode = 504;
        errorMessage = "Download timed out. The repository might be too large.";
      }
    } else if (err instanceof Error) {
      details = err.message;
    }
    res.status(statusCode).json({
      error: errorMessage,
      details,
    });
  }
}) as import("express").RequestHandler);

// Logout endpoint
router.get("/auth/github/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    // Clear the session cookie
    res.clearCookie("connect.sid", {
      path: "/"
    });
    res.redirect(`${process.env.FRONTEND_URL}`);
  });
});

// Fetch directory contents endpoint
router.get("/api/repositories/:owner/:repo/contents", (async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.isAuthenticated() || !authReq.user) {
    return res.status(401).send("Unauthorized");
  }

  const accessToken = authReq.user.accessToken;
  const { owner, repo } = req.params;
  const branch = (req.query.branch as string) || undefined;

  try {
    // Step 1: Get repo info to determine default branch if not provided
    const repoResponse: AxiosResponse<unknown> = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "node.js",
        },
      }
    );
    const defaultBranch = (repoResponse.data as { default_branch: string })
      .default_branch;
    const branchToUse = branch || defaultBranch;

    // Step 2: Get branch info to get the commit SHA
    const branchResponse: AxiosResponse<unknown> = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches/${branchToUse}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "node.js",
        },
      }
    );
    const treeSha = (
      branchResponse.data as { commit: { commit: { tree: { sha: string } } } }
    ).commit.commit.tree.sha;

    // Step 3: Get the full tree recursively
    const treeResponse: AxiosResponse<unknown> = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "node.js",
        },
      }
    );

    // Step 4: Return the tree (list of all files and directories)
    res.json((treeResponse.data as { tree: unknown[] }).tree);
  } catch (err: unknown) {
    let statusCode = 500;
    let errorMessage = "An unknown error occurred";
    let details = "";
    let data: unknown = undefined;
    if (axios.isAxiosError(err)) {
      statusCode = err.response?.status || 500;
      details = err.message;
      if (err.response) {
        data = err.response.data;
        switch (statusCode) {
          case 401:
            errorMessage = "Authentication failed. Please log in again.";
            break;
          case 403:
            errorMessage =
              "Access denied. Please ensure you have access to this repository.";
            break;
          case 404:
            errorMessage =
              "Repository or branch not found, or you don't have access to it.";
            break;
          default:
            if (
              typeof data === "object" &&
              data !== null &&
              "message" in data &&
              typeof (data as { message?: unknown }).message === "string"
            ) {
              errorMessage = (data as { message: string }).message;
            } else {
              errorMessage = "Failed to fetch repository tree";
            }
        }
      } else if (err.code === "ECONNABORTED") {
        statusCode = 504;
        errorMessage = "Request timed out.";
      }
    } else if (err instanceof Error) {
      details = err.message;
    }
    res.status(statusCode).json({
      error: errorMessage,
      details,
    });
  }
}) as import("express").RequestHandler);

export { router as githubRoutes };
