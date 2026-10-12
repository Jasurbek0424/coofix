import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Dev only: same-origin /api like production (Caddy). Override with API_TARGET=http://localhost:8001
  const target = env.API_TARGET ?? "http://localhost:8000";
  return {
    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    server: {
      port: 5173,
      proxy: {
        "/api": { target, changeOrigin: false },
        "/media": { target, changeOrigin: false },
      },
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            if (id.includes("node_modules")) return "vendor";
            return undefined;
          },
        },
      },
    },
  };
});
