import { describe, it, expect } from "vitest"
import { KIT_EMAIL_SUBJECT, kitEmailHtml, kitEmailText } from "@/lib/mail/kit-email"

const LINK = "https://1tx.dev/kit/abc.def"
const UNSUB = "https://1tx.dev/api/unsubscribe?t=xyz"

describe("kit email", () => {
  const html = kitEmailHtml(LINK, UNSUB)

  it("exports the subject", () => {
    expect(KIT_EMAIL_SUBJECT).toBe("Your starter kit is here")
  })

  it("has no em dash", () => {
    expect(html).not.toContain("—")
    expect(kitEmailText(LINK, UNSUB)).not.toContain("—")
  })

  it("uses absolute https for every href", () => {
    const urls = [...html.matchAll(/\bhref="([^"]*)"/g)].map((m) => m[1])
    expect(urls).toEqual([LINK, "https://1tx.dev", UNSUB])
  })

  it("contains the kit link, the sign-off and the unsubscribe link", () => {
    expect(html).toContain(`<a href="${LINK}"`)
    expect(html).toContain(">Open your kit</a>")
    expect(html).toContain("Angad<br>")
    expect(html).toContain(">Unsubscribe</a>")
    expect(html).toContain("Hi there,")
    expect(html).toContain("just reply to this email")
  })

  // Gmail files designed mail under Promotions, so the kit email reads like a personal letter.
  it("reads like a letter: no images, tables, hidden preheader, headline or button", () => {
    expect(html).not.toMatch(/<img\b/i)
    expect(html).not.toMatch(/<table\b/i)
    expect(html).not.toMatch(/<h[1-6]\b/i)
    expect(html).not.toContain("display:none")
    expect(html).not.toMatch(/background|box-shadow|border-radius|@keyframes/)
    expect(html).not.toContain("Talk to it. It does the work.")
  })

  it("shows no email address outside the given links", () => {
    const stripped = html.split(LINK).join("").split(UNSUB).join("")
    expect(stripped).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/)
  })

  it("escapes links placed in attributes", () => {
    const out = kitEmailHtml('https://x/y?a=1&b="2"', UNSUB)
    expect(out).toContain("a=1&amp;b=&quot;2&quot;")
  })

  it("text version has both links, the sign-off and no html tags", () => {
    const text = kitEmailText(LINK, UNSUB)
    expect(text).toContain(`Open your kit: ${LINK}`)
    expect(text).toContain(UNSUB)
    expect(text).toContain("Angad\n1tx.dev")
    expect(text).not.toMatch(/<[a-z/][^>]*>/i)
  })
})
