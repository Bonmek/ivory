// src/app.ts
import express from 'express';
import cors from 'cors';
import siteRoutes from './routes/site.routes';
import githubRoutes from './routes/github.routes';

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', siteRoutes);
app.use('/api/github', githubRoutes);


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

