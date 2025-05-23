// src/app.ts
import express from 'express';
import cors from 'cors';
import siteRoutes from './routes/site.routes';
import githubRoutes from './routes/github.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', siteRoutes);
app.use('/api/github', githubRoutes);

export default app;