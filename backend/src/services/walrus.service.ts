// src/services/walrus.service.ts
import { WalrusClient } from "@mysten/walrus";
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import config from '../config/config';
import { TypeOf } from "zod";
import { v4 as uuidv4 } from "uuid";
import { inputSetDeleteErrorScheme, inputSetSiteStatusScheme, inputSetSuiNSScheme, inputWriteBlobScheme } from "../models/inputScheme";

export class WalrusService {
    private walrusClient: WalrusClient;
    private keypair: Ed25519Keypair;



    constructor() {
        const suiClient = new SuiClient({ url: config.blockchain.rpcUrl });
        this.walrusClient = new WalrusClient({
            network: "mainnet",
            suiClient,
            storageNodeClientOptions: {
                timeout: config.blockchain.storageTimeout,
                onError: (error) => console.log(error),
            },
        });

        this.keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(Buffer.from(config.suiHex, 'hex')));
    }

    async writeBlob(blob: Buffer, attributes: TypeOf<typeof inputWriteBlobScheme>) {
        return await this.walrusClient.writeBlob({
            blob,
            deletable: true,
            epochs: Number(attributes.epochs),
            signer: this.keypair,
            attributes: { ...attributes, forceId: uuidv4() },
        });
    }

    async executeWriteBlobAttributesTransaction(blobObjectId: string, attributes: TypeOf<typeof inputWriteBlobScheme>) {
        return await this.walrusClient.executeWriteBlobAttributesTransaction({
            blobObjectId,
            signer: this.keypair,
            attributes,
        });
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

    async addSuiNS(attributes: TypeOf<typeof inputSetSuiNSScheme>) {
        return await this.walrusClient.executeWriteBlobAttributesTransaction({
            blobObjectId: attributes.object_id,
            signer: this.keypair,
            attributes: { ...attributes, sui_ns: attributes.sui_ns },
        });
    }

    async readBlobAttributes(blobObjectId: string) {
        return await this.walrusClient.readBlobAttributes({
            blobObjectId,
        });
    }
}