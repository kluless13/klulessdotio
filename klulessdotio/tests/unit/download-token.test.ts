import { describe, it, expect } from "vitest"
import { createHmac } from "node:crypto"
import { signToken, verifyToken, TOKEN_TTL_MS } from "@/lib/downloads/token"
import { downloadEnvKey, downloadUrl, isDownloadAvailable } from "@/lib/downloads/registry"

const SECRET = "test-secret"
const payload = { downloadId: "claude-code-starter-kit", slug: "my-post", exp: 2_000_000 }

describe("download token", () => {
  it("round-trips a payload", () => {
    const token = signToken(payload, SECRET)
    expect(verifyToken(token, SECRET, 1_000_000)).toEqual({ ok: true, payload })
    expect(TOKEN_TTL_MS).toBe(604_800_000)
  })

  it("rejects a tampered payload and a tampered signature as invalid", () => {
    const [p, s] = signToken(payload, SECRET).split(".")
    const other = Buffer.from(JSON.stringify({ ...payload, slug: "x" })).toString("base64url")
    expect(verifyToken(`${other}.${s}`, SECRET, 0)).toEqual({ ok: false, reason: "invalid" })
    expect(verifyToken(`${p}.${s.slice(0, -2)}AA`, SECRET, 0)).toEqual({ ok: false, reason: "invalid" })
    expect(verifyToken(signToken(payload, SECRET), "other-secret", 0)).toEqual({ ok: false, reason: "invalid" })
  })

  it("reports expired with the slug only when the signature is valid", () => {
    const token = signToken(payload, SECRET)
    expect(verifyToken(token, SECRET, payload.exp + 1)).toEqual({ ok: false, reason: "expired", slug: "my-post" })
    const [p] = token.split(".")
    expect(verifyToken(`${p}.AAAA`, SECRET, payload.exp + 1)).toEqual({ ok: false, reason: "invalid" })
  })

  it("rejects malformed strings", () => {
    for (const bad of ["", "abc", "a.b.c", ".", "a.", ".b"]) {
      expect(verifyToken(bad, SECRET, 0)).toEqual({ ok: false, reason: "invalid" })
    }
    const p = Buffer.from(JSON.stringify({ downloadId: 1 })).toString("base64url")
    const s = createHmac("sha256", SECRET).update(p).digest("base64url")
    expect(verifyToken(`${p}.${s}`, SECRET, 0)).toEqual({ ok: false, reason: "invalid" })
    const np = Buffer.from("not json").toString("base64url")
    const ns = createHmac("sha256", SECRET).update(np).digest("base64url")
    expect(verifyToken(`${np}.${ns}`, SECRET, 0)).toEqual({ ok: false, reason: "invalid" })
  })

  it("never works with an empty secret", () => {
    expect(() => signToken(payload, "")).toThrow()
    const p = Buffer.from(JSON.stringify(payload)).toString("base64url")
    const s = createHmac("sha256", "").update(p).digest("base64url")
    expect(verifyToken(`${p}.${s}`, "", 0)).toEqual({ ok: false, reason: "invalid" })
  })
})

describe("download registry", () => {
  it("maps ids to env keys", () => {
    expect(downloadEnvKey("claude-code-starter-kit")).toBe("DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT")
  })

  it("availability needs both a known id and a url", () => {
    const env = { DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT: "https://files.example/kit.zip", DOWNLOAD_URL_NOPE: "https://x" }
    expect(downloadUrl("claude-code-starter-kit", env)).toBe("https://files.example/kit.zip")
    expect(isDownloadAvailable("claude-code-starter-kit", env)).toBe(true)
    expect(isDownloadAvailable("nope", env)).toBe(false)
    expect(isDownloadAvailable("claude-code-starter-kit", {})).toBe(false)
    expect(downloadUrl("claude-code-starter-kit", { DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT: "" })).toBeNull()
  })
})
