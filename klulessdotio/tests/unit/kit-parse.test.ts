import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { parseKit } from "@/lib/kit/parse"
import type { KitBlock } from "@/lib/kit/types"

const fixture = fs.readFileSync(path.join(process.cwd(), "tests/fixtures/kit/kit.md"), "utf8")

const ALL_TYPES: KitBlock["type"][] = [
  "heading", "paragraph", "list", "steps", "paths", "timeline", "beforeAfter", "prompt", "job", "ending",
]

async function blocks(md: string): Promise<readonly KitBlock[]> {
  return (await parseKit(`# T\n\n${md}`)).blocks
}

function find<T extends KitBlock["type"]>(bs: readonly KitBlock[], type: T) {
  return bs.find((b) => b.type === type) as Extract<KitBlock, { type: T }>
}

describe("parseKit fixture", () => {
  it("gives a title and at least one block of every type", async () => {
    const doc = await parseKit(fixture)
    expect(doc.title).toBe("Plant watering sample")
    const seen = new Set(doc.blocks.map((b) => b.type))
    for (const t of ALL_TYPES) expect(seen.has(t), t).toBe(true)
  })
})

describe("inline marks", () => {
  it("turns ==a b== into a mark with a stable seed", async () => {
    const a = find(await blocks("Say ==a b== now."), "paragraph")
    const b = find(await blocks("Other ==a b== text."), "paragraph")
    const seed = (h: string) => /<mark class="hl" data-seed="([^"]+)">a b<\/mark>/.exec(h)?.[1]
    expect(seed(a.html)).toBeTruthy()
    expect(seed(a.html)).toBe(seed(b.html))
    const c = find(await blocks("Say ==c d== now."), "paragraph")
    expect(/data-seed="([^"]+)"/.exec(c.html)?.[1]).not.toBe(seed(a.html))
  })

  it("wraps note words and records the note", async () => {
    const p = find(
      await blocks('Open the red pots today. :note[N]{on="red pots"}'),
      "paragraph",
    )
    expect(p.notes).toEqual([{ on: "red pots", text: "N" }])
    expect(p.html).toContain('<span class="note-on" data-note="1">red pots</span>')
    expect(p.html).not.toContain("note[")
  })

  it("keeps list item notes on the list", async () => {
    const l = find(await blocks('- one\n- two words here :note[X]{on="two words"}'), "list")
    expect(l.notes).toEqual([{ on: "two words", text: "X" }])
    expect(l.items[1]).toContain('data-note="1"')
  })

  it("renders :fill", async () => {
    const p = find(await blocks("Use :fill[Xero] here."), "paragraph")
    expect(p.html).toContain('<span class="fill">Xero</span>')
  })

  it("keeps strong, em and safe links", async () => {
    const p = find(await blocks("**b** *i* [x](/a) [y](https://e.com/z)"), "paragraph")
    expect(p.html).toContain("<strong>b</strong>")
    expect(p.html).toContain("<em>i</em>")
    expect(p.html).toContain('<a href="/a">x</a>')
    expect(p.html).toContain('<a href="https://e.com/z">y</a>')
  })
})

describe("blocks", () => {
  it("reads the step number from a heading", async () => {
    const bs = await blocks("## 2 Sample step\n\n### Sub")
    expect(bs[0]).toEqual({ type: "heading", level: 2, text: "Sample step", step: 2 })
    expect(bs[1]).toEqual({ type: "heading", level: 3, text: "Sub" })
  })

  it("reads lists and steps", async () => {
    const l = find(await blocks("1. a\n2. b"), "list")
    expect(l.ordered).toBe(true)
    expect(l.items).toEqual(["a", "b"])
    const s = find(await blocks(":::steps\n- one\n- two\n:::"), "steps")
    expect(s.items).toEqual(["one", "two"])
  })

  it("reads paths with pick", async () => {
    const p = find(await blocks(":::paths\n::path[Claude]{pick}\nUse **it**.\n\n::path[ChatGPT]\nOther.\n:::"), "paths")
    expect(p.paths).toHaveLength(2)
    expect(p.paths[0]).toMatchObject({ name: "Claude", pick: true })
    expect(p.paths[0].html).toBe("Use <strong>it</strong>.")
    expect(p.paths[1]).toMatchObject({ name: "ChatGPT", pick: false, html: "Other." })
  })

  it("reads timeline numbers", async () => {
    const t = find(await blocks(":::timeline{find=10 decide=2 fix=5}\nAbout 17.\n:::"), "timeline")
    expect(t).toMatchObject({ find: 10, decide: 2, fix: 5, html: "About 17." })
  })

  it("rejects a non-numeric timeline", async () => {
    await expect(blocks(":::timeline{find=x decide=2 fix=5}\nA\n:::")).rejects.toThrow(/timeline/)
  })

  it("reads before-after", async () => {
    const b = find(await blocks(":::before-after\nBad ask.\n\n- **One:** Good ask.\n- **Two:** Better ask.\n:::"), "beforeAfter")
    expect(b.before).toBe("Bad ask.")
    expect(b.after).toEqual([
      { label: "One:", quote: "Good ask." },
      { label: "Two:", quote: "Better ask." },
    ])
  })

  it("keeps the prompt text exactly", async () => {
    const text = "Line one\n\n1. two\n  indented <b>"
    const p = find(await blocks(`:::prompt\n\`\`\`\n${text}\n\`\`\`\n:::`), "prompt")
    expect(p.text).toBe(text)
  })

  it("reads a job", async () => {
    const j = find(
      await blocks(':::job{title="Sorting" who="Gardeners"}\nBefore: matching **lines**.\n\n> Match these.\n> Change nothing.\n\nConnect: your software.\n:::'),
      "job",
    )
    expect(j).toEqual({
      type: "job",
      title: "Sorting",
      who: "Gardeners",
      before: "matching <strong>lines</strong>.",
      request: "Match these.\nChange nothing.",
      connect: "your software.",
    })
  })

  it("throws on an incomplete job", async () => {
    await expect(blocks(":::job{title=a who=b}\nBefore: x\n:::")).rejects.toThrow(/job/i)
  })

  it("reads an ending with cards", async () => {
    const e = find(
      await blocks(
        '::::ending\nIntro one.\n\n- **First:** a\n- b\n\n:::card{title="Card one" cta="Go" href="https://example.com/x"}\nCard **body**.\n:::\n\n:::card{title="Card two"}\nMore.\n:::\n\nOutro.\n::::',
      ),
      "ending",
    )
    expect(e.intro).toEqual(["Intro one."])
    expect(e.timeline).toEqual(["<strong>First:</strong> a", "b"])
    expect(e.cards).toEqual([
      { title: "Card one", html: "Card <strong>body</strong>.", cta: { label: "Go", href: "https://example.com/x" } },
      { title: "Card two", html: "More." },
    ])
    expect(e.outro).toEqual(["Outro."])
  })

  it("throws on bad cards", async () => {
    const card = (attrs: string) => blocks(`::::ending\n:::card{${attrs}}\nx\n:::\n::::`)
    await expect(card("")).rejects.toThrow(/title/)
    await expect(card('title=a cta="Go"')).rejects.toThrow(/cta/)
    await expect(card('title=a cta="Go" href="javascript:x"')).rejects.toThrow(/cta/)
  })
})

describe("safety", () => {
  it("drops javascript links and raw html", async () => {
    const doc = await parseKit(
      '# T\n\n[bad](javascript:alert(1)) and [protocol](//evil.com) <script>alert(1)</script> `code` ![i](x.png)\n\n<div onclick="x">hi</div>',
    )
    const html = JSON.stringify(doc.blocks)
    expect(html).not.toContain("javascript:")
    expect(html).not.toContain("//evil.com")
    expect(html).not.toContain("<script")
    expect(html).not.toContain("<div")
    expect(html).not.toContain("<code")
    expect(html).not.toContain("<img")
    expect(html).toContain("bad")
  })

  const BAD_HREFS: [string, string][] = [
    ["backslash", "/\\evil.com"],
    ["slash tab slash", "/\t/evil.com"],
    ["protocol relative", "//evil.com"],
    ["javascript", "javascript:alert(1)"],
    ["http", "http://evil.com"],
    ["space", "/a b"],
  ]

  it.each(BAD_HREFS)("drops a %s link in prose", async (_n, href) => {
    const p = find(await blocks(`[x](<${href}>)`), "paragraph")
    expect(p.html).toBe("x")
  })

  it.each(BAD_HREFS)("refuses a %s card href", async (_n, href) => {
    const md = `::::ending\n:::card{title=a cta=Go href="${href.replace(/\\/g, "\\\\").replace(/\t/g, "\\t")}"}\nx\n:::\n::::`
    await expect(blocks(md)).rejects.toThrow(/cta/)
  })

  it("keeps good links", async () => {
    const p = find(await blocks("[a](/x/y) [b](https://e.com/p?q=1)"), "paragraph")
    expect(p.html).toBe('<a href="/x/y">a</a> <a href="https://e.com/p?q=1">b</a>')
  })

  it("does not nest two notes on the same words", async () => {
    const p = find(await blocks('A red pot and a red pot. :note[A]{on="red pot"} :note[B]{on="red pot"}'), "paragraph")
    expect(p.html.match(/note-on/g)).toHaveLength(2)
    expect(p.html).not.toMatch(/note-on[^>]*>[^<]*<span class="note-on/)
  })

  it("escapes text", async () => {
    const p = find(await blocks('1 < 2 & "q"'), "paragraph")
    expect(p.html).toBe("1 &lt; 2 &amp; &quot;q&quot;")
  })

  it("throws without a title", async () => {
    await expect(parseKit("just text")).rejects.toThrow(/title/)
  })
})
