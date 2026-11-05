import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages serves project sites from /<repository>/.
// Keep the normal root path for local development.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/sensorktp/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['tesseract.js'],
    exclude: ['lucide-react'],
  },
});
