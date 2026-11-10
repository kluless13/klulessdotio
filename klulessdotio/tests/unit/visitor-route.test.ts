import { afterEach, describe, expect, it, vi } from "vitest"

let count = 0
vi.mock("@/lib/ratelimit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ratelimit")>()),
  getRateLimitRedis: () => ({
    incr: async () => ++count,
    expire: async () => 1 as const,
    ttl: async () => 100,
  }),
}))

import { POST } from "@/app/api/visitor/route"

const post = (headers: Record<string, string>) =>
  POST(new Request("https://1tx.dev/api/visitor", { method: "POST", headers, body: "{}" }))

afterEach(() => {
  vi.unstubAllEnvs()
  count = 0
})

describe("POST /api/visitor", () => {
  it("returns a number for a JSON request", async () => {
    const res = await post({ "content-type": "application/json", "x-forwarded-for": "9.9.9.9" })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(typeof body.data.number).toBe("number")
  })

  it("rejects non-JSON with 415", async () => {
    const res = await post({ "content-type": "text/plain" })
    expect(res.status).toBe(415)
    expect((await res.json()).success).toBe(false)
  })

  it("rejects a wrong origin in production with 403", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const res = await post({ "content-type": "application/json", origin: "https://evil.example" })
    expect(res.status).toBe(403)
  })
})
