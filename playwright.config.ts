/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

const port = 4173;
// E2E_BASE_URL: smoke-test an already deployed site, no local server.
// E2E_TARGET=demo: smoke-test the production demo build, served by `vp preview`.
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;
const demo = process.env.E2E_TARGET === "demo";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // Point at a system Chromium when Playwright's own download is unavailable.
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The dev server enables the MSW browser worker (see .env.development), so
  // e2e runs without a backend and shares its handlers with the unit tests.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: demo
          ? `vp run build:demo && vp preview --host 127.0.0.1 --port ${port} --strictPort`
          : `vp dev --host 127.0.0.1 --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
