import { describe, it, expect, vi, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { loadKitContent, KIT_CONTENT_KEY } from "@/lib/kit/content"

const fixturePath = path.join(process.cwd(), "tests/fixtures/kit/kit.md")
const fixture = fs.readFileSync(fixturePath, "utf8")
const redisEnv = { KV_REST_API_URL: "https://example.invalid", KV_REST_API_TOKEN: "t" }

afterEach(() => vi.useRealTimers())

describe("loadKitContent", () => {
  it("uses the key the upload script writes", () => {
    expect(KIT_CONTENT_KEY).toBe("kit:starter-kit:content")
  })

  it("reads KIT_CONTENT_FILE when set", async () => {
    const r = await loadKitContent({ KIT_CONTENT_FILE: fixturePath })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.doc.title).toBeTruthy()
  })

  it("prefers the file over Redis", async () => {
    const get = vi.fn()
    const r = await loadKitContent({ KIT_CONTENT_FILE: fixturePath, ...redisEnv }, { redis: { get } })
    expect(r.ok).toBe(true)
    expect(get).not.toHaveBeenCalled()
  })

  it("is unavailable when the file cannot be read", async () => {
    const readFile = () => {
      throw new Error("ENOENT")
    }
    expect(await loadKitContent({ KIT_CONTENT_FILE: "/nope" }, { readFile })).toEqual({
      ok: false,
      reason: "unavailable",
    })
  })

  it("reads Redis when no file is set", async () => {
    const get = vi.fn().mockResolvedValue(fixture)
    const r = await loadKitContent(redisEnv, { redis: { get } })
    expect(get).toHaveBeenCalledWith("kit:starter-kit:content")
    expect(r.ok).toBe(true)
  })

  it("accepts the UPSTASH_* fallback env vars", async () => {
    const get = vi.fn().mockResolvedValue(fixture)
    const r = await loadKitContent(
      { UPSTASH_REDIS_REST_URL: "https://example.invalid", UPSTASH_REDIS_REST_TOKEN: "t" },
      { redis: { get } }
    )
    expect(r.ok).toBe(true)
  })

  it("is unavailable when Redis env vars are missing and no redis is injected", async () => {
    expect(await loadKitContent({})).toEqual({ ok: false, reason: "unavailable" })
  })

  it("is unavailable when get throws", async () => {
    const get = vi.fn().mockRejectedValue(new Error("down"))
    expect(await loadKitContent(redisEnv, { redis: { get } })).toEqual({ ok: false, reason: "unavailable" })
  })

  it("is unavailable when get returns null", async () => {
    const get = vi.fn().mockResolvedValue(null)
    expect(await loadKitContent(redisEnv, { redis: { get } })).toEqual({ ok: false, reason: "unavailable" })
  })

  it("is unavailable when get returns a non-string", async () => {
    const get = vi.fn().mockResolvedValue({ a: 1 })
    expect(await loadKitContent(redisEnv, { redis: { get } as never })).toEqual({
      ok: false,
      reason: "unavailable",
    })
  })

  it("is unavailable when get never resolves", async () => {
    vi.useFakeTimers()
    const get = vi.fn().mockReturnValue(new Promise(() => {}))
    const pending = loadKitContent(redisEnv, { redis: { get } })
    await vi.advanceTimersByTimeAsync(5001)
    expect(await pending).toEqual({ ok: false, reason: "unavailable" })
  })

  it("is unavailable when the content has an em dash", async () => {
    const get = vi.fn().mockResolvedValue(fixture + "\nthis — is bad\n")
    expect(await loadKitContent(redisEnv, { redis: { get } })).toEqual({ ok: false, reason: "unavailable" })
  })
})
