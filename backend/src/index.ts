import express from "express";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import multer from "multer";
import dotenv from "dotenv";
import { Transaction } from "@mysten/sui/transactions";

const tx = new Transaction();
dotenv.config();
const upload = multer();
const app = express();
app.use(express.json());

const hex = process.env.SUI_Hex || "";
const secretKey = Uint8Array.from(Buffer.from(hex, "hex"));
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
const walrusClient = new WalrusClient({
  network: "mainnet",
  suiClient,
});

app.post("/write-blob", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const fileBuffer = new Uint8Array(req.file.buffer);

    let attributes = req.body.attributes
      ? typeof req.body.attributes === "string"
        ? JSON.parse(req.body.attributes)
        : req.body.attributes
      : {};

    const { blobId, blobObject } = await walrusClient.writeBlob({
      blob: fileBuffer,
      deletable: false,
      epochs: 1,
      signer: keypair,
      attributes,
    });

    const blobObjectId =
      typeof blobObject.id === "string" ? blobObject.id : blobObject.id.id;

    // Write blobId in attributes
    const { digest } = await walrusClient.executeWriteBlobAttributesTransaction(
      {
        blobObjectId: blobObjectId,
        signer: keypair,
        attributes: { blobId: blobId },
      }
    );
    
    // Wait for transaction to be confirmed
    const txResult = await suiClient.getTransactionBlock({ digest });
    const status = txResult.effects?.status?.status;
    console.log("Transaction status:", status);
    const attrs = await walrusClient.readBlobAttributes({ blobObjectId });

    res.json({ blobId, objectId: blobObjectId, attributes: attrs });
  } catch (error) {
    next(error);
  }
});

app.get("/read-blob/:blobId", async (req, res) => {
  try {
    const { blobId } = req.params;
    const blob = await walrusClient.readBlob({ blobId });
    res.send(Buffer.from(blob));
  } catch (error) {
    console.error("An unknown error occurred:", error);
    res.status(500).json({ error: "Unknown error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
