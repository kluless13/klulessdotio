import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: { provider: "v8", include: ["lib/sky/**", "lib/content.ts", "lib/posters.ts", "lib/books.ts", "lib/mode.ts", "lib/contributions.ts", "lib/weather.ts"], thresholds: { lines: 80 } },
  },
})
