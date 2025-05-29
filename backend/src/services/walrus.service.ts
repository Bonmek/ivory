// src/services/walrus.service.ts
import { WalrusClient } from "@mysten/walrus";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import config from "../config/config";
import { TypeOf } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  inputSetDeleteErrorScheme,
  inputSetSiteStatusScheme,
  inputSetSuiNameServiceScheme,
  inputWriteBlobScheme,
} from "../models/inputScheme";

export class WalrusService {
  private walrusClient: WalrusClient;
  private keypair: Ed25519Keypair;

  constructor() {
    const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
    this.walrusClient = new WalrusClient({
      network: "mainnet",
      suiClient,
      storageNodeClientOptions: {
        timeout: config.blockchain.storageTimeout,
      },
    });
    const hex = process.env.SUI_HEX || "";
    const secretKey = Uint8Array.from(Buffer.from(hex, "hex"));
    this.keypair = Ed25519Keypair.fromSecretKey(
     secretKey
    );
  }

  async writeBlob(
    blob: Buffer,
    attributes: TypeOf<typeof inputWriteBlobScheme>
  ) {
    try {
      const uuid = uuidv4();
      const result = await this.walrusClient.writeBlob({
        blob,
        deletable: true,
        epochs: Number(attributes.epochs),
        signer: this.keypair,
        attributes: { ...attributes, uuid, type: "stie" },
      });
      return result;
    } catch {
      return null;
    }
  }

  async executeWriteBlobAttributesTransaction({
    blobId,
    blobObjectId,
  }: {
    blobId: string;
    blobObjectId: string;
  }) {
    try {
      await this.walrusClient.executeWriteBlobAttributesTransaction({
        signer: this.keypair,
        blobObjectId: blobObjectId,
        attributes: { blobId: blobId },
      });
      return true;
    } catch {
      return false;
    }
  }

  async setSiteStatus(attributes: TypeOf<typeof inputSetSiteStatusScheme>) {
    return await this.walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes.object_id,
      signer: this.keypair,
      attributes,
    });
  }

  async setDeleteError(attributes: TypeOf<typeof inputSetDeleteErrorScheme>) {
    return await this.walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes.object_id,
      signer: this.keypair,
      attributes,
    });
  }

  async addSuiNS(attributes: TypeOf<typeof inputSetSuiNameServiceScheme>) {
    return await this.walrusClient.executeWriteBlobAttributesTransaction({
      blobObjectId: attributes.object_id,
      signer: this.keypair,
      attributes: { ...attributes, sui_ns: attributes.sui_ns },
    });
  }

  async readBlobAttributes(blobObjectId: string) {
    try {
      const result = await this.walrusClient.readBlobAttributes({
        blobObjectId,
      });
      return result;
    } catch {
      return null;
    }
  }
}
