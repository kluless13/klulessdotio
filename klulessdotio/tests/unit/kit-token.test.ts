import { describe, it, expect, vi, afterEach } from "vitest"
import { createHash } from "node:crypto"
import {
  signToken,
  verifyToken,
  signKitToken,
  verifyKitToken,
  signUnsubToken,
  verifyUnsubToken,
  kitSecret,
} from "@/lib/downloads/token"

const S = "kit-secret"
const subjectOf = (email: string) =>
  createHash("sha256").update(email).digest("hex").slice(0, 16)

afterEach(() => vi.useRealTimers())

describe("kit token", () => {
  it("round-trips and normalises the email", () => {
    expect(verifyKitToken(signKitToken("A@x.com ", S), S)).toEqual({
      ok: true,
      subject: subjectOf("a@x.com"),
    })
  })

  it("gives the same link for the same email and different links for different emails", () => {
    expect(signKitToken("a@x.com", S)).toBe(signKitToken(" A@X.com", S))
    expect(signKitToken("a@x.com", S)).not.toBe(signKitToken("b@x.com", S))
  })

  it("never expires", () => {
    const token = signKitToken("a@x.com", S)
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 50 * 365 * 24 * 60 * 60 * 1000)
    expect(verifyKitToken(token, S).ok).toBe(true)
  })

  it("holds no email", () => {
    const part = signKitToken("a@x.com", S).split(".")[0]
    expect(Buffer.from(part, "base64url").toString("utf8")).not.toContain("@")
  })

  it("rejects a tampered signature or payload", () => {
    const [p, s] = signKitToken("a@x.com", S).split(".")
    const other = Buffer.from(
      JSON.stringify({ kind: "kit", kit: "starter-kit", subject: "0000000000000000" }),
    ).toString("base64url")
    expect(verifyKitToken(`${other}.${s}`, S)).toEqual({ ok: false })
    const mid = Math.floor(s.length / 2)
    const flipped = `${s.slice(0, mid)}${s[mid] === "A" ? "B" : "A"}${s.slice(mid + 1)}`
    expect(flipped).not.toBe(s)
    expect(verifyKitToken(`${p}.${flipped}`, S)).toEqual({ ok: false })
  })

  it("rejects the wrong secret", () => {
    expect(verifyKitToken(signKitToken("a@x.com", S), "other")).toEqual({ ok: false })
  })

  it.each(["", "a", "a.b.c", "%%%"])("rejects garbage %j", (g) => {
    expect(verifyKitToken(g, S)).toEqual({ ok: false })
    expect(verifyUnsubToken(g, S)).toEqual({ ok: false })
  })

  it("keeps kinds apart", () => {
    const kit = signKitToken("a@x.com", S)
    const unsub = signUnsubToken("a@x.com", S)
    const download = signToken({ downloadId: "d", slug: "s", exp: 9e15 }, S)
    expect(verifyKitToken(unsub, S)).toEqual({ ok: false })
    expect(verifyKitToken(download, S)).toEqual({ ok: false })
    expect(verifyToken(kit, S, 0)).toEqual({ ok: false, reason: "invalid" })
    expect(verifyToken(unsub, S, 0)).toEqual({ ok: false, reason: "invalid" })
    expect(verifyUnsubToken(kit, S)).toEqual({ ok: false })
    expect(verifyUnsubToken(download, S)).toEqual({ ok: false })
  })

  it("rejects a download-shaped payload that also carries a kind", () => {
    const sneaky = signToken(
      { downloadId: "d", slug: "s", exp: 9e15, kind: "kit" } as never,
      S,
    )
    expect(verifyToken(sneaky, S, 0)).toEqual({ ok: false, reason: "invalid" })
  })
})

describe("unsubscribe token", () => {
  it("round-trips and lowercases the email", () => {
    expect(verifyUnsubToken(signUnsubToken("A@X.com", S), S)).toEqual({
      ok: true,
      email: "a@x.com",
    })
  })
})

describe("kitSecret", () => {
  it("prefers KIT_SIGNING_SECRET, falls back to DOWNLOAD_SIGNING_SECRET, else undefined", () => {
    expect(kitSecret({ KIT_SIGNING_SECRET: "k", DOWNLOAD_SIGNING_SECRET: "d" })).toBe("k")
    expect(kitSecret({ DOWNLOAD_SIGNING_SECRET: "d" })).toBe("d")
    expect(kitSecret({})).toBeUndefined()
  })
})
