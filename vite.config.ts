import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy TTS API requests to avoid CORS issues in development
      '/api/tts': {
        target: 'https://api.celestiai.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '/api/v1/tts-turbo/tts-hutao'),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        }
      },
      // Generic proxy for audio files - simplified version
      '/proxy-audio': {
        target: 'https://example.com', // placeholder, will be overridden
        changeOrigin: true,
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          dndkit: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
        }
      }
    }
  }
})