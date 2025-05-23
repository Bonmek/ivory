import fs from 'fs-extra';
import path from 'path';

export async function findIndexHtmlPath(dir: string): Promise<string | null> {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            const found = await findIndexHtmlPath(fullPath);
            if (found) return found;
        } else if (file === "index.html") {
            return path.dirname(fullPath);
        }
    }
    return null;
}