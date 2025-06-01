import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { GitHubProfile } from "../models/githubScheme";
import dotenv from "dotenv";

dotenv.config();

// Passport serialization
passport.serializeUser((user: unknown, done) => done(null, user as object));
passport.deserializeUser((obj: unknown, done) => done(null, obj as object));

// GitHub Strategy configuration
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: ["repo", "read:user"],
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: (error: Error | null, user?: GitHubProfile) => void
    ) => {
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);
