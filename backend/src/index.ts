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


dotenv.config();
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

app.post("/write-blob", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const fileBuffer = new Uint8Array(req.file.buffer);

    const attributes = req.body.attributes
      ? typeof req.body.attributes === "string"
        ? JSON.parse(req.body.attributes)
        : req.body.attributes
      : {};

    const { blobId, blobObject } = await walrusClient.writeBlob({
      blob: fileBuffer,
      deletable: false,
      epochs: 1,
      signer: keypair,
      attributes: attributes,
    });

    const blobObjectId =
      typeof blobObject.id === "string" ? blobObject.id : blobObject.id.id;

    // Write blobId in attributes
    await walrusClient
      .executeWriteBlobAttributesTransaction({
        blobObjectId: blobObjectId,
        signer: keypair,
        attributes: { blobId: blobId },
      })

    const attrs = await walrusClient.readBlobAttributes({ blobObjectId });

    res.json({ statusCode: 1, data: { attributes: attrs } });
  } catch (error) {
    if (error instanceof Error) {
      res.json({
        statusCode: 0,
        data: {
          error: {
            message: error.message,
            name: error.name,
            stack: error.stack,
          },
        },
      });
    } else {
      res.json({
        statusCode: 0,
        data: { error: "Unknown error occurred" },
      });
    }
  }
});

// app.get("/read-blob/:blobId", async (req, res) => {
//   try {
//     const { blobId } = req.params;
//     const blob = await walrusClient.readBlob({ blobId });
//     res.send(Buffer.from(blob));
//   } catch (error) {
//     console.error("An unknown error occurred:", error);
//     res.status(500).json({ error: "Unknown error" });
//   }
// });

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

