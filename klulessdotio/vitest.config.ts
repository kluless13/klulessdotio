import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: { provider: "v8", include: ["lib/sky/**", "lib/content.ts", "lib/posters.ts", "lib/books.ts", "lib/mode.ts", "lib/contributions.ts", "lib/weather.ts", "lib/writing/**", "lib/downloads/**", "lib/mail/**", "lib/ratelimit.ts", "lib/subscribe.ts", "lib/subscribe-guard.ts", "lib/library/**", "lib/visitor*.ts"], thresholds: { lines: 80 } },
  },
})
