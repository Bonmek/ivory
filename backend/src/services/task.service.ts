// src/services/task.service.ts
import { CloudTasksClient } from '@google-cloud/tasks';
import config from '../config/config';

export class TaskService {
    private tasksClient: CloudTasksClient;
    private parent: string;

    constructor() {
        this.tasksClient = new CloudTasksClient();
        this.parent = this.tasksClient.queuePath(
            config.google.projectId,
            config.google.region,
            config.google.jobId
        );
    }

    async createTask(payload: Record<string, string>) {
        return await this.tasksClient.createTask({
            parent: this.parent,
            task: {
                httpRequest: {
                    httpMethod: "POST",
                    url: `https://${config.google.jobId}.${config.google.region}.run.app`,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: Buffer.from(JSON.stringify(payload)).toString("base64"),
                    oidcToken: {
                        serviceAccountEmail: config.google.serviceAccountEmail,
                    },
                },
            },
        });
    }
}