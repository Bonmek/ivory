declare module '@google-cloud/run' {
    export class JobsClient {
      runJob(request: {
        name: string;
        overrides?: {
          containerOverrides?: Array<{
            env?: Array<{
              name: string;
              value: string;
            }>;
          }>;
        };
      }): Promise<[{ name: string }]>;
    }
}