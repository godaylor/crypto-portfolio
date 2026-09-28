import { defineConfig, devices } from "@playwright/test";
const engine = process.env.FOLIO_BROWSER || "chromium";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.FOLIO_TEST_URL || "http://127.0.0.1:5188",
    trace: process.env.FOLIO_PRIVATE_QA_TOKEN ? "off" : "retain-on-failure",
    ...devices[
      engine === "firefox"
        ? "Desktop Firefox"
        : engine === "webkit"
          ? "Desktop Safari"
          : "Desktop Chrome"
    ],
    launchOptions:
      process.platform === "win32" && engine === "chromium"
        ? {
            executablePath:
              "C:/Program Files/Google/Chrome/Application/chrome.exe",
          }
        : {},
  },
});
