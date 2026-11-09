import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { GET, dynamic } from "@/app/api/download/[token]/route"
import { POST, dynamic as subscribeMode } from "@/app/api/subscribe/route"
import { signToken } from "@/lib/downloads/token"

const SECRET = "test-secret"
const BLOB = "https://blob.example/private/abc"
const payload = { downloadId: "claude-code-starter-kit", slug: "a-post", exp: Date.now() + 60_000 }
const call = (token: string) => GET(new Request("https://1tx.dev/x"), { params: { token } })

beforeEach(() => {
  vi.stubEnv("DOWNLOAD_SIGNING_SECRET", SECRET)
  vi.stubEnv("DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT", BLOB)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("download route", () => {
  it("is dynamic", () => {
    expect(dynamic).toBe("force-dynamic")
    expect(subscribeMode).toBe("force-dynamic")
  })

  it("valid token streams with attachment headers", async () => {
    const fetchMock = vi.fn(async (_url: string) => new Response("zipdata", { headers: { "content-type": "application/zip" } }))
    vi.stubGlobal("fetch", fetchMock)
    const res = await call(signToken(payload, SECRET))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe("zipdata")
    expect(res.headers.get("Content-Type")).toBe("application/zip")
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="claude-code-starter-kit.zip"')
    expect(res.headers.get("Cache-Control")).toBe("private, no-store")
    expect(fetchMock.mock.calls[0][0]).toBe(BLOB)
  })

  it("expired token links back to the post", async () => {
    const res = await call(signToken({ ...payload, slug: "a<b>", exp: Date.now() - 1 }, SECRET))
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8")
    const html = await res.text()
    expect(html).toContain("This link has expired.")
    expect(html).toContain("Get a fresh one")
    expect(html).toContain('href="/writing/a%3Cb%3E"')
    expect(html).not.toContain("a<b>")
  })

  it("tampered token is 400", async () => {
    const res = await call(signToken(payload, SECRET).slice(0, -2) + "xx")
    expect(res.status).toBe(400)
    expect(await res.text()).toBe("This link doesn't work.")
  })

  it("unavailable file is 404 and never exposes the blob url", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 403 })))
    const res = await call(signToken(payload, SECRET))
    expect(res.status).toBe(404)
    expect(await res.text()).not.toContain(BLOB)
    vi.stubEnv("DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT", "")
    expect((await call(signToken(payload, SECRET))).status).toBe(404)
  })

  it("unknown download id or upstream throw is 404", async () => {
    expect((await call(signToken({ ...payload, downloadId: "nope" }, SECRET))).status).toBe(404)
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error(BLOB) }))
    expect((await call(signToken(payload, SECRET))).status).toBe(404)
  })

  it("missing secret is 400 invalid", async () => {
    vi.stubEnv("DOWNLOAD_SIGNING_SECRET", "")
    expect((await call("a.b")).status).toBe(400)
  })
})

describe("subscribe route", () => {
  it("malformed JSON is 400 invalid_email", async () => {
    const res = await POST(new Request("https://1tx.dev/api/subscribe", { method: "POST", body: "{" }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ success: false, error: "invalid_email" })
  })
})
