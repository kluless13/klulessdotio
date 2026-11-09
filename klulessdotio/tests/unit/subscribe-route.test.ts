import { describe, expect, it, vi } from "vitest"
import { handleSubscribe, type SubscribeDeps } from "@/lib/subscribe"
import { verifyToken } from "@/lib/downloads/token"

const EMAIL = "reader.person@example.com"
const SECRET = "test-secret"
const ENV = { DOWNLOAD_SIGNING_SECRET: SECRET, DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT: "https://blob.example/private/abc" }
const NOW = 1_700_000_000_000

function setup(over: Partial<SubscribeDeps> = {}, counts: Record<string, number> = {}) {
  const keys: string[] = []
  const logs: unknown[][] = []
  const redis = {
    incr: vi.fn(async (k: string) => {
      keys.push(k)
      counts[k] = (counts[k] ?? 0) + 1
      return counts[k]
    }),
    expire: vi.fn(async (k: string): Promise<0 | 1> => {
      keys.push(k)
      return 1
    }),
    ttl: vi.fn(async (k: string) => {
      keys.push(k)
      return 100
    }),
  }
  const provider = {
    addContact: vi.fn(async (_i: { email: string; downloadId: string; slug: string }) => undefined),
    sendDownloadEmail: vi.fn(async (_i: { email: string; title: string; link: string }) => undefined),
  }
  const deps: SubscribeDeps = {
    redis,
    provider,
    env: ENV,
    now: () => NOW,
    origin: "https://1tx.dev",
    log: (...args: unknown[]) => void logs.push(args),
    ...over,
  }
  return { deps, redis, provider, keys, logs }
}

const good = { email: EMAIL, downloadId: "claude-code-starter-kit", consent: true, slug: "a-post" }

describe("handleSubscribe", () => {
  it("honeypot returns success and touches nothing", async () => {
    const { deps, redis, provider, logs } = setup()
    const res = await handleSubscribe({ ...good, company_url: "http://spam" }, "1.1.1.1", deps)
    expect(res).toEqual({ status: 200, body: { success: true } })
    expect(redis.incr).not.toHaveBeenCalled()
    expect(provider.addContact).not.toHaveBeenCalled()
    expect(provider.sendDownloadEmail).not.toHaveBeenCalled()
    expect(logs).toHaveLength(0)
  })

  it("invalid email is 400 invalid_email", async () => {
    const { deps, logs } = setup()
    const res = await handleSubscribe({ ...good, email: "nope" }, "1.1.1.1", deps)
    expect(res).toEqual({ status: 400, body: { success: false, error: "invalid_email" } })
    expect(logs[0]).toEqual(["rejected"])
  })

  it("malformed body is 400", async () => {
    const { deps } = setup()
    expect((await handleSubscribe(undefined, "1.1.1.1", deps)).status).toBe(400)
  })

  it("missing consent is 400", async () => {
    const { deps, provider } = setup()
    const res = await handleSubscribe({ ...good, consent: false }, "1.1.1.1", deps)
    expect(res.status).toBe(400)
    expect(provider.sendDownloadEmail).not.toHaveBeenCalled()
  })

  it("unknown or unavailable download is 404", async () => {
    const unknown = setup()
    expect((await handleSubscribe({ ...good, downloadId: "nope" }, "1.1.1.1", unknown.deps)).body.error).toBe("unavailable")
    expect(unknown.logs).toEqual([["rejected"]])
    const unset = setup({ env: { DOWNLOAD_SIGNING_SECRET: SECRET } })
    const res = await handleSubscribe(good, "1.1.1.1", unset.deps)
    expect(res).toEqual({ status: 404, body: { success: false, error: "unavailable" } })
  })

  it("ip limit returns 429", async () => {
    const { deps, provider } = setup()
    let last = { status: 0 }
    for (let i = 0; i < 6; i++) last = await handleSubscribe({ ...good, email: `p${i}@example.com` }, "2.2.2.2", deps)
    expect(last.status).toBe(429)
    expect(provider.sendDownloadEmail).toHaveBeenCalledTimes(5)
  })

  it("email limit returns 429", async () => {
    const { deps, logs } = setup()
    let last = { status: 0 }
    for (let i = 0; i < 4; i++) last = await handleSubscribe(good, `3.3.3.${i}`, deps)
    expect(last.status).toBe(429)
    expect(logs.at(-1)).toEqual(["rate_limited"])
  })

  it("happy path adds the contact, sends a link that verifies, and logs subscribed", async () => {
    const { deps, provider, logs } = setup()
    const res = await handleSubscribe({ ...good, email: ` ${EMAIL} ` }, "1.1.1.1", deps)
    expect(res).toEqual({ status: 200, body: { success: true } })
    expect(provider.addContact).toHaveBeenCalledWith({ email: EMAIL, downloadId: good.downloadId, slug: "a-post" })
    const sent = provider.sendDownloadEmail.mock.calls[0][0]
    expect(sent.email).toBe(EMAIL)
    expect(sent.link.startsWith("https://1tx.dev/api/download/")).toBe(true)
    const token = sent.link.split("/api/download/")[1]
    const verified = verifyToken(token, SECRET, NOW)
    expect(verified.ok && verified.payload).toMatchObject({ downloadId: good.downloadId, slug: "a-post" })
    expect(logs).toEqual([["subscribed"]])
  })

  it("addContact failure is not fatal: email still sent, contact_failed logged", async () => {
    const { deps, provider, logs } = setup()
    provider.addContact.mockRejectedValueOnce(new Error("boom"))
    const res = await handleSubscribe(good, "1.1.1.1", deps)
    expect(res).toEqual({ status: 200, body: { success: true } })
    expect(provider.sendDownloadEmail).toHaveBeenCalled()
    expect(logs).toEqual([["contact_failed"], ["subscribed"]])
  })

  it("provider failure is 502", async () => {
    const { deps, provider, logs } = setup()
    provider.sendDownloadEmail.mockRejectedValueOnce(new Error("boom"))
    const res = await handleSubscribe(good, "1.1.1.1", deps)
    expect(res).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(logs.at(-1)).toEqual(["failed:send"])
  })

  it("missing signing secret is 502 server", async () => {
    const { deps, provider, logs } = setup({ env: { DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT: "https://x" } })
    const res = await handleSubscribe(good, "1.1.1.1", deps)
    expect(res.status).toBe(502)
    expect(provider.sendDownloadEmail).not.toHaveBeenCalled()
    expect(logs).toEqual([["failed:secret"]])
  })

  it("rate limiter outage fails closed with 502 server", async () => {
    const { deps, redis, provider, logs } = setup()
    redis.incr.mockRejectedValueOnce(new Error("redis down"))
    const res = await handleSubscribe(good, "1.1.1.1", deps)
    expect(logs).toEqual([["failed:limiter"]])
    expect(res).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(provider.sendDownloadEmail).not.toHaveBeenCalled()
  })

  it("no email appears in any log call or redis key", async () => {
    const a = setup()
    await handleSubscribe(good, "1.1.1.1", a.deps)
    const b = setup()
    b.provider.addContact.mockRejectedValueOnce(new Error(EMAIL))
    await handleSubscribe(good, "1.1.1.1", b.deps)
    const c = setup()
    c.provider.sendDownloadEmail.mockRejectedValueOnce(new Error(EMAIL))
    await handleSubscribe(good, "1.1.1.1", c.deps)
    const d = setup()
    for (let i = 0; i < 4; i++) await handleSubscribe(good, `9.9.9.${i}`, d.deps)
    for (const s of [a, b, c, d]) {
      const dump = JSON.stringify([s.logs, s.keys])
      expect(s.keys.length + s.logs.length).toBeGreaterThan(0)
      expect(dump.toLowerCase()).not.toContain(EMAIL)
      expect(dump).not.toContain("1.1.1.1")
      expect(dump).not.toContain("9.9.9.")
    }
  })
})
