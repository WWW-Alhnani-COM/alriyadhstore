import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : undefined;

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [react()], // ✅ فقط React plugin، بدون plugins خاصة بـ Replit
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false, // ✅ تعطيل sourcemap لتجنب أخطاء البناء
  },
  server: port
    ? {
        port,
        strictPort: true,
        host: "0.0.0.0",
        allowedHosts: true,
      }
    : {
        host: "0.0.0.0",
        allowedHosts: true,
      },
  preview: port
    ? {
        port,
        host: "0.0.0.0",
        allowedHosts: true,
      }
    : {
        host: "0.0.0.0",
        allowedHosts: true,
      },
});
