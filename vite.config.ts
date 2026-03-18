import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // amazon-cognito-identity-js uses Node.js `global` — polyfill it
    global: "globalThis",
  },
  server: {
    port: 5173,
  },
  build: {
    target: "ES2022",
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts"],
          "vendor-excel": ["exceljs"],
          "vendor-motion": ["framer-motion"],
          "vendor-pdf": ["@react-pdf/renderer"],
          "vendor-maps": ["@react-google-maps/api"],
          "vendor-cognito": ["amazon-cognito-identity-js"],
        },
      },
    },
  },
});
