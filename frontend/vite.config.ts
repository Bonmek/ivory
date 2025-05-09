import * as path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    EnvironmentPlugin([
      'REACT_APP_TEXT',
      'REACT_APP_SERVER_URL',
      'REACT_APP_API_USER',
      'REACT_APP_API_REPOSITORIES',
      'REACT_APP_API_GITHUB_AUTH',
      'REACT_APP_API_WRITE_BLOB_N_RUN_JOB',
      'REACT_APP_SUI_NETWORK',
      'REACT_APP_BLOB_TYPE',
      'REACT_APP_OWNER_ADDRESS',
    ]),
  ],
  publicDir: 'public',
  server: {
    host: true,
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
