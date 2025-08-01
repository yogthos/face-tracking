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
      allow: ['../models', '../src']
    },
    proxy: {
      '/models': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/models/, ''),
        configure: (proxy) => {
          // Handle model file requests properly
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            res.status(500).send('Proxy error occurred');
          });
        }
      }
    }
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['face-api.js']
  }
})
