// src/routes/github.routes.ts
import { RequestHandler, Router } from 'express';
import passport from 'passport';
import { GitHubController } from '../controllers/github.controller';
import config from '../config/config';

const router = Router();
const githubController = new GitHubController();

// Auth routes
router.get('/auth/github', passport.authenticate('github'));

router.get(
    '/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(`${config.urls.frontend}/create-website?success=true`);
    }
);

router.get('/auth/github/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect(`${config.urls.frontend}`);
    });
});

// API routes
router.get('/api/user', githubController.getUser as RequestHandler);
router.get('/api/repositories', githubController.getRepositories as RequestHandler);
router.get('/api/repositories/:owner/:repo/branches', githubController.getBranches as RequestHandler);
router.get('/api/repositories/:owner/:repo/contents', githubController.getRepositoryContents as RequestHandler);
router.get('/api/repositories/:owner/:repo/download', githubController.downloadRepository as RequestHandler);

export default router;