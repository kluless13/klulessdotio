import { describe, expect, it, vi } from "vitest"
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_STATE_KEY,
  changedEntries,
  indexNowBody,
  runIndexNow,
} from "@/lib/indexnow"
import fs from "node:fs"
import path from "node:path"

const ENTRIES = [
  { url: "https://1tx.dev/", lastModified: "2026-11-10" },
  { url: "https://1tx.dev/library", lastModified: "2026-11-10" },
  { url: "https://1tx.dev/writing/a", lastModified: "2026-11-09" },
]

function fakeRedis(initial: Record<string, string> | null = null) {
  const store: Record<string, string> = { ...(initial ?? {}) }
  return {
    store,
    hgetall: vi.fn(async () => (Object.keys(store).length ? { ...store } : null)),
    hset: vi.fn(async (_key: string, values: Record<string, string>) => {
      Object.assign(store, values)
      return Object.keys(values).length
    }),
  }
}

const okFetch = () => vi.fn(async () => new Response(null, { status: 200 }))

describe("IndexNow key file", () => {
  it("is served from public/ and contains exactly the key", () => {
    const file = path.join(process.cwd(), "public", `${INDEXNOW_KEY}.txt`)
    expect(fs.readFileSync(file, "utf8").trim()).toBe(INDEXNOW_KEY)
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/)
  })
})

describe("changedEntries", () => {
  it("sends everything on the first run", () => {
    expect(changedEntries(ENTRIES, null)).toEqual(ENTRIES)
  })

  it("sends only new pages and pages whose date moved", () => {
    const previous = { "https://1tx.dev/": "2026-11-10", "https://1tx.dev/library": "2026-11-09" }
    expect(changedEntries(ENTRIES, previous).map((e) => e.url)).toEqual([
      "https://1tx.dev/library",
      "https://1tx.dev/writing/a",
    ])
  })
})

describe("indexNowBody", () => {
  it("names the host, the key and where the key lives", () => {
    expect(indexNowBody(["https://1tx.dev/"])).toEqual({
      host: "1tx.dev",
      key: INDEXNOW_KEY,
      keyLocation: `https://1tx.dev/${INDEXNOW_KEY}.txt`,
      urlList: ["https://1tx.dev/"],
    })
  })
})

describe("runIndexNow", () => {
  it("submits changed pages and remembers their dates", async () => {
    const redis = fakeRedis({ "https://1tx.dev/": "2026-11-10" })
    const fetchFn = okFetch()
    const result = await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    expect(result).toEqual({ status: 200, body: { ok: true, submitted: 2 } })
    expect(fetchFn).toHaveBeenCalledTimes(1)
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(INDEXNOW_ENDPOINT)
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["content-type"]).toContain("application/json")
    expect(JSON.parse(String(init.body)).urlList).toEqual(["https://1tx.dev/library", "https://1tx.dev/writing/a"])
    expect(redis.hset).toHaveBeenCalledWith(INDEXNOW_STATE_KEY, {
      "https://1tx.dev/library": "2026-11-10",
      "https://1tx.dev/writing/a": "2026-11-09",
    })
  })

  it("does nothing when nothing changed", async () => {
    const redis = fakeRedis(Object.fromEntries(ENTRIES.map((e) => [e.url, e.lastModified])))
    const fetchFn = okFetch()
    const result = await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    expect(result).toEqual({ status: 200, body: { ok: true, submitted: 0 } })
    expect(fetchFn).not.toHaveBeenCalled()
    expect(redis.hset).not.toHaveBeenCalled()
  })

  it("accepts 202 from IndexNow as success", async () => {
    const redis = fakeRedis()
    const fetchFn = vi.fn(async () => new Response(null, { status: 202 }))
    const result = await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    expect(result.body).toEqual({ ok: true, submitted: 3 })
  })

  it("remembers nothing when IndexNow refuses, so the next run retries", async () => {
    const redis = fakeRedis()
    const fetchFn = vi.fn(async () => new Response(null, { status: 403 }))
    const result = await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    expect(result).toEqual({ status: 502, body: { ok: false, error: "indexnow_rejected", upstream: 403 } })
    expect(redis.hset).not.toHaveBeenCalled()
  })

  it("remembers nothing when the request fails", async () => {
    const redis = fakeRedis()
    const fetchFn = vi.fn(async () => {
      throw new Error("offline")
    })
    const result = await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    expect(result).toEqual({ status: 502, body: { ok: false, error: "indexnow_unreachable" } })
    expect(redis.hset).not.toHaveBeenCalled()
  })

  it("reports a failed save after a successful submit, so the next run resubmits", async () => {
    const redis = fakeRedis()
    redis.hset.mockRejectedValueOnce(new Error("down"))
    const fetchFn = okFetch()
    const result = await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    expect(result).toEqual({ status: 503, body: { ok: false, error: "storage" } })
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it("gives up on a hung IndexNow request instead of waiting forever", async () => {
    const redis = fakeRedis()
    const fetchFn = okFetch()
    await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it("reports a storage failure without submitting", async () => {
    const redis = fakeRedis()
    redis.hgetall.mockRejectedValueOnce(new Error("down"))
    const fetchFn = okFetch()
    const result = await runIndexNow({ entries: ENTRIES, redis, fetch: fetchFn })
    expect(result).toEqual({ status: 503, body: { ok: false, error: "storage" } })
    expect(fetchFn).not.toHaveBeenCalled()
  })
})
