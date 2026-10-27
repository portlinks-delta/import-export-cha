import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: {
    baseURL: process.env.TEST_URL || "http://localhost:3001",
    channel: "chrome",
    headless: true,
    viewport: { width: 1536, height: 1024 },
  },
  workers: 1,
  reporter: "list",
});
