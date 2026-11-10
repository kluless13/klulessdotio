import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { validateKit } from "@/lib/kit/validate"

const fixture = fs.readFileSync(path.join(process.cwd(), "tests/fixtures/kit/kit.md"), "utf8")
const doc = (body: string) => `# Title\n\n${body}\n`

describe("validateKit", () => {
  it("accepts the fixture", () => {
    expect(validateKit(fixture)).toEqual([])
  })

  it("reports an em dash with its line", () => {
    const md = "# Title\n\nok\n\nok\n\nthis — is bad\n"
    const r = validateKit(md)
    expect(r).toHaveLength(1)
    expect(r[0].line).toBe(7)
    expect(r[0].message).toMatch(/em dash/i)
  })

  it("reports a leftover bracketed note", () => {
    const r = validateKit(doc("[COPY BUTTON]"))
    expect(r).toEqual([{ line: 3, message: expect.stringMatching(/bracket/i) }])
  })

  it("reports a line that starts with a bracket", () => {
    expect(validateKit(doc("[Verify this later] then text"))).toHaveLength(1)
  })

  it("does not flag brackets inside prompt code", () => {
    expect(validateKit(doc(":::prompt\n```\n[Xero] stays\n```\n:::"))).toEqual([])
  })

  it("reports an unknown directive", () => {
    const r = validateKit(doc(":::unknown\ntext\n:::"))
    expect(r).toEqual([{ line: 3, message: expect.stringContaining("unknown") }])
  })

  it("reports unknown leaf and text directives", () => {
    expect(validateKit(doc("::widget[x]"))).toHaveLength(1)
    expect(validateKit(doc("Hello :pill[x] there"))).toHaveLength(1)
  })

  it("reports a note whose words are missing", () => {
    const r = validateKit(doc('Some text. :note[N]{on="not here"}'))
    expect(r).toEqual([{ line: 3, message: expect.stringContaining("not here") }])
  })

  it("accepts a note whose words are in the block", () => {
    expect(validateKit(doc('Some text here. :note[N]{on="text here"}'))).toEqual([])
  })

  it("reports a prompt without a code block", () => {
    const r = validateKit(doc(":::prompt\njust text\n:::"))
    expect(r).toEqual([{ line: 3, message: expect.stringMatching(/prompt/) }])
  })

  it("reports a prompt with two code blocks", () => {
    expect(validateKit(doc(":::prompt\n```\na\n```\n\n```\nb\n```\n:::"))).toHaveLength(1)
  })

  it("reports a missing title", () => {
    const r = validateKit("## Only a section\n\ntext\n")
    expect(r).toEqual([{ line: 1, message: expect.stringMatching(/title/i) }])
  })

  it("reports raw html", () => {
    const r = validateKit(doc("<div>hi</div>"))
    expect(r).toEqual([{ line: 3, message: expect.stringMatching(/html/i) }])
  })

  it("reports inline html", () => {
    expect(validateKit(doc("text <b>bold</b> text"))).toHaveLength(2)
  })

  it("gives three entries with line numbers for three problems together", () => {
    const md = "# Title\n\nbad — dash\n\n[a leftover note]\n\n:::unknown\nx\n:::\n"
    const r = validateKit(md)
    expect(r.map((e) => e.line)).toEqual([3, 5, 7])
  })

  it("reports non-numeric timeline attributes", () => {
    const r = validateKit(doc(":::timeline{find=x decide=2}\ntext\n:::"))
    expect(r.map((e) => e.message)).toEqual([expect.stringContaining('"find"'), expect.stringContaining('"fix"')])
    expect(r[0].line).toBe(3)
  })

  it("reports an incomplete job", () => {
    const r = validateKit(doc(":::job{title=a who=b}\ntext\n:::"))
    expect(r).toHaveLength(3)
    expect(r.every((e) => e.line === 3)).toBe(true)
  })

  it("accepts a complete job", () => {
    expect(validateKit(doc(":::job{title=a who=b}\nBefore: x\n\n> req\n\nConnect: y\n:::"))).toEqual([])
  })

  it("reports an ending card without a title", () => {
    const r = validateKit(doc("::::ending\n:::card\nx\n:::\n::::"))
    expect(r).toEqual([{ line: 4, message: expect.stringMatching(/title/) }])
  })

  it("reports a cta without an href, and the reverse", () => {
    expect(validateKit(doc('::::ending\n:::card{title=a cta="Go"}\nx\n:::\n::::'))).toHaveLength(1)
    expect(validateKit(doc('::::ending\n:::card{title=a href="/x"}\nx\n:::\n::::'))).toHaveLength(1)
  })

  it("reports an unsafe card href", () => {
    expect(validateKit(doc('::::ending\n:::card{title=a cta=Go href="javascript:x"}\nx\n:::\n::::'))).toHaveLength(1)
  })

  const BAD_HREFS = ["/\\evil.com", "/\t/evil.com", "//evil.com", "javascript:x"]
  it.each(BAD_HREFS)("reports unsafe card href %j", (href) => {
    const esc = href.replace(/\\/g, "\\\\").replace(/\t/g, "\\t")
    expect(validateKit(doc(`::::ending\n:::card{title=a cta=Go href="${esc}"}\nx\n:::\n::::`))).toHaveLength(1)
  })

  it("reports a stray directive fence", () => {
    const r = validateKit(doc("text\n\n:::"))
    expect(r).toEqual([{ line: 5, message: expect.stringMatching(/fence/i) }])
  })

  it("reports a card outside an ending", () => {
    const r = validateKit(doc(":::card{title=a}\nx\n:::"))
    expect(r).toEqual([{ line: 3, message: expect.stringMatching(/card must sit inside ending/) }])
  })

  it("reports a path outside paths", () => {
    const r = validateKit(doc("::path[Solo]"))
    expect(r).toEqual([{ line: 3, message: expect.stringMatching(/path must sit inside paths/) }])
  })

  it("reports the 3-colon ending holding a card probe", () => {
    // Equal-length fences close the outer container early, leaving a stray fence behind.
    const r = validateKit(doc(':::ending\nintro\n\n:::card{title=a}\nx\n:::\n:::'))
    expect(r).toEqual([{ line: 9, message: expect.stringMatching(/fence/i) }])
  })

  it("accepts a card inside a 4-colon ending", () => {
    expect(validateKit(doc("::::ending\n:::card{title=a}\nx\n:::\n::::"))).toEqual([])
  })

  it("reports a note inside a job, card, timeline, phrases or a list in a path", () => {
    const inJob = ":::job{title=a who=b}\nBefore: x :note[N]{on=\"x\"}\n\n> r\n\nConnect: y\n:::"
    const inCard = '::::ending\n:::card{title=a}\nword :note[N]{on="word"}\n:::\n::::'
    const inTimeline = ':::timeline{find=1 decide=1 fix=1}\nword :note[N]{on="word"}\n:::'
    const inPathList = ':::paths\n::path[A]\n- word :note[N]{on="word"}\n:::'
    const inPhrases = ':::phrases\n- **Say.** word :note[N]{on="word"}\n:::'
    for (const body of [inJob, inCard, inTimeline, inPathList, inPhrases]) {
      const r = validateKit(doc(body))
      expect(r.map((e) => e.message), body).toEqual([expect.stringMatching(/only allowed in paragraphs and list items/)])
    }
  })

  it("accepts a note in a path's paragraph", () => {
    expect(validateKit(doc(':::paths\n::path[A]\nSay the word. :note[N]{on="the word"}\n:::'))).toEqual([])
  })

  it("reports a path note whose words are missing, at the note's line", () => {
    const r = validateKit(doc(':::paths\n::path[A]\nSay it.\nAgain. :note[N]{on="the word"}\n:::'))
    expect(r).toEqual([{ line: 6, message: expect.stringContaining('"the word"') }])
  })

  it("accepts phrases that each start in bold", () => {
    expect(validateKit(doc(':::phrases\n- **"Say this."** It does that.\n- **==Wave.==** It waves.\n:::'))).toEqual([])
  })

  it("reports a phrase that doesn't start in bold, and phrases without a list", () => {
    const r = validateKit(doc(":::phrases\n- **Fine.** Yes.\n- Plain words.\n:::\n\n:::phrases\nNo list.\n:::"))
    expect(r).toEqual([
      { line: 5, message: expect.stringMatching(/start with bold/) },
      { line: 8, message: expect.stringMatching(/needs a list/) },
    ])
  })

  it("accepts one paragraph after a job's Connect", () => {
    expect(validateKit(doc(":::job{title=a who=b}\nBefore: x\n\n> req\n\nConnect: y\n\nSee more.\n:::"))).toEqual([])
  })

  it("reports a job paragraph before Connect, or more than one after it", () => {
    const before = validateKit(doc(":::job{title=a who=b}\nBefore: x\n\nStray.\n\n> req\n\nConnect: y\n:::"))
    expect(before).toEqual([{ line: 3, message: expect.stringMatching(/after Connect/) }])
    const twice = validateKit(doc(":::job{title=a who=b}\nBefore: x\n\n> req\n\nConnect: y\n\nOne.\n\nTwo.\n:::"))
    expect(twice).toEqual([{ line: 3, message: expect.stringMatching(/one paragraph after Connect/) }])
  })

  it("reports two notes that need the same single words", () => {
    const r = validateKit(doc('One red pot. :note[A]{on="red pot"} :note[B]{on="red pot"}'))
    expect(r).toEqual([{ line: 3, message: expect.stringContaining("red pot") }])
  })

  it("only closes a fence with the marker that opened it", () => {
    const md = doc("~~~\n```\n[inside]\n~~~\n\n[outside]")
    expect(validateKit(md)).toEqual([{ line: 8, message: expect.stringMatching(/bracket/i) }])
  })
})
