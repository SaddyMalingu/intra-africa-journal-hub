// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ✨ Add this import

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✨ Add this alias
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Flask backend address
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
