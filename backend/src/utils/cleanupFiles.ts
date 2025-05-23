import fs from 'fs-extra';

export async function cleanupFiles(extractPath: string | null, uploadPath: string | null, outputPath: string | null) {
    try {
        await Promise.all([
            extractPath ? fs.remove(extractPath) : Promise.resolve(),
            uploadPath ? fs.remove(uploadPath) : Promise.resolve(),
            outputPath ? fs.remove(outputPath) : Promise.resolve()
        ]);
    } catch (error) {
        console.error("Error during cleanup:", error);
    }
}