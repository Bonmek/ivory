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
      'REACT_APP_SUI_NETWORK',
      'REACT_APP_BLOB_TYPE',
      'REACT_APP_OWNER_ADDRESS',
      'REACT_APP_SUINS_TYPE',
      'REACT_APP_API_PREVIEW_WEBSITE',
      'REACT_APP_API_CREATE_WEBSITE',
      'REACT_APP_API_PREVIEW_WEBSITE',
      'REACT_APP_API_DELETE_WEBSITE',
      'REACT_APP_API_SET_ATTRIBUTES',
      'REACT_APP_API_ADD_SITE_ID',
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
