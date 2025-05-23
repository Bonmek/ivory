import fs from 'fs-extra';
import path from 'path';

export async function containsJavaScriptFiles(dir: string): Promise<boolean> {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            if (await containsJavaScriptFiles(fullPath)) return true;
        } else if (file.endsWith('.js')) {
            return true;
        }
    }
    return false;
}