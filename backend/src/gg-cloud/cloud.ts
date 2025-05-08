import express, { Request, Response } from "express";
import { JobsClient } from "@google-cloud/run";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Cloud Run Jobs client
const jobsClient = new JobsClient();

interface JobRequestBody {
  objectId: string;
}

// Helper function to execute Cloud Run job
async function executeCloudRunJob(objectId: string): Promise<string> {
  try {
    // Format for Cloud Run Jobs
    const jobName = `projects/${process.env.PROJECT_ID}/locations/${process.env.REGION}/jobs/${process.env.CLOUD_RUN_JOB_NAME}`;

    // Create task with environment variables
    const [response] = await jobsClient.runJob({
      name: jobName,
      overrides: {
        containerOverrides: [
          {
            env: [
              {
                name: "OBJECT_ID",
                value: objectId,
              },
            ],
          },
        ],
      },
    });

    return response.name || "Job execution started";
  } catch (error) {
    console.error("Error executing Cloud Run job:", error);
    throw new Error(
      `Failed to execute Cloud Run job: ${(error as Error).message}`
    );
  }
}

// Endpoint to trigger Cloud Run job
// app.post("/write-blob", upload.single("file"), async (req, res) => {
app.post("/trigger-job", async (req: Request, res: Response) => {
  try {
    const { objectId } = req.body as JobRequestBody;

    if (!objectId) {
      res.status(400).json({ error: "objectId is required" });
      return;
    }

    const jobExecutionName = await executeCloudRunJob(objectId);

    res.status(200).json({
      message: "Cloud Run job triggered successfully",
      jobExecutionName,
    });
  } catch (error) {
    console.error("Error in trigger-job endpoint:", error);
    res.status(500).json({
      error: "Failed to trigger Cloud Run job",
      details: (error as Error).message,
    });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
