js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['firebase/firestore'],
    },
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      formats: ['es'],
    },
    outDir: 'dist/lib',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});