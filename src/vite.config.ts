import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
  // Add this build configuration
  build: {
    outDir: "dist", // Outputs to the 'dist' folder at the project root
  },
}));