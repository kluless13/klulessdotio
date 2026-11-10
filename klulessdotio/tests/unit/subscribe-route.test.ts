import { withTimeout } from "@/lib/timeout"
import { afterEach, describe, expect, it, vi } from "vitest"
import { handleSubscribe, type SubscribeDeps } from "@/lib/subscribe"
import { verifyToken, verifyKitToken, verifyUnsubToken, kitSubject } from "@/lib/downloads/token"

const EMAIL = "reader.person@example.com"
const SECRET = "test-secret"
const ENV = { DOWNLOAD_SIGNING_SECRET: SECRET, DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT: "https://blob.example/private/abc" }
const NOW = 1_700_000_000_000

function setup(over: Partial<SubscribeDeps> = {}, counts: Record<string, number> = {}) {
  const keys: string[] = []
  const logs: unknown[][] = []
  const deferred: Promise<unknown>[] = []
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
    sendKitEmail: vi.fn(async (_i: { email: string; link: string; unsubscribeLink: string }) => undefined),
    unsubscribe: vi.fn(async (_email: string) => undefined),
  }
  const deps: SubscribeDeps = {
    redis,
    provider,
    env: ENV,
    now: () => NOW,
    origin: "https://1tx.dev",
    log: (...args: unknown[]) => void logs.push(args),
    defer: (work: Promise<unknown>) => void deferred.push(work),
    ...over,
  }
  // Runs what the route hands to waitUntil, as Vercel would after the reply.
  const settle = () => Promise.all(deferred)
  return { deps, redis, provider, keys, logs, deferred, settle }
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
    const { deps, provider, logs, settle } = setup()
    provider.addContact.mockRejectedValueOnce(new Error("boom"))
    const res = await handleSubscribe(good, "1.1.1.1", deps)
    expect(res).toEqual({ status: 200, body: { success: true } })
    expect(provider.sendDownloadEmail).toHaveBeenCalled()
    await settle()
    expect(logs).toEqual([["subscribed"], ["contact_failed", "error"]])
  })

  it("logs the provider's safe reason code when the contact fails", async () => {
    const { deps, provider, logs, settle } = setup()
    provider.addContact.mockRejectedValueOnce(Object.assign(new Error("x"), { code: "validation_error" }))
    await handleSubscribe(good, "1.1.1.1", deps)
    await settle()
    expect(logs.at(-1)).toEqual(["contact_failed", "validation_error"])
  })

  it("never logs a reason code that is not a plain name", async () => {
    const { deps, provider, logs, settle } = setup()
    provider.addContact.mockRejectedValueOnce(Object.assign(new Error("x"), { code: EMAIL }))
    await handleSubscribe(good, "1.1.1.1", deps)
    await settle()
    expect(logs.at(-1)).toEqual(["contact_failed", "error"])
  })

  it("provider failure is 502", async () => {
    const { deps, provider, logs } = setup()
    provider.sendDownloadEmail.mockRejectedValueOnce(new Error("boom"))
    const res = await handleSubscribe(good, "1.1.1.1", deps)
    expect(res).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(logs.at(-1)).toEqual(["failed:send", "error"])
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
    await b.settle()
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

describe("handleSubscribe kit branch", () => {
  const kit = { kind: "kit", kit: "starter-kit", email: EMAIL, consent: true }
  const kitEnv = { KIT_SIGNING_SECRET: "kit-secret", RESEND_SEGMENT_ID: "seg-all", RESEND_KIT_SEGMENT_ID: "seg-kit" }

  it("sends one kit email whose links verify", async () => {
    const { deps, provider, logs } = setup({ env: kitEnv })
    const res = await handleSubscribe({ ...kit, email: ` ${EMAIL.toUpperCase()} ` }, "1.1.1.1", deps)
    expect(res).toEqual({ status: 200, body: { success: true } })
    expect(provider.sendKitEmail).toHaveBeenCalledTimes(1)
    const sent = provider.sendKitEmail.mock.calls[0][0]
    expect(sent.link.startsWith("https://1tx.dev/kit/")).toBe(true)
    const kitToken = verifyKitToken(sent.link.split("/kit/")[1], "kit-secret")
    expect(kitToken).toEqual({ ok: true, subject: kitSubject(EMAIL) })
    expect(sent.unsubscribeLink.startsWith("https://1tx.dev/api/unsubscribe/")).toBe(true)
    const unsub = verifyUnsubToken(sent.unsubscribeLink.split("/api/unsubscribe/")[1], "kit-secret")
    expect(unsub).toEqual({ ok: true, email: EMAIL })
    expect(logs).toEqual([["subscribed"]])
  })

  it("adds the contact to both segments when both are set", async () => {
    const { deps, provider } = setup({ env: kitEnv })
    await handleSubscribe(kit, "1.1.1.1", deps)
    expect(provider.addContact).toHaveBeenCalledWith({ email: EMAIL, segments: ["seg-all", "seg-kit"] })
  })

  it("adds the contact to one segment when the kit segment is not set", async () => {
    const { deps, provider } = setup({ env: { ...kitEnv, RESEND_KIT_SEGMENT_ID: undefined } })
    await handleSubscribe(kit, "1.1.1.1", deps)
    expect(provider.addContact).toHaveBeenCalledWith({ email: EMAIL, segments: ["seg-all"] })
  })

  it("addContact failure still sends and returns 200", async () => {
    const { deps, provider, logs, settle } = setup({ env: kitEnv })
    provider.addContact.mockRejectedValueOnce(new Error("boom"))
    const res = await handleSubscribe(kit, "1.1.1.1", deps)
    expect(res.status).toBe(200)
    expect(provider.sendKitEmail).toHaveBeenCalled()
    await settle()
    expect(logs).toEqual([["subscribed"], ["contact_failed", "error"]])
  })

  it("sendKitEmail rejection is 502 server", async () => {
    const { deps, provider, logs } = setup({ env: kitEnv })
    provider.sendKitEmail.mockRejectedValueOnce(new Error("boom"))
    const res = await handleSubscribe(kit, "1.1.1.1", deps)
    expect(res).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(logs.at(-1)).toEqual(["failed:send", "error"])
  })

  it("missing secret is 502 and sends nothing", async () => {
    const { deps, provider, logs } = setup({ env: {} })
    const res = await handleSubscribe(kit, "1.1.1.1", deps)
    expect(res.status).toBe(502)
    expect(provider.sendKitEmail).not.toHaveBeenCalled()
    expect(logs).toEqual([["failed:secret"]])
  })

  it("honeypot returns 200 and sends nothing", async () => {
    const { deps, provider, redis } = setup({ env: kitEnv })
    const res = await handleSubscribe({ ...kit, company_url: "http://spam" }, "1.1.1.1", deps)
    expect(res).toEqual({ status: 200, body: { success: true } })
    expect(provider.sendKitEmail).not.toHaveBeenCalled()
    expect(redis.incr).not.toHaveBeenCalled()
  })

  it("rejects a bad email or missing consent with 400", async () => {
    const { deps, provider } = setup({ env: kitEnv })
    expect((await handleSubscribe({ ...kit, email: "nope" }, "1.1.1.1", deps)).status).toBe(400)
    expect((await handleSubscribe({ ...kit, consent: false }, "1.1.1.1", deps)).status).toBe(400)
    expect(provider.sendKitEmail).not.toHaveBeenCalled()
  })

  it("applies the email limit", async () => {
    const { deps } = setup({ env: kitEnv })
    let last = { status: 0 }
    for (let i = 0; i < 4; i++) last = await handleSubscribe(kit, `4.4.4.${i}`, deps)
    expect(last.status).toBe(429)
  })
})

describe("kit branch timing and case", () => {
  afterEach(() => vi.useRealTimers())
  const kit = { kind: "kit", kit: "starter-kit", email: EMAIL, consent: true }
  const never = () => new Promise<never>(() => undefined)

  it("with every provider call hanging, the reply is 502 by about 5s and failed:send is logged", async () => {
    vi.useFakeTimers()
    const { deps, provider, logs } = setup({ env: { KIT_SIGNING_SECRET: "s" } })
    provider.addContact.mockImplementation(never)
    provider.sendKitEmail.mockImplementation(() => withTimeout(never(), 5000))
    const pending = handleSubscribe(kit, "1.1.1.1", deps)
    await vi.advanceTimersByTimeAsync(5001)
    expect(await pending).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(logs).toEqual([["failed:send", "timeout"]])
  })

  it("starts the contact once the send succeeds, and replies without waiting for it", async () => {
    vi.useFakeTimers()
    const { deps, provider, deferred, settle } = setup({ env: { KIT_SIGNING_SECRET: "s" } })
    provider.addContact.mockImplementation(never)
    expect(await handleSubscribe(kit, "1.1.1.1", deps)).toEqual({ status: 200, body: { success: true } })
    expect(provider.addContact).toHaveBeenCalledTimes(1)
    expect(deferred).toHaveLength(1)
    const background = settle()
    await vi.advanceTimersByTimeAsync(12_001)
    await background
  })

  it("adds no contact when the kit email fails to send", async () => {
    const { deps, provider, deferred, logs } = setup({ env: { KIT_SIGNING_SECRET: "s" } })
    provider.sendKitEmail.mockRejectedValue(new Error("boom"))
    expect((await handleSubscribe(kit, "1.1.1.1", deps)).status).toBe(502)
    expect(provider.addContact).not.toHaveBeenCalled()
    expect(deferred).toHaveLength(0)
    expect(logs).toEqual([["failed:send", "error"]])
  })

  it("lowercases the email once and uses it everywhere", async () => {
    const { deps, provider } = setup({ env: { KIT_SIGNING_SECRET: "s" } })
    await handleSubscribe({ ...kit, email: "Reader.Person@Example.com" }, "1.1.1.1", deps)
    expect(provider.addContact.mock.calls[0][0].email).toBe(EMAIL)
    expect(provider.sendKitEmail.mock.calls[0][0].email).toBe(EMAIL)
  })
})

describe("contact deadline", () => {
  afterEach(() => vi.useRealTimers())
  const kit = { kind: "kit", kit: "starter-kit", email: EMAIL, consent: true }
  const never = () => new Promise<never>(() => undefined)

  it("download: a hanging contact chain never delays the reply, and gives up after 12s in the background", async () => {
    vi.useFakeTimers()
    const { deps, provider, logs, settle } = setup()
    provider.addContact.mockImplementation(never)
    expect(await handleSubscribe(good, "1.1.1.1", deps)).toEqual({ status: 200, body: { success: true } })
    expect(provider.sendDownloadEmail).toHaveBeenCalledTimes(1)
    expect(logs).toEqual([["subscribed"]])
    const background = settle()
    await vi.advanceTimersByTimeAsync(11_999)
    expect(logs).toEqual([["subscribed"]])
    await vi.advanceTimersByTimeAsync(2)
    await background
    expect(logs).toEqual([["subscribed"], ["contact_failed", "timeout"]])
  })

  it("download: the contact waits until the send has gone out", async () => {
    const { deps, provider } = setup()
    provider.sendDownloadEmail.mockImplementation(never)
    void handleSubscribe(good, "1.1.1.1", deps)
    await vi.waitFor(() => expect(provider.sendDownloadEmail).toHaveBeenCalled())
    await new Promise((r) => setTimeout(r, 0))
    expect(provider.addContact).not.toHaveBeenCalled()
  })

  it("download: a send that fails is 502 and does not wait for the contact", async () => {
    const { deps, provider, logs } = setup()
    provider.addContact.mockImplementation(never)
    provider.sendDownloadEmail.mockRejectedValue(new Error("boom"))
    expect(await handleSubscribe(good, "1.1.1.1", deps)).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(provider.addContact).not.toHaveBeenCalled()
    expect(logs).toEqual([["failed:send", "error"]])
  })

  it("download: a slow send and a slow contact together never exceed the 5s send cap", async () => {
    vi.useFakeTimers()
    const { deps, provider } = setup()
    provider.addContact.mockImplementation(never)
    provider.sendDownloadEmail.mockImplementation(() => withTimeout(never(), 5000))
    const pending = handleSubscribe(good, "1.1.1.1", deps)
    await vi.advanceTimersByTimeAsync(5001)
    expect(await pending).toEqual({ status: 502, body: { success: false, error: "server" } })
  })

  it("kit: a contact that takes 3s still completes in the background, with no failure logged", async () => {
    vi.useFakeTimers()
    const { deps, provider, logs, settle } = setup({ env: { KIT_SIGNING_SECRET: "s" } })
    provider.addContact.mockImplementation(() => new Promise((r) => setTimeout(r, 3000)))
    expect(await handleSubscribe(kit, "1.1.1.1", deps)).toEqual({ status: 200, body: { success: true } })
    expect(provider.sendKitEmail).toHaveBeenCalledTimes(1)
    const background = settle()
    await vi.advanceTimersByTimeAsync(3001)
    await background
    expect(logs).toEqual([["subscribed"]])
  })

  it("kit: a hanging contact chain gives up after 12s and logs timeout", async () => {
    vi.useFakeTimers()
    const { deps, provider, logs, settle } = setup({ env: { KIT_SIGNING_SECRET: "s" } })
    provider.addContact.mockImplementation(never)
    expect(await handleSubscribe(kit, "1.1.1.1", deps)).toEqual({ status: 200, body: { success: true } })
    const background = settle()
    await vi.advanceTimersByTimeAsync(12_001)
    await background
    expect(logs).toEqual([["subscribed"], ["contact_failed", "timeout"]])
  })
})

describe("limiter timeout", () => {
  afterEach(() => vi.useRealTimers())
  const hang = () => new Promise<never>(() => undefined)

  it("kit: a limiter that never resolves gives 502 server and sends nothing", async () => {
    vi.useFakeTimers()
    const { deps, redis, provider, logs } = setup({ env: { KIT_SIGNING_SECRET: "s" } })
    redis.incr.mockImplementation(hang)
    const pending = handleSubscribe({ kind: "kit", kit: "starter-kit", email: EMAIL, consent: true }, "1.1.1.1", deps)
    await vi.advanceTimersByTimeAsync(5001)
    expect(await pending).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(logs).toEqual([["failed:limiter"]])
    expect(provider.sendKitEmail).not.toHaveBeenCalled()
  })

  it("download: a limiter that never resolves gives 502 server and sends nothing", async () => {
    vi.useFakeTimers()
    const { deps, redis, provider, logs } = setup()
    redis.incr.mockImplementation(hang)
    const pending = handleSubscribe(good, "1.1.1.1", deps)
    await vi.advanceTimersByTimeAsync(5001)
    expect(await pending).toEqual({ status: 502, body: { success: false, error: "server" } })
    expect(logs).toEqual([["failed:limiter"]])
    expect(provider.sendDownloadEmail).not.toHaveBeenCalled()
  })
})
