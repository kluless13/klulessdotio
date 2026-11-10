import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"

vi.mock("next/font/google", () => ({ Caveat: () => ({ className: "caveat-stub", variable: "caveat-var", style: { fontFamily: "Caveat" } }) }))
vi.mock("geist/font/mono", () => ({ GeistMono: { className: "mono-stub", variable: "", style: { fontFamily: "Geist Mono" } } }))
vi.mock("@/components/ToneShell", () => ({
  ToneShell: ({ className, children }: { className: string; children: ReactNode }) => <div className={className}>{children}</div>,
}))
vi.mock("@/lib/kit/content", () => ({ loadKitContent: vi.fn() }))

import KitPage, { dynamic, generateMetadata } from "@/app/kit/[token]/page"
import { loadKitContent } from "@/lib/kit/content"
import { signKitToken, signToken, signUnsubToken } from "@/lib/downloads/token"
import type { KitDoc } from "@/lib/kit/types"

const SECRET = "kit-page-test-secret"
const load = vi.mocked(loadKitContent)
const DOC: KitDoc = {
  title: "Plant watering sample",
  blocks: [{ type: "paragraph", html: "Water the soil, not the leaves.", notes: [] }],
}
const saved = { kit: process.env.KIT_SIGNING_SECRET, download: process.env.DOWNLOAD_SIGNING_SECRET }

beforeAll(() => {
  process.env.KIT_SIGNING_SECRET = SECRET
  process.env.DOWNLOAD_SIGNING_SECRET = SECRET
})
afterAll(() => {
  process.env.KIT_SIGNING_SECRET = saved.kit
  process.env.DOWNLOAD_SIGNING_SECRET = saved.download
})
beforeEach(() => {
  load.mockReset()
  load.mockResolvedValue({ ok: true, doc: DOC })
})
afterEach(cleanup)

async function renderPage(token: string) {
  render(await KitPage({ params: { token } }))
}

const brokenLink = () => screen.queryByText("This link doesn't work.")

describe("/kit/[token]", () => {
  it("is never cached and never indexed", async () => {
    expect(dynamic).toBe("force-dynamic")
    const meta = await generateMetadata()
    expect(meta.title).toBe("Your starter kit · Angad Maniyambath")
    expect(meta.robots).toEqual({ index: false, follow: false })
  })

  it("sends no referrer and a noindex header for kit and unsubscribe links, but not the share image", async () => {
    const { default: config } = await import("@/next.config.mjs")
    const rules: { source: string; headers: { key: string; value: string }[] }[] = (await config.headers?.()) ?? []
    const private_ = [
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ]
    for (const source of ["/unsubscribe", "/api/unsubscribe/:token"]) {
      expect(rules.find((r) => r.source === source)?.headers, source).toEqual(private_)
    }
    const kit = rules.find((r) => r.source.startsWith("/kit/"))
    expect(kit?.headers).toEqual(private_)
    // The kit rule matches a token but not the share image
    // @ts-expect-error Next ships its path matcher without type declarations
    const { pathToRegexp } = await import("next/dist/compiled/path-to-regexp")
    const matches = pathToRegexp(kit!.source)
    expect(matches.test("/kit/abc.def")).toBe(true)
    expect(matches.test("/kit/og.jpg")).toBe(false)
  })

  it("renders the kit for a valid token, reading the text from the server's env only", async () => {
    await renderPage(signKitToken("reader@example.com", SECRET))
    expect(screen.getByRole("heading", { level: 1, name: "Plant watering sample" })).toBeTruthy()
    expect(load).toHaveBeenCalledWith(process.env)
    expect(brokenLink()).toBeNull()
  })

  const badTokens: [string, () => string][] = [
    ["a garbled token", () => "not-a-token"],
    ["a token signed with another secret", () => signKitToken("reader@example.com", "other-secret")],
    ["a download token", () => signToken({ downloadId: "d1", slug: "sample", exp: Date.now() + 60_000 }, SECRET)],
    ["an unsubscribe token", () => signUnsubToken("reader@example.com", SECRET)],
    ["a truncated token", () => signKitToken("reader@example.com", SECRET).slice(0, -6)],
    ["%%%", () => "%%%"],
    ["an empty token", () => ""],
  ]

  it.each(badTokens)("shows the friendly state and the signup form for %s", async (_name, make) => {
    await renderPage(make())
    expect(screen.getByRole("heading", { level: 1, name: "This link doesn't work." })).toBeTruthy()
    expect(screen.getByText("Pop in your email and I'll send you a fresh one.")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Send me the kit/ })).toBeTruthy()
    expect(load).not.toHaveBeenCalled()
  })

  it("says something went wrong when the kit text is unavailable", async () => {
    load.mockResolvedValue({ ok: false, reason: "unavailable" })
    await renderPage(signKitToken("reader@example.com", SECRET))
    expect(screen.getByRole("heading", { level: 1, name: "Something went wrong on my end." })).toBeTruthy()
    expect(screen.getByText("Try again in a minute.")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Send me the kit/ })).toBeNull()
  })

  it("says something went wrong, without a crash, when no signing secret is set", async () => {
    const token = signKitToken("reader@example.com", SECRET)
    process.env.KIT_SIGNING_SECRET = ""
    process.env.DOWNLOAD_SIGNING_SECRET = ""
    try {
      await renderPage(token)
      expect(screen.getByRole("heading", { level: 1, name: "Something went wrong on my end." })).toBeTruthy()
      expect(load).not.toHaveBeenCalled()
    } finally {
      process.env.KIT_SIGNING_SECRET = SECRET
      process.env.DOWNLOAD_SIGNING_SECRET = SECRET
    }
  })
})
