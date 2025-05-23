import fs from 'fs-extra';
import { TypeOf } from 'zod';
import { inputWriteBlobScheme } from '../models/inputScheme';

export async function modifyBuildConfig(configPath: string, tool: string, attributes_data: TypeOf<typeof inputWriteBlobScheme>): Promise<void> {
    const content = await fs.readFile(configPath, 'utf-8');
    let modifiedContent = content;
  
    switch (tool) {
      case 'vite':
        // Add or modify base and build.outDir
        if (!content.includes('base:')) {
          modifiedContent = modifiedContent.replace(
            /export default defineConfig\(\{/,
            `export default defineConfig({\n  base: "./",\n  build: {\n    outDir: "${attributes_data.output_dir}",\n  },`
          );
        }
        break;
      case 'webpack':
        // Add or modify output.path and output.publicPath
        if (!content.includes('output:')) {
          modifiedContent = modifiedContent.replace(
            /module.exports = \{/,
            'module.exports = {\n  output: {\n    path: path.resolve(__dirname, "dist"),\n    publicPath: "./",\n  },'
          );
        }
        break;
      case 'rollup':
        // Add or modify output.dir and output.assetFileNames
        if (!content.includes('output:')) {
          modifiedContent = modifiedContent.replace(
            /export default \{/,
            'export default {\n  output: {\n    dir: "dist",\n    assetFileNames: "[name][extname]",\n  },'
          );
        }
        break;
    }
  
    await fs.writeFile(configPath, modifiedContent, 'utf-8');
  }