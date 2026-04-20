import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // No registrar SW automáticamente - usamos push-sw.js manual
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'logo.png', 'icons/*.png', 'apple-touch-icon.png', 'manifest.webmanifest'],
      manifest: false,
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 3000
  }
})
