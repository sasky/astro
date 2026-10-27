import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:4322";

export default defineConfig({
  use: { baseURL },
  webServer: {
    // --ignore-lock keeps astro preview in the foreground; Astro 7 otherwise
    // backgrounds it under AI agents, and Playwright sees the command exit.
    command: "npm run preview -- --port 4322 --ignore-lock",
    url: baseURL,
    reuseExistingServer: true,
  },
  projects: [
    { name: "e2e", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "baseline", testDir: "tests/visual", testMatch: "baseline.spec.ts", use: { ...devices["Desktop Chrome"] } },
    { name: "compare", testDir: "tests/visual", testMatch: "compare.spec.ts", use: { ...devices["Desktop Chrome"] } },
  ],
});
