import { describe, expect, it, vi } from "vitest"
import { VISITOR_KEY, VISITOR_LIMIT, formatVisitor, handleVisitor } from "@/lib/visitor"

function fakeRedis() {
  const counts: Record<string, number> = {}
  const keys: string[] = []
  return {
    keys,
    redis: {
      incr: vi.fn(async (k: string) => {
        keys.push(k)
        counts[k] = (counts[k] ?? 0) + 1
        return counts[k]
      }),
      expire: vi.fn(async (): Promise<0 | 1> => 1),
      ttl: vi.fn(async () => 100),
    },
  }
}

describe("handleVisitor", () => {
  it("counts up from 1", async () => {
    const { redis } = fakeRedis()
    expect(await handleVisitor("1.1.1.1", { redis })).toEqual({ status: 200, body: { success: true, data: { number: 1 } } })
    expect(await handleVisitor("2.2.2.2", { redis })).toEqual({ status: 200, body: { success: true, data: { number: 2 } } })
  })

  it("limits one IP to five visits an hour", async () => {
    const { redis } = fakeRedis()
    for (let i = 0; i < VISITOR_LIMIT; i++) expect((await handleVisitor("1.1.1.1", { redis })).status).toBe(200)
    expect(await handleVisitor("1.1.1.1", { redis })).toEqual({ status: 429, body: { success: false, error: "rate_limited" } })
  })

  it("does not bump the count when rate limited", async () => {
    const { redis, keys } = fakeRedis()
    for (let i = 0; i < VISITOR_LIMIT + 2; i++) await handleVisitor("1.1.1.1", { redis })
    expect(keys.filter((k) => k === VISITOR_KEY)).toHaveLength(VISITOR_LIMIT)
  })

  it("returns 503 when redis throws", async () => {
    const { redis } = fakeRedis()
    redis.incr.mockRejectedValue(new Error("down"))
    expect(await handleVisitor("1.1.1.1", { redis })).toEqual({ status: 503, body: { success: false, error: "server" } })
  })

  it("keys the limit under rl:visitor:", async () => {
    const { redis, keys } = fakeRedis()
    await handleVisitor("1.1.1.1", { redis })
    expect(keys[0].startsWith("rl:visitor:")).toBe(true)
    expect(keys[0]).not.toContain("1.1.1.1")
  })
})

describe("formatVisitor", () => {
  it("adds a hash and thousands separators", () => {
    expect(formatVisitor(1284)).toBe("#1,284")
    expect(formatVisitor(1)).toBe("#1")
  })
})
