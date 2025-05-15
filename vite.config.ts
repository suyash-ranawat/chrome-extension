import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, 'src/pages/panel/main.tsx'),    
        devtools: resolve(__dirname, 'src/devtools/main.tsx'),    
        background: resolve(__dirname, 'src/background/main.ts')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // you can use @/components, @/hooks, etc.
    },
  },
  server: {
    port: 5173, // Port for local development
    watch: {
      usePolling: true, // Enable polling to detect file changes
    },
  }
});
