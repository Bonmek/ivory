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
import {
  inputWriteBlobScheme,
  inputDeleteBlobScheme,
  inputSetAttributesScheme,
  inputUpdateWriteBlobScheme,
} from "./schemas/inputScheme";

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

  const result = inputWriteBlobScheme.safeParse(attributes);

  if (!result.success) {
    res.status(400).json({
      statusCode: 0,
      errors: result.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  let blob_data;
  try {
    blob_data = await walrusClient.writeBlob({
      blob: zipFile,
      deletable: true,
      epochs: Number(result.data.epochs),
      signer: keypair,
      attributes: result.data,
    });
  } catch (error) {
    res.status(502).json({
      statusCode: 0,
      error: {
        error_message: "Failed to write blob to Walrus",
        error_details: error,
      },
    });
    return;
  }

  if (!blob_data) {
    res.status(503).json({
      statusCode: 0,
      error: "WriteBlob success but data is undefined",
    });
    return;
  }

  const blobObjectId = blob_data.blobObject.id.id;

  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: blobObjectId,
      signer: keypair,
      attributes: { blobId: blob_data.blobId },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message:
            "Failed to execute write blob attributes transaction to Walrus",
          error_details: error,
        },
      });
      return;
    }
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
        error_message:
          "Failed to triggering Cloud Run job to publish walrus-site",
        error_details: error,
      },
    });
    return;
  }

  if (response.status == 200) {
    res.status(200).json({
      statusCode: 1,
      details: response.data,
    });
  }
});

app.post("/set-attributes", async (req, res) => {
  console.log("=== /set-attributes called ===");
  console.log("query:", req.query);

  const object_id = req.query.object_id;
  const sui_ns = req.query.sui_ns;

  if (!object_id) {
    res.status(400).json({
      statusCode: 0,
      error: "Object ID is required in query parameters",
    });
    return;
  }

  if (!sui_ns) {
    res.status(400).json({
      statusCode: 0,
      error: "Sui Service name(SuiNS) is required in query parameters",
    });
    return;
  }
  console.log("object_id:", object_id);
  console.log("sui_ns:", sui_ns);

  const result = inputSetAttributesScheme.safeParse({ object_id, sui_ns });
  console.log("result:", result);

  if (!result.success) {
    res.status(400).json({
      statusCode: 0,
      errors: result.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  try {
    console.log("Executing transaction...");
    console.log("result.data.object_id:", result.data.object_id);
    console.log("result.data.sui_ns:", result.data.sui_ns);
    const response = await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: result.data.object_id,
      signer: keypair,
      attributes: { sui_ns: result.data.sui_ns },
    });
    console.log("Transaction executed successfully");
    console.log("response:", response);
  } catch (error) {
    res.status(502).json({
      statusCode: 0,
      error: {
        error_message: "Failed to add sui service name to blob attributes",
        error_details: error,
      },
    });
    console.log("Transaction failed");
    return;
  }
  res.status(200).json({
    statusCode: 1,
    message: "Sui service name added to blob attributes successfully",
  });
  console.log("Transaction executed successfully OKOKOK LALALALA");
});

app.put("/update-blob-n-run-job", upload.single("file"), async (req, res) => {
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

  const result = inputUpdateWriteBlobScheme.safeParse(attributes);
  if (!result.success) {
    res.status(400).json({
      statusCode: 0,
      errors: result.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
    });
    return;
  }

  const { old_object_id, ...updated_data } = result.data;

  const old_attributes = await walrusClient.readBlobAttributes({
    blobObjectId: old_object_id,
  });

  if (!old_attributes) {
    res.status(404).json({
      statusCode: 0,
      error: "blob data not found",
    });
    return;
  }

  const old_site_name = old_attributes["site-name"];
  const old_site_id = old_attributes["site_id"];

  try {
    await walrusClient.executeDeleteBlobTransaction({
      signer: keypair,
      blobObjectId: old_object_id,
    });
  } catch (error) {
    res.status(502).json({
      statusCode: 0,
      error: {
        error_message:
          "Failed to execute delete blob attributes transaction to Walrus",
        error_details: error,
      },
    });
    return;
  }

  let blob_data;
  try {
    blob_data = await walrusClient.writeBlob({
      blob: zipFile,
      deletable: true,
      epochs: Number(result.data.epochs),
      signer: keypair,
      attributes: {
        "site-name": old_site_name,
        ...updated_data,
        site_id: old_site_id,
      },
    });
  } catch (error) {
    res.status(502).json({
      statusCode: 0,
      error: {
        error_message: "Failed to write blob to Walrus",
        error_details: error,
      },
    });
    return;
  }

  if (!blob_data) {
    res.status(503).json({
      statusCode: 0,
      error: "WriteBlob success but data is undefined",
    });
    return;
  }

  const blobObjectId = blob_data.blobObject.id.id;

  try {
    await walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: blobObjectId,
      signer: keypair,
      attributes: { blobId: blob_data.blobId },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(502).json({
        statusCode: 0,
        error: {
          error_message:
            "Failed to execute write blob attributes transaction to Walrus",
          error_details: error,
        },
      });
      return;
    }
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
              args: ["update", blobObjectId],
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
        error_message:
          "Failed to triggering Cloud Run job to update walrus-site",
        error_details: error,
      },
    });
    return;
  }

  if (response.status == 200) {
    res.status(200).json({
      statusCode: 1,
      details: response.data,
    });
  }
});

app.delete("/delete-site", async (req, res) => {
  const object_id = req.query.object_id;

  if (!object_id) {
    res.status(400).json({
      statusCode: 0,
      error: "Object ID is required in query parameters",
    });
    return;
  }

  const result = inputDeleteBlobScheme.safeParse({ object_id });

  if (!result.success) {
    res.status(400).json({
      statusCode: 0,
      error: result.error.errors.map((err) => ({
        error_message: err.message,
        error_field: err.path.join("."),
      })),
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
              args: ["delete", result.data.object_id],
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
        error_message:
          "Failed to triggering Cloud Run job to delete walrus-site",
        error_details: error,
      },
    });
    return;
  }
  if (response.status == 200) {
    res.status(200).json({
      statusCode: 1,
      details: response.data,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
