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

  it("reports a job paragraph before Connect, or more than one after it, at the paragraph's own line", () => {
    const before = validateKit(doc(":::job{title=a who=b}\nBefore: x\n\nStray.\n\n> req\n\nConnect: y\n:::"))
    expect(before).toEqual([{ line: 6, message: expect.stringMatching(/after Connect/) }])
    const twice = validateKit(doc(":::job{title=a who=b}\nBefore: x\n\n> req\n\nConnect: y\n\nOne.\n\nTwo.\n:::"))
    expect(twice).toEqual([{ line: 12, message: expect.stringMatching(/one paragraph after Connect/) }])
  })

  it("reports anything in a job that would be dropped: a list or quote after Connect, a second request", () => {
    const list = validateKit(doc(":::job{title=a who=b}\nBefore: x\n\n> req\n\nConnect: y\n\n- one\n:::"))
    expect(list).toEqual([{ line: 10, message: expect.stringMatching(/dropped/) }])
    const quote = validateKit(doc(":::job{title=a who=b}\nBefore: x\n\n> req\n\nConnect: y\n\n> again\n:::"))
    expect(quote).toEqual([{ line: 10, message: expect.stringMatching(/dropped/) }])
    const second = validateKit(doc(":::job{title=a who=b}\nBefore: x\n\n> req\n\n> req two\n\nConnect: y\n:::"))
    expect(second).toEqual([{ line: 8, message: expect.stringMatching(/dropped/) }])
  })

  it("reports text before the first path, with or without a note", () => {
    const plain = validateKit(doc(":::paths\nIntro.\n\n::path[A]\nx\n:::"))
    expect(plain).toEqual([{ line: 4, message: expect.stringMatching(/before the first ::path/) }])
    const noted = validateKit(doc(':::paths\nIntro words. :note[N]{on="Intro"}\n\n::path[A]\nx\n:::'))
    expect(noted).toEqual([{ line: 4, message: expect.stringMatching(/before the first ::path/) }])
  })

  it("reports two notes that need the same single words", () => {
    const r = validateKit(doc('One red pot. :note[A]{on="red pot"} :note[B]{on="red pot"}'))
    expect(r).toEqual([{ line: 3, message: expect.stringContaining("red pot") }])
  })

  it("only closes a fence with the marker that opened it", () => {
    const md = doc(":::prompt\n~~~\n```\n[inside]\n~~~\n:::\n\n[outside]")
    expect(validateKit(md)).toEqual([{ line: 10, message: expect.stringMatching(/bracket/i) }])
  })

  describe("silent drops", () => {
    const dropped = (body: string) => validateKit(doc(body)).map((e) => ({ line: e.line, message: e.message }))
    const isDropped = (line: number) => [{ line, message: expect.stringMatching(/dropped/) }]

    it.each([
      ["a top-level quote", "> quoted"],
      ["a table", "| a | b |\n| - | - |\n| 1 | 2 |"],
      ["a divider", "---"],
      ["a level 4 heading", "#### Deep"],
      ["a top-level code block", "```\ncode\n```"],
      ["a second title", "# Another title"],
    ])("reports %s at its own line", (_name, body) => {
      expect(dropped(`ok\n\n${body}`)).toEqual(isDropped(5))
    })

    it("reports an image, a reference link, inline code and an unsafe link", () => {
      expect(dropped("See ![alt](/x.png) here")).toEqual([{ line: 3, message: expect.stringMatching(/image/) }])
      expect(dropped("See [ref][1] here\n\n[1]: https://example.com").map((e) => e.message)).toEqual([
        expect.stringMatching(/reference link/),
        expect.stringMatching(/bracket/),
        expect.stringMatching(/definition/),
      ])
      expect(dropped("Run `npm test` now")).toEqual([{ line: 3, message: expect.stringMatching(/Inline code/) }])
      expect(dropped("Go [here](javascript:alert) now")).toEqual([{ line: 3, message: expect.stringMatching(/Link must start/) }])
    })

    it("accepts safe links", () => {
      expect(dropped("Go [here](/writing/x) or [there](https://example.com) now")).toEqual([])
    })

    it("reports a nested list or code in a list item", () => {
      expect(dropped("- one\n  - nested\n- two")).toEqual(isDropped(4))
    })

    it("reports blocks the container drops, each at its line", () => {
      expect(dropped(":::steps\n- a\n\ntext\n:::")).toEqual(isDropped(6))
      expect(dropped(":::steps\ntext\n:::")).toEqual([{ line: 3, message: expect.stringMatching(/needs a list/) }])
      expect(dropped(":::timeline{find=1 decide=1 fix=1}\ntext\n\n```\nx\n```\n:::")).toEqual(isDropped(6))
      expect(dropped(":::before-after\nWords.\n\n- **A** one\n\n- **B** two\n\nextra\n\n> q\n:::")).toEqual([])
      expect(dropped(":::before-after\nWords.\n\n- **A** one\n\n---\n\n- again\n:::")).toEqual([
        { line: 8, message: expect.stringMatching(/divider/) },
        { line: 10, message: expect.stringMatching(/list/) },
      ])
      expect(dropped(":::prompt\n```\nx\n```\n\nstray\n:::")).toEqual(isDropped(8))
      expect(dropped(":::phrases\n- **A.** one\n\nstray\n:::")).toEqual(isDropped(6))
      expect(dropped("::::ending\nintro\n\n- a\n\n- b\n\n> q\n\n```\nx\n```\n::::")).toEqual([
        { line: 10, message: expect.stringMatching(/quote/) },
        { line: 12, message: expect.stringMatching(/code block/) },
      ])
      expect(dropped(":::paths\n::path[A]\ntext\n\n---\n:::")).toEqual(isDropped(7))
      expect(dropped(":::job{title=a who=b}\nBefore: x\n\n> - nested\n\nConnect: y\n:::")).toEqual(isDropped(6))
    })

    it("reports a second list in an ending and a note or fill used as a block", () => {
      expect(dropped("::::ending\n- a\n\ntext\n\n- b\n::::")).toEqual(isDropped(8))
      expect(dropped(":::note\nx\n:::")).toEqual(isDropped(3))
      expect(dropped("::note[x]")).toEqual(isDropped(3))
    })
  })
})
