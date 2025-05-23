import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    suiHex: string;
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
    port: Number(process.env.BACKEND_URL) || 5000,
    suiHex: process.env.SUI_HEX || '',
    github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        callbackUrl: process.env.CALLBACK_URL || '',
    },
    urls: {
        frontend: process.env.FRONTEND_URL || '',
        backend: process.env.BACKEND_URL || '',
    },
    google: {
        credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
        cloudName: process.env.CLOUD_NAME || '',
        projectId: process.env.PROJECT_ID || '',
        region: process.env.REGION || '',
        jobId: process.env.JOB_ID || '',
        serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL || '',
    },
};

export default config;