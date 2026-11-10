import { describe, expect, it } from "vitest"
import { allowedOrigins, linkOrigin } from "@/lib/subscribe-origins"

const SITE = "https://1tx.dev"

describe("allowedOrigins", () => {
  it("is just the site when the Vercel vars are unset or empty", () => {
    expect(allowedOrigins(SITE, {})).toEqual([SITE])
    expect(allowedOrigins(SITE, { VERCEL_URL: "", VERCEL_BRANCH_URL: "" })).toEqual([SITE])
  })

  it("adds https:// to bare hosts", () => {
    expect(allowedOrigins(SITE, { VERCEL_URL: "a.vercel.app", VERCEL_BRANCH_URL: "b.vercel.app" })).toEqual([
      SITE,
      "https://a.vercel.app",
      "https://b.vercel.app",
    ])
  })

  it("keeps a value that already has a scheme", () => {
    expect(allowedOrigins(SITE, { VERCEL_URL: "http://localhost:3000" })).toEqual([SITE, "http://localhost:3000"])
  })

  it("never adds a bare scheme or empty entry", () => {
    const out = allowedOrigins(SITE, { VERCEL_URL: undefined, VERCEL_BRANCH_URL: "" })
    expect(out).not.toContain("https://")
    expect(out).not.toContain("")
  })
})

describe("linkOrigin", () => {
  const req = "http://localhost:3000"
  it("uses the deployment on a preview", () => {
    expect(linkOrigin(SITE, req, { VERCEL_ENV: "preview", VERCEL_URL: "p.vercel.app", NODE_ENV: "production" })).toBe("https://p.vercel.app")
  })
  it("uses the site URL in production", () => {
    expect(linkOrigin(SITE, req, { VERCEL_ENV: "production", VERCEL_URL: "p.vercel.app", NODE_ENV: "production" })).toBe(SITE)
  })
  it("uses the request origin elsewhere, and in a preview without VERCEL_URL", () => {
    expect(linkOrigin(SITE, req, { NODE_ENV: "development" })).toBe(req)
    expect(linkOrigin(SITE, req, { VERCEL_ENV: "preview", NODE_ENV: "development" })).toBe(req)
  })
})
