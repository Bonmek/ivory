// src/services/file.service.ts
import fs from "fs-extra";
import path from "path";
import unzipper from "unzipper";
import AdmZip from "adm-zip";
import { TypeOf } from "zod";
import { inputPreviewSiteScheme } from "../models/inputScheme";

export class FileService {
  async extractZip(zipPath: string, extractPath: string) {
    await fs.ensureDir(extractPath);
    await fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();
  }

  async createZip(sourcePath: string, outputPath: string) {
    await fs.ensureDir(path.dirname(outputPath));
    const zip = new AdmZip();
    zip.addLocalFolder(sourcePath);
    zip.writeZip(outputPath);
  }

  async cleanupFiles() {
    const deleteFilesInDir = async (dirPath: string) => {
      try {
      const exists = await fs.pathExists(dirPath);
      if (!exists) return;

      const stat = await fs.stat(dirPath);
      if (stat.isDirectory()) {
        await fs.emptyDir(dirPath);
      } else {
        console.warn(`${dirPath} is not a directory. Skipping.`);
      }
    } catch (err) {
      console.error(`Error cleaning up files in ${dirPath}:`, err);
    }
  };
    await deleteFilesInDir("./src/temp/");
    await deleteFilesInDir("./uploads/");
    await deleteFilesInDir("./src/outputs/");
  }

  async containsJavaScriptFiles(dirPath: string): Promise<boolean> {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        if (await this.containsJavaScriptFiles(fullPath)) return true;
      } else if (
        file.endsWith(".js") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".tsx")
      ) {
        return true;
      }
    }
    return false;
  }

  async findIndexHtmlPath(dirPath: string): Promise<string | null> {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        const found = await this.findIndexHtmlPath(fullPath);
        if (found) return found;
      } else if (file === "index.html") {
        return path.dirname(fullPath);
      }
    }
    return null;
  }

  //================================Need Test =================================//
  async detectBuildTool(buildDir: string) {
    const packageJsonPath = path.join(buildDir, "package.json");
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      if (packageJson.dependencies?.next) {
        return {
          tool: "next",
          configPath: path.join(buildDir, "next.config.js"),
        };
      } else if (packageJson.dependencies?.react) {
        return {
          tool: "react",
          configPath: path.join(buildDir, "package.json"),
        };
      }
    }
    return null;
  }

  async detectBuildTool2(
    buildDir: string
  ): Promise<{ tool: string; configPath: string } | null> {
    const configFiles = [
      { tool: "vite", patterns: ["vite.config.ts", "vite.config.js"] },
      { tool: "webpack", patterns: ["webpack.config.js", "webpack.config.ts"] },
      { tool: "rollup", patterns: ["rollup.config.js", "rollup.config.ts"] },
    ];

    for (const { tool, patterns } of configFiles) {
      for (const pattern of patterns) {
        const configPath = path.join(buildDir, pattern);
        if (await fs.pathExists(configPath)) {
          return { tool, configPath };
        }
      }
    }
    return null;
  }
  //=============================================================================//

  async modifyBuildConfig(
    configPath: string,
    tool: string,
    attributes_data: TypeOf<typeof inputPreviewSiteScheme>
  ): Promise<void> {
    const content = await fs.readFile(configPath, "utf-8");
    let modifiedContent = content;

    switch (tool) {
      case "vite":
        // Add or modify base and build.outDir
        if (!content.includes("base:")) {
          modifiedContent = modifiedContent.replace(
            /export default defineConfig\(\{/,
            `export default defineConfig({\n  base: "./",\n  build: {\n    outDir: "${attributes_data.output_dir}",\n  },`
          );
        }
        break;
      case "webpack":
        // Add or modify output.path and output.publicPath
        if (!content.includes("output:")) {
          modifiedContent = modifiedContent.replace(
            /module.exports = \{/,
            'module.exports = {\n  output: {\n    path: path.resolve(__dirname, "dist"),\n    publicPath: "./",\n  },'
          );
        }
        break;
      case "rollup":
        // Add or modify output.dir and output.assetFileNames
        if (!content.includes("output:")) {
          modifiedContent = modifiedContent.replace(
            /export default \{/,
            'export default {\n  output: {\n    dir: "dist",\n    assetFileNames: "[name][extname]",\n  },'
          );
        }
        break;
    }

    await fs.writeFile(configPath, modifiedContent, "utf-8");
  }

  // async validateFile(configPath: string, tool: string, attributes_data: TypeOf<typeof inputPreviewSiteScheme>): Promise<void> {

  // }
}
