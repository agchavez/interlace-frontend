import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'logo.png', 'icons/*.png'],
      manifest: false, // Deshabilitamos el manifest automático por ahora
      devOptions: {
        enabled: false // Deshabilitar en desarrollo para probar
      }
    })
  ],
  server: {
    port: 3000
  }
})
