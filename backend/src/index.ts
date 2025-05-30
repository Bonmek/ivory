import express from 'express';
import cors from 'cors';
import siteRoutes from './routes/site.routes';
import githubRoutes from './routes/github.routes';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import config from './config/config';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: config.urls.frontend ,
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Length"],
  })
);

app.use(
  session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', siteRoutes);
app.use('/api/github', githubRoutes);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

