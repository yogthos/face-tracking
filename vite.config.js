import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    fs: {
      allow: ['../models', '../src', './models', './src']
    }
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['face-api.js']
  }
})
