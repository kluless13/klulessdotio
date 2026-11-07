import { defineConfig, devices } from "@playwright/test"

const PORT = 3100

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90000,
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: `NEXT_DIST_DIR=.next-e2e NEXT_PUBLIC_SKY_AUDIT=1 npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
