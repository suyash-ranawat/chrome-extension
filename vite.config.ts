import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, "src/pages/panel/main.tsx"),
        devtools: resolve(__dirname, "src/devtools/main.tsx"),
        background: resolve(__dirname, "src/background/main.ts"),
        contentScript: resolve(__dirname, "src/content/main.tsx"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  publicDir: "public",

  server: {
    port: 5173, 
    watch: {
      usePolling: true, 
    },
  },
});
