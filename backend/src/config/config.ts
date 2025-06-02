import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  suiHex: string;
  blockchain: {
    rpcUrl: string;
    network: string;
    storageTimeout: number;
  };
  github: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  urls: {
    frontend: string;
    backend: string;
  };
  google: {
    credentials: string;
    cloudName: string;
    projectId: string;
    region: string;
    jobId: string;
    serviceAccountEmail: string;
  };
}

const config: Config = {
  port: Number(process.env.BACKEND_PORT) || 5000,
  suiHex: process.env.SUI_HEX || "",
  blockchain: {
    rpcUrl: process.env.SUI_RPC_URL || process.env.CONTRIBUTIONDAO_URL || "",
    network: process.env.SUI_NETWORK || "mainnet",
    storageTimeout: Number(process.env.STORAGE_TIMEOUT) || 60_000,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackUrl: process.env.CALLBACK_URL || "",
  },
  urls: {
    frontend: process.env.FRONTEND_URL || process.env.FRONTEND_URL_FOR_TEST || "",
    backend: process.env.BACKEND_PORT || "",
  },
  google: {
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
    cloudName: process.env.CLOUD_NAME || "",
    projectId: process.env.PROJECT_ID || "",
    region: process.env.REGION || "",
    jobId: process.env.JOB_ID || "",
    serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL || "",
  },
};

export default config;
