/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    env: {
      VITE_API_URL: "https://h92rez0gq8.execute-api.us-east-2.amazonaws.com/dev",
      VITE_API_REAL_URL: "https://h92rez0gq8.execute-api.us-east-2.amazonaws.com/dev",
      VITE_COGNITO_REGION: "us-east-1",
      VITE_COGNITO_POOL_ID: "us-east-1_test",
      VITE_COGNITO_CLIENT_ID: "test-client-id",
      VITE_COGNITO_IDENTITY_POOL_ID: "us-east-1:test-pool",
      VITE_COGNITO_ATTENDEE_POOL_ID: "us-east-1_attendee",
      VITE_COGNITO_MOBILE_CLIENT_ID: "test-mobile-client",
      VITE_COGNITO_DOMAIN: "test.auth.us-east-1.amazoncognito.com",
      VITE_IOT_REGION: "us-east-1",
      VITE_IOT_DOMAIN: "test-iot.iot.us-east-1.amazonaws.com",
      VITE_IOT_TOPIC: "test/topic",
      VITE_BLOG_API_URL: "https://test-blog.example.com/wp-json",
      VITE_BLOG_YOAST_URL: "https://test-blog.example.com/yoast",
      VITE_GOOGLE_MAPS_KEY: "test-maps-key",
      VITE_GOOGLE_GEOCODING_KEY: "test-geocoding-key",
      VITE_ENV: "dev",
      VITE_HOST_URL: "https://test.example.com",
      VITE_CHECKIN_URL: "https://test-checkin.example.com",
      VITE_HERO_IMAGES_DOMAIN: "https://test-images.example.com",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/components/ui/**",
      ],
    },
  },
});
