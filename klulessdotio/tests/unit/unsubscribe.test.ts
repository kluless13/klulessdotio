import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { handleUnsubscribe } from "@/lib/unsubscribe"
import { GET, POST } from "@/app/api/unsubscribe/[token]/route"
import { signKitToken, signUnsubToken } from "@/lib/downloads/token"

const SECRET = "kit-secret"
const ENV = { KIT_SIGNING_SECRET: SECRET }
const provider = (impl: (e: string) => Promise<void> = async () => undefined) => ({
  addContact: vi.fn(),
  sendDownloadEmail: vi.fn(),
  sendKitEmail: vi.fn(),
  unsubscribe: vi.fn(impl),
})

describe("handleUnsubscribe", () => {
  it("a valid token unsubscribes the email and gives 200", async () => {
    const p = provider()
    const res = await handleUnsubscribe(signUnsubToken("A@x.com", SECRET), { provider: p, env: ENV })
    expect(res).toEqual({ status: 200 })
    expect(p.unsubscribe).toHaveBeenCalledWith("a@x.com")
  })

  it("an invalid token gives 400 and touches nothing", async () => {
    const p = provider()
    expect(await handleUnsubscribe("garbage", { provider: p, env: ENV })).toEqual({ status: 400 })
    expect(p.unsubscribe).not.toHaveBeenCalled()
  })

  it("a kit token is not an unsub token", async () => {
    const p = provider()
    expect(await handleUnsubscribe(signKitToken("a@x.com", SECRET), { provider: p, env: ENV })).toEqual({ status: 400 })
    expect(p.unsubscribe).not.toHaveBeenCalled()
  })

  it("a missing secret gives 400", async () => {
    const p = provider()
    expect(await handleUnsubscribe(signUnsubToken("a@x.com", SECRET), { provider: p, env: {} })).toEqual({ status: 400 })
  })

  it("a provider failure gives 502", async () => {
    const p = provider(async () => {
      throw new Error("mail provider failed")
    })
    expect(await handleUnsubscribe(signUnsubToken("a@x.com", SECRET), { provider: p, env: ENV })).toEqual({ status: 502 })
  })
})

const mockProvider = vi.hoisted(() => ({ unsubscribe: vi.fn(async (_e: string) => undefined) }))
vi.mock("@/lib/mail/provider", () => ({ resendProvider: () => mockProvider }))

describe("unsubscribe route", () => {
  beforeEach(() => {
    vi.stubEnv("KIT_SIGNING_SECRET", SECRET)
    mockProvider.unsubscribe.mockClear()
  })
  afterEach(() => vi.unstubAllEnvs())

  const where = (res: Response) => {
    const url = new URL(res.headers.get("location") ?? "", "https://1tx.dev")
    return url.pathname + url.search
  }
  const call = (method: "GET" | "POST", token: string) =>
    (method === "GET" ? GET : POST)(new Request("https://1tx.dev/api/unsubscribe/x", { method }), { params: { token } })

  it("GET never unsubscribes: it redirects to the confirm page with the token", async () => {
    const token = signUnsubToken("a@x.com", SECRET)
    const res = await call("GET", token)
    expect(res.status).toBe(303)
    expect(where(res)).toBe(`/unsubscribe?token=${encodeURIComponent(token)}`)
    expect(mockProvider.unsubscribe).not.toHaveBeenCalled()
  })

  const form = (token: string, body: string) =>
    POST(
      new Request("https://1tx.dev/api/unsubscribe/x", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      }),
      { params: { token } }
    )

  it("a form POST unsubscribes and redirects to status=done", async () => {
    const res = await form(signUnsubToken("a@x.com", SECRET), "")
    expect(res.status).toBe(303)
    expect(where(res)).toBe("/unsubscribe?status=done")
    expect(mockProvider.unsubscribe).toHaveBeenCalledWith("a@x.com")
  })

  it("a form POST with a bad token redirects to status=invalid", async () => {
    expect(where(await form("x", ""))).toBe("/unsubscribe?status=invalid")
  })

  it("a one-click POST unsubscribes and returns an empty 200", async () => {
    const res = await form(signUnsubToken("a@x.com", SECRET), "List-Unsubscribe=One-Click")
    expect(res.status).toBe(200)
    expect(await res.text()).toBe("")
    expect(mockProvider.unsubscribe).toHaveBeenCalledWith("a@x.com")
  })

  it("a form POST with a provider failure redirects to status=error", async () => {
    mockProvider.unsubscribe.mockRejectedValueOnce(new Error("mail provider failed"))
    expect(where(await form(signUnsubToken("a@x.com", SECRET), ""))).toBe("/unsubscribe?status=error")
  })

  it("POST is an empty response with the handler status", async () => {
    const ok = await call("POST", signUnsubToken("a@x.com", SECRET))
    expect(ok.status).toBe(200)
    expect(await ok.text()).toBe("")
    const bad = await call("POST", "x")
    expect(bad.status).toBe(400)
    expect(await bad.text()).toBe("")
  })
})
