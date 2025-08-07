import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_URL || '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});