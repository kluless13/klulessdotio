import { describe, it, expect, vi, beforeEach } from "vitest"

const ctor = vi.fn()
vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(opts: unknown) {
      ctor(opts)
    }
  },
}))

import { makeKitRedis } from "@/lib/kit/redis"

beforeEach(() => ctor.mockClear())

describe("makeKitRedis", () => {
  it("turns automatic deserialisation off", () => {
    expect(makeKitRedis({ KV_REST_API_URL: "https://a.invalid", KV_REST_API_TOKEN: "t" })).not.toBeNull()
    expect(ctor).toHaveBeenCalledWith({ url: "https://a.invalid", token: "t", automaticDeserialization: false })
  })

  it("falls back to the UPSTASH_* vars", () => {
    makeKitRedis({ UPSTASH_REDIS_REST_URL: "https://b.invalid", UPSTASH_REDIS_REST_TOKEN: "u" })
    expect(ctor).toHaveBeenCalledWith({ url: "https://b.invalid", token: "u", automaticDeserialization: false })
  })

  it("returns null without env", () => {
    expect(makeKitRedis({})).toBeNull()
    expect(makeKitRedis({ KV_REST_API_URL: "https://a.invalid" })).toBeNull()
    expect(ctor).not.toHaveBeenCalled()
  })
})
