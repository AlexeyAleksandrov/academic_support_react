import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    })
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://194.135.20.4:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(' Proxying:', req.method, req.url);
            
            // Удаляем Origin header, который может вызывать проблемы с CORS
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            
            // Устанавливаем заголовки как будто запрос идет с того же домена
            proxyReq.setHeader('X-Forwarded-Host', '194.135.20.4');
            proxyReq.setHeader('X-Forwarded-Proto', 'http');
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(' Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
  }
})
