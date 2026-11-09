import { describe, it, expect, vi, afterEach } from "vitest"

const ctor = vi.fn()
vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(opts: unknown) {
      ctor(opts)
    }
  },
}))

import { hashKey, allow, getRateLimitRedis } from "@/lib/ratelimit"

function fakeRedis(initialTtl = -2) {
  let n = 0
  let ttl = initialTtl
  return {
    incr: vi.fn(async () => ++n),
    expire: vi.fn(async (_k: string, s: number): Promise<0 | 1> => {
      ttl = s
      return 1
    }),
    ttl: vi.fn(async () => ttl),
    setCount: (v: number) => {
      n = v
    },
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  ctor.mockClear()
})

describe("ratelimit", () => {
  it("hashKey never contains the raw value and normalises email case", () => {
    const a = hashKey("email", "  Person@Example.com ")
    expect(a).toBe(hashKey("email", "person@example.com"))
    expect(a).toMatch(/^rl:email:[0-9a-f]{64}$/)
    expect(a).not.toContain("person")
    expect(hashKey("ip", "1.2.3.4")).toMatch(/^rl:ip:[0-9a-f]{64}$/)
  })

  it("allow sets expiry on first hit and blocks after the limit", async () => {
    const redis = fakeRedis()
    expect(await allow(redis, "k", 2, 60)).toBe(true)
    expect(redis.expire).toHaveBeenCalledWith("k", 60)
    expect(await allow(redis, "k", 2, 60)).toBe(true)
    expect(await allow(redis, "k", 2, 60)).toBe(false)
    expect(redis.expire).toHaveBeenCalledTimes(1)
  })

  it("a key left without a TTL gets one on the next call", async () => {
    const redis = fakeRedis(-1)
    redis.setCount(5)
    expect(await allow(redis, "k", 3, 3600)).toBe(false)
    expect(redis.expire).toHaveBeenCalledWith("k", 3600)
  })
})

describe("getRateLimitRedis", () => {
  const clear = () => {
    for (const k of ["KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"])
      vi.stubEnv(k, "")
  }

  it("prefers KV_* over UPSTASH_*", () => {
    clear()
    vi.stubEnv("KV_REST_API_URL", "kv-url")
    vi.stubEnv("KV_REST_API_TOKEN", "kv-tok")
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "up-url")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "up-tok")
    getRateLimitRedis()
    expect(ctor).toHaveBeenCalledWith({ url: "kv-url", token: "kv-tok" })
  })

  it("falls back to UPSTASH_*", () => {
    vi.stubEnv("KV_REST_API_URL", undefined as unknown as string)
    vi.stubEnv("KV_REST_API_TOKEN", undefined as unknown as string)
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "up-url")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "up-tok")
    getRateLimitRedis()
    expect(ctor).toHaveBeenCalledWith({ url: "up-url", token: "up-tok" })
  })

  it("throws a clear error naming only variables when both are missing", () => {
    for (const k of ["KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"])
      vi.stubEnv(k, undefined as unknown as string)
    expect(() => getRateLimitRedis()).toThrow(/KV_REST_API_URL\/TOKEN.*UPSTASH_REDIS_REST_URL\/TOKEN/)
  })
})
