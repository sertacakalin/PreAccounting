import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Frontend development server port
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Backend server
        changeOrigin: true,
      },
       '/auth': {
        target: 'http://localhost:8080', // Backend server
        changeOrigin: true,
      }
    }
  }
});
