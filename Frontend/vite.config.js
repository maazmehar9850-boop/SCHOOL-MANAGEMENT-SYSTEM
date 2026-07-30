import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios", "lucide-react", "framer-motion"],
  },
});
