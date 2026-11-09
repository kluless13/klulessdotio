import { describe, it, expect, vi } from "vitest"
import { hashKey, allow } from "@/lib/ratelimit"

describe("ratelimit", () => {
  it("hashKey never contains the raw value and normalises email case", () => {
    const a = hashKey("email", "  Person@Example.com ")
    const b = hashKey("email", "person@example.com")
    expect(a).toBe(b)
    expect(a).toMatch(/^rl:email:[0-9a-f]{64}$/)
    expect(a).not.toContain("person")
    expect(hashKey("ip", "1.2.3.4")).toMatch(/^rl:ip:[0-9a-f]{64}$/)
  })

  it("allow sets expiry on first hit and blocks after the limit", async () => {
    let n = 0
    const redis = {
      incr: vi.fn(async () => ++n),
      expire: vi.fn(async (): Promise<0 | 1> => 1),
    }
    expect(await allow(redis, "k", 2, 60)).toBe(true)
    expect(redis.expire).toHaveBeenCalledWith("k", 60)
    expect(await allow(redis, "k", 2, 60)).toBe(true)
    expect(await allow(redis, "k", 2, 60)).toBe(false)
    expect(redis.expire).toHaveBeenCalledTimes(1)
  })
})
