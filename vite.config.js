import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Оптимизации для production сборки
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log в production
        drop_debugger: true,
      },
    },
    // Разделение на чанки для оптимизации
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor чанки для библиотек
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-dropdown-menu'],
          'table-vendor': ['@tanstack/react-table'],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    // Увеличиваем лимит размера чанка
    chunkSizeWarningLimit: 1000,
    // Оптимизация времени сборки
    sourcemap: false, // Отключаем sourcemaps для production
    reportCompressedSize: false, // Ускоряет сборку
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://194.135.20.4:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
