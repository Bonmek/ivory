import path from 'node:path'

import EnvironmentPlugin from 'vite-plugin-environment'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  plugins: [
    EnvironmentPlugin([
      'REACT_APP_TEXT',
      'REACT_APP_SERVER_URL',
      'REACT_APP_API_USER',
      'REACT_APP_API_REPOSITORIES',
      'REACT_APP_API_GITHUB_AUTH',
    ]) as any,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/@types', 'node_modules'],
  },
})
