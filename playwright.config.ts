import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const basePath = process.env.BASE_PATH ?? "/";
const baseUrl = `http://127.0.0.1:4173${basePath}`;
const previewCommand = `./node_modules/.bin/vite preview --host 127.0.0.1 --port 4173 --base ${basePath}`;
const needsBuild = !isCI || basePath !== "/";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { outputFolder: "output/playwright/report" }]],
  outputDir: "output/playwright/test-results",
  use: {
    baseURL: baseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: needsBuild ? `pnpm build && ${previewCommand}` : previewCommand,
    url: baseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
