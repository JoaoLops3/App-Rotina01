import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-ionic": ["@ionic/react", "@ionic/react-router"],
          "vendor-motion": ["framer-motion"],
          "vendor-analytics": ["posthog-js", "@posthog/react"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
});
