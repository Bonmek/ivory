import express from "express";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import "./github/githubAuth";
import { githubRoutes } from "./github/routes";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { inputScheme } from "./schemas/inputScheme";

dotenv.config();
const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
const upload = multer();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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

app.use(passport.initialize());
app.use(passport.session());
app.use(githubRoutes);

const hex = process.env.SUI_Hex || "";
const secretKey = Uint8Array.from(Buffer.from(hex, "hex"));
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
const walrusClient = new WalrusClient({
  network: "mainnet",
  suiClient,
});

app.post("/write-blob-n-run-job", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      statusCode: 0,
      error: "No file uploaded",
    });
    return;
  }
  const zipFile = new Uint8Array(req.file.buffer);
  const attributes = req.body.attributes
    ? typeof req.body.attributes === "string"
      ? JSON.parse(req.body.attributes)
      : req.body.attributes
    : {};

  const result = inputScheme.safeParse(attributes);
  if (!result.success) {
    res.status(400).json({
      statusCode: 0,
      errors: result.error.errors.map((err) => ({
        error_field: err.path.join("."),
        error_message: err.message,
      })),
    });
    return;
  }

  let blobData;
  try {
    blobData = await walrusClient.writeBlob({
      blob: zipFile,
      deletable: false,
      epochs: Number(result.data.epochs),
      signer: keypair,
      attributes: attributes,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      error: { error_message: "Internal server error", error_details: error },
    });
    return;
  }

  if (blobData.blobObject.certified_epoch == null) {
    res.status(400).json({
      statusCode: 0,
      error: {
        error_message: "Write blob data failed",
        error_details: "Epoch not found, Blob not certified",
      },
    });
    return;
  }

  const blobObjectId =
    typeof blobData.blobObject.id === "string"
      ? blobData.blobObject.id
      : blobData.blobObject.id.id;

  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: blobObjectId,
      signer: keypair,
      attributes: { blobId: blobData.blobId },
    });
  } catch (error) {
    res.status(400).json({
      statusCode: 0,
      error: {
        error_message: "Error writing blob data attributes",
        error_details: error,
      },
    });
    return;
  }

  const url = `https://run.googleapis.com/v2/projects/${process.env.PROJECT_ID}/locations/${process.env.REGION}/jobs/${process.env.CLOUD_RUN_JOB_NAME}:run`;
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  let response;
  try {
    response = await axios.post(
      url,
      {
        overrides: {
          containerOverrides: [
            {
              args: ["publish", blobObjectId],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      error: {
        error_message: "Error triggering Cloud Run job",
        error_details: error,
      },
    });
    return;
  }
  if (response.status !== 200) {
    res.status(200).json({
      statusCode: 1,
      details: response.data,
      message: "Cloud Run job triggered successfully",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
