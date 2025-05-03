import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist folder when building content.js
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/main.tsx')
      },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/content.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // you can use @/components, @/hooks, etc.
    },
  },
});
