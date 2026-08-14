import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: "::",
    port: 8080,
    // Proxy the API in dev so the browser sees one origin. Without this the
    // httpOnly auth cookies are cross-site, which needs SameSite=None+Secure
    // and therefore HTTPS - unavailable on localhost.
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_TARGET ?? "http://127.0.0.1:8000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        // Split the heaviest third-party code so a menu browse does not pay
        // for the charting library the vendor dashboard needs.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          apollo: ["@apollo/client", "graphql", "graphql-ws"],
          charts: ["recharts"],
        },
      },
    },
  },
}));
