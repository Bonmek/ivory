import path from "path";
import fs from "fs-extra";

export async function detectBuildTool(buildDir: string): Promise<{ tool: string; configPath: string } | null> {
    const configFiles = [
      { tool: 'vite', patterns: ['vite.config.ts', 'vite.config.js'] },
      { tool: 'webpack', patterns: ['webpack.config.js', 'webpack.config.ts'] },
      { tool: 'rollup', patterns: ['rollup.config.js', 'rollup.config.ts'] }
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