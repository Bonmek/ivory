import path from "path";
import fs from 'fs-extra';

export async function cleanupAllDirectories() {
    try {
        const dirs = ['outputs', 'temp', 'uploads'];
        await Promise.all(
            dirs.map(async dir => {
                const dirPath = path.join(__dirname, dir);
                if (await fs.pathExists(dirPath)) {
                    const files = await fs.readdir(dirPath);
                    await Promise.all(
                        files.map(file => fs.remove(path.join(dirPath, file)))
                    );
                    await fs.remove(dirPath);
                }
            })
        );
    } catch (error) {
        console.error("Error cleaning up directories:", error);
    }
}