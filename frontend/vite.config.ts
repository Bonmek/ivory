import * as path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    react(),
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
    ]),
  ],
  publicDir: 'public',
  server: {
    host: true,
    port: 3000,
    // Proxy configuration to solve CORS issues with Sui API
    // This forwards requests from /api/sui to the actual Sui API endpoint
    proxy: {
      '/api/sui': {
        // The actual target API we want to call
        target: 'https://fullnode.mainnet.sui.io',
        // Required for CORS - changes the Origin header to match the target URL
        changeOrigin: true,
        // Removes the /api/sui prefix when forwarding the request
        rewrite: (path) => path.replace(/^\/api\/sui/, ''),
        // Additional configuration for debugging and error handling
      },
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
})
