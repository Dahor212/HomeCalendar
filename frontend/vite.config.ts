import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Dev proxy: points to Python backend (localhost:8000) or wrangler dev (localhost:8787)
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "http://localhost:8787",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
