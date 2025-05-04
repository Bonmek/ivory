import express from 'express';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { bech32 } from 'bech32';
import dotenv from 'dotenv';

dotenv.config(); 

const SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY || '';
// Set private key here
// Note: This is a testnet key. Do not use this in production.

const decoded = bech32.decode(SUI_PRIVATE_KEY);
const privKeyBytes = bech32.fromWords(decoded.words);
const secretKey = Uint8Array.from(privKeyBytes.slice(1)); // Remove the first byte
const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(secretKey));

console.log(keypair.getPublicKey().toSuiAddress());

// Initialize Sui and Walrus clients
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});

const app = express();
app.use(express.json());

// Endpoint to write a blob
app.post('/write-blob', async (req, res) => {
  try {
    // Example: encode string to Uint8Array
    const file = new TextEncoder().encode(req.body.content);

    const { blobId } = await walrusClient.writeBlob({
      blob: file,
      deletable: false,
      epochs: 1,
      signer: keypair,
    });

    res.json({ blobId });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Endpoint to read a blob
app.get('/read-blob/:blobId', async (req, res) => {
  try {
    const { blobId } = req.params;
    const blob = await walrusClient.readBlob({ blobId });
    res.send(Buffer.from(blob));
  } catch (error) {
    console.error('An unknown error occurred:', error);
    res.status(500).json({ error: 'Unknown error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
