import { defineConfig, devices } from "@playwright/test";

import { resolvePlaywrightServer } from "./lib/testing/playwright-server";

const localServer = resolvePlaywrightServer(process.env);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "line",
  use: {
    baseURL: localServer.baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: localServer.command,
    url: localServer.baseURL,
    reuseExistingServer: localServer.reuseExistingServer,
    timeout: 120_000,
    env: {
      ASTRAA_DISABLE_SENTRY_SOURCE_MAPS: "true",
      ASTRAA_E2E_FIXTURES: "true",
      ASTRAA_ENABLE_ANALYTICS: "false",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-reduced-motion",
      testMatch: /accessibility\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: { reducedMotion: "reduce" },
      },
    },
  ],
});
