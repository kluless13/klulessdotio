import { describe, it, expect } from "vitest"
import { renderMarkdown } from "@/lib/writing/markdown"

const none = () => false
const all = () => true

describe("renderMarkdown", () => {
  it("resolves relative image paths per slug", async () => {
    const html = await renderMarkdown("![A chart](images/a.png)", "my-post", none)
    expect(html).toContain('src="/writing/my-post/a.png"')
    expect(html).toContain('alt="A chart"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('decoding="async"')
  })

  it("wraps image plus italic line as figure with that caption and drops the italic paragraph", async () => {
    const md = "![Alt text](images/a.png)\n\n*The real caption.*\n\nNext paragraph."
    const html = await renderMarkdown(md, "s", none)
    expect(html).toContain('<figure class="post-figure')
    expect(html).toContain("<figcaption>The real caption.</figcaption>")
    expect(html).not.toContain("<p><em>The real caption.</em></p>")
    expect(html).toContain("<p>Next paragraph.</p>")
  })

  it("uses alt as caption when no italic line follows", async () => {
    const html = await renderMarkdown("![Only alt](images/a.png)\n\nPlain text.", "s", none)
    expect(html).toContain("<figcaption>Only alt</figcaption>")
  })

  it("keeps italic paragraphs that do not follow an image", async () => {
    const html = await renderMarkdown("Intro.\n\n*Method and paper.*", "s", none)
    expect(html).toContain("<p><em>Method and paper.</em></p>")
    expect(html).not.toContain("figure")
  })

  it("pairs a dark variant when the file exists", async () => {
    const seen: string[] = []
    const has = (p: string) => (seen.push(p), p.endsWith("-dark.png"))
    const html = await renderMarkdown("![Alt](images/a.png)\n\n*Cap*", "s", has)
    expect(seen).toContain("/writing/s/a-dark.png")
    expect(html).toContain("fig-light")
    expect(html).toContain("fig-dark")
    expect(html).toContain('src="/writing/s/a-dark.png"')
    expect(html).not.toContain("fig-card")
    expect((html.match(/<img/g) ?? []).length).toBe(2)
  })

  it("marks figures without a dark variant as cards", async () => {
    const html = await renderMarkdown("![Alt](images/a.png)\n\n*Cap*", "s", none)
    expect(html).toContain("fig-card")
    expect((html.match(/<img/g) ?? []).length).toBe(1)
  })

  it("adds rel noopener to external links only", async () => {
    const md = "[ext](https://example.com) [own](https://1tx.dev/x) [www](https://www.1tx.dev) [rel](/writing) [rel2](foo)"
    const html = await renderMarkdown(md, "s", none)
    expect(html).toContain('<a href="https://example.com" rel="noopener">ext</a>')
    expect(html).toContain('<a href="https://1tx.dev/x">own</a>')
    expect(html).toContain('<a href="https://www.1tx.dev">www</a>')
    expect(html).toContain('<a href="/writing">rel</a>')
    expect(html).toContain('<a href="foo">rel2</a>')
  })

  it("wraps tables", async () => {
    const html = await renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |", "s", none)
    expect(html).toContain('<div class="post-table"><table>')
    expect(html).toContain("</table></div>")
  })

  it("renders bold, italic, h2, h3, lists and quotes", async () => {
    const md = "## Two\n\n### Three\n\n**bold** and *italic*\n\n- one\n- two\n\n> quoted"
    const html = await renderMarkdown(md, "s", none)
    for (const part of ["<h2>Two</h2>", "<h3>Three</h3>", "<strong>bold</strong>", "<em>italic</em>", "<li>one</li>", "<blockquote>"]) {
      expect(html).toContain(part)
    }
  })

  it("does not pass raw html through", async () => {
    const html = await renderMarkdown("Hi\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>", "s", all)
    expect(html).not.toContain("<script")
    expect(html).not.toContain("onerror")
  })

  it("defaults hasFile to a disk check without throwing", async () => {
    const html = await renderMarkdown("![A](images/nope.png)", "no-such-slug")
    expect(html).toContain("fig-card")
  })
})
