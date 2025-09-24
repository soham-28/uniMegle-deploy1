import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Enable HTTPS only when explicitly requested via env
    https: process.env.VITE_USE_HTTPS === 'true' && fs.existsSync('./certs/key.pem') && fs.existsSync('./certs/cert.pem')
      ? {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
      }
      : false
  },
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    https: process.env.VITE_USE_HTTPS === 'true' && fs.existsSync('./certs/key.pem') && fs.existsSync('./certs/cert.pem')
      ? {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
      }
      : false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
