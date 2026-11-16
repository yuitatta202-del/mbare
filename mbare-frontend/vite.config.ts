import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Plugin di Tailwind
  ],
  server: {
    proxy: {
      // Inoltra le richieste della sitemap al backend Express
      '/sitemap.xml': 'http://localhost:3001',
      // Inoltra anche robots.txt al backend
      '/robots.txt': 'http://localhost:3001',
    }
  }
})