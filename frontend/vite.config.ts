import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ["@mui/material", "@emotion/react", "@emotion/styled"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});
