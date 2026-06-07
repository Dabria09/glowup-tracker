import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve as resolvePath } from 'path';
import base44Plugin from '@base44/vite-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), base44Plugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': resolvePath(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});