import { describe, expect, it } from "vitest"
import { guardSubscribeRequest } from "@/lib/subscribe-guard"

const headers = (h: Record<string, string>) => new Headers(h)
const json = { "content-type": "application/json" }
const ALLOWED = ["https://1tx.dev", "https://preview-abc.vercel.app"]

describe("guardSubscribeRequest", () => {
  it("rejects non-JSON with 415", () => {
    expect(guardSubscribeRequest(headers({ "content-type": "text/plain" }), ALLOWED, false)?.status).toBe(415)
  })

  it("in production allows the site origin and a deployment origin", () => {
    expect(guardSubscribeRequest(headers({ ...json, origin: "https://1tx.dev" }), ALLOWED, true)).toBeNull()
    expect(guardSubscribeRequest(headers({ ...json, origin: "https://preview-abc.vercel.app" }), ALLOWED, true)).toBeNull()
  })

  it("in production rejects other origins and a missing origin with 403", () => {
    expect(guardSubscribeRequest(headers({ ...json, origin: "https://evil.example" }), ALLOWED, true)?.status).toBe(403)
    expect(guardSubscribeRequest(headers(json), ALLOWED, true)?.status).toBe(403)
  })

  it("outside production any origin passes", () => {
    expect(guardSubscribeRequest(headers({ ...json, origin: "https://evil.example" }), ALLOWED, false)).toBeNull()
  })
})
