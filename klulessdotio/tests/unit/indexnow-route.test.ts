import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const run = vi.fn(async () => ({ status: 200, body: { ok: true, submitted: 1 } }))

vi.mock("@/lib/indexnow", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/indexnow")>()),
  runIndexNow: run,
}))
vi.mock("@upstash/redis", () => ({ Redis: vi.fn(() => ({ hgetall: vi.fn(), hset: vi.fn() })) }))

const request = (auth?: string) =>
  new Request("https://1tx.dev/api/cron/indexnow", { headers: auth ? { authorization: auth } : {} })

beforeEach(() => {
  run.mockClear()
  vi.stubEnv("CRON_SECRET", "s3cret-value")
  vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io")
  vi.stubEnv("KV_REST_API_TOKEN", "token")
})
afterEach(() => vi.unstubAllEnvs())

describe("GET /api/cron/indexnow", () => {
  it("refuses a request without the cron secret", async () => {
    const { GET } = await import("@/app/api/cron/indexnow/route")
    const response = await GET(request())
    expect(response.status).toBe(401)
    expect(run).not.toHaveBeenCalled()
  })

  it("refuses a wrong secret of the same length", async () => {
    const { GET } = await import("@/app/api/cron/indexnow/route")
    const response = await GET(request("Bearer s3cret-valuX"))
    expect(response.status).toBe(401)
    expect(run).not.toHaveBeenCalled()
  })

  it("refuses everything when no secret is configured", async () => {
    vi.stubEnv("CRON_SECRET", "")
    const { GET } = await import("@/app/api/cron/indexnow/route")
    const response = await GET(request("Bearer "))
    expect(response.status).toBe(401)
  })

  it("refuses everything when the secret is not set at all", async () => {
    vi.stubEnv("CRON_SECRET", undefined)
    const { GET } = await import("@/app/api/cron/indexnow/route")
    const response = await GET(request("Bearer undefined"))
    expect(response.status).toBe(401)
  })

  it("refuses a header of a different length without throwing", async () => {
    const { GET } = await import("@/app/api/cron/indexnow/route")
    const response = await GET(request("Bearer short"))
    expect(response.status).toBe(401)
  })

  it("runs with the right secret and passes the sitemap's pages", async () => {
    const { GET } = await import("@/app/api/cron/indexnow/route")
    const response = await GET(request("Bearer s3cret-value"))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, submitted: 1 })
    const deps = (run.mock.calls[0] as unknown as [{ entries: { url: string }[] }])[0]
    expect(deps.entries.some((e) => e.url === "https://1tx.dev/library")).toBe(true)
  })

  it("reports missing storage settings as a server error", async () => {
    vi.stubEnv("KV_REST_API_URL", "")
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
    const { GET } = await import("@/app/api/cron/indexnow/route")
    const response = await GET(request("Bearer s3cret-value"))
    expect(response.status).toBe(503)
    expect(run).not.toHaveBeenCalled()
  })
})
