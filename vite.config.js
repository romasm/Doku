import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: {
      '@/lib/utils': path.resolve(__dirname, 'client/src/lib/utils.js'),
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
