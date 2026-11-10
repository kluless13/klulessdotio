import { describe, it, expect } from "vitest"
import {
  KIT_EMAIL_SUBJECT,
  KIT_EMAIL_PREVIEW,
  kitEmailHtml,
  kitEmailText,
} from "@/lib/mail/kit-email"

const LINK = "https://1tx.dev/kit/abc.def"
const UNSUB = "https://1tx.dev/api/unsubscribe?t=xyz"

describe("kit email", () => {
  const html = kitEmailHtml(LINK, UNSUB)

  it("exports the subject and preview", () => {
    expect(KIT_EMAIL_SUBJECT).toBe("Your starter kit is here")
    expect(KIT_EMAIL_PREVIEW).toBe("Five steps to get the AI you already pay for doing real work.")
  })

  it("has no em dash", () => {
    expect(html).not.toContain("—")
    expect(kitEmailText(LINK, UNSUB)).not.toContain("—")
  })

  it("uses absolute https for every src and href", () => {
    const urls = [...html.matchAll(/\b(?:src|href)="([^"]*)"/g)].map((m) => m[1])
    expect(urls.length).toBeGreaterThanOrEqual(4)
    for (const url of urls) expect(url).toMatch(/^https:\/\//)
  })

  it("contains both links, the images and the copy", () => {
    expect(html).toContain(`href="${LINK}"`)
    expect(html).toContain(`href="${UNSUB}"`)
    expect(html).toContain('src="https://1tx.dev/email/kit-header.gif"')
    expect(html).toContain('src="https://1tx.dev/email/signature-angad.png"')
    expect(html).toContain("Open your kit")
    expect(html).toContain(">Unsubscribe</a>")
    expect(html).not.toContain("one click")
    expect(html).toContain(KIT_EMAIL_PREVIEW)
  })

  it("has the card radius and the reduced-motion-guarded pulse", () => {
    expect(html).toContain("border-radius:18px")
    expect(html).toContain("@keyframes kitpulse")
    expect(html).toContain("prefers-reduced-motion: no-preference")
  })

  it("shows no email address outside the given links", () => {
    const stripped = html.split(LINK).join("").split(UNSUB).join("")
    expect(stripped).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/)
  })

  it("escapes links placed in attributes", () => {
    const out = kitEmailHtml('https://x/y?a=1&b="2"', UNSUB)
    expect(out).toContain("a=1&amp;b=&quot;2&quot;")
  })

  it("text version has both links and no html tags", () => {
    const text = kitEmailText(LINK, UNSUB)
    expect(text).toContain(LINK)
    expect(text).toContain(UNSUB)
    expect(text).not.toMatch(/<[a-z/][^>]*>/i)
  })
})
