import express from "express";
import cors from "cors";
import siteRoutes from "./routes/site.routes";
import { githubRoutes } from "./routes/github.routes";
import "./github/githubAuth";
import session from "express-session";
import passport from "passport";
import path from "path";
import config from "./config/config";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: config.urls.frontend,
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Length"],
  })
);

app.use(
  session({
    name: "connect.sid",
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  })
);

app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.use(passport.initialize());
app.use(passport.session());
app.use(githubRoutes);

// Routes
app.use("/api", siteRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
