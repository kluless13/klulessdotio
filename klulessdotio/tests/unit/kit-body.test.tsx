import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import fs from "node:fs"
import path from "node:path"

vi.mock("next/font/google", () => ({ Caveat: () => ({ className: "caveat-stub", variable: "caveat-var", style: { fontFamily: "Caveat" } }) }))
vi.mock("geist/font/mono", () => ({ GeistMono: { className: "mono-stub", variable: "", style: { fontFamily: "Geist Mono" } } }))

import { KitBody } from "@/components/kit/KitBody"
import { parseKit } from "@/lib/kit/parse"
import type { KitBlock, KitDoc } from "@/lib/kit/types"

const fixture = fs.readFileSync(path.join(process.cwd(), "tests/fixtures/kit/kit.md"), "utf8")
let doc: KitDoc

beforeAll(async () => {
  doc = await parseKit(fixture)
})
afterEach(cleanup)

const ofType = <T extends KitBlock["type"]>(type: T) => doc.blocks.filter((b) => b.type === type) as Extract<KitBlock, { type: T }>[]

describe("KitBody", () => {
  it("shows the title, the subtitle and the byline", () => {
    render(<KitBody doc={doc} />)
    expect(screen.getByRole("heading", { level: 1, name: doc.title })).toBeTruthy()
    expect(screen.getByText("A free starter kit for getting AI agents to do real work in your tools. No code.")).toBeTruthy()
    expect(screen.getByText("Head of AI at Truflation")).toBeTruthy()
  })

  it("gives every numbered step a badge", () => {
    const { container } = render(<KitBody doc={doc} />)
    const steps = ofType("heading").filter((h) => h.step !== undefined)
    const badges = Array.from(container.querySelectorAll(".kit-badge"))
    expect(steps.length).toBeGreaterThan(0)
    expect(badges.map((b) => b.textContent)).toEqual(steps.map((s) => String(s.step)))
  })

  it("renders one mark.hl per highlight in the text", () => {
    const { container } = render(<KitBody doc={doc} />)
    const highlights = fixture.match(/==[^=\n]+?==/g) ?? []
    expect(highlights.length).toBeGreaterThan(0)
    expect(container.querySelectorAll("mark.hl")).toHaveLength(highlights.length)
  })

  it("puts each note in an aside right after its block, tied to underlined words", () => {
    const { container } = render(<KitBody doc={doc} />)
    const notes = doc.blocks.flatMap((b) =>
      b.type === "paragraph" || b.type === "list" ? b.notes : b.type === "paths" ? b.paths.flatMap((p) => p.notes) : [],
    )
    expect(notes.length).toBeGreaterThan(2)
    const asides = Array.from(container.querySelectorAll<HTMLElement>('aside[aria-label="Note"]'))
    expect(asides.map((a) => a.textContent)).toEqual(notes.map((n) => n.text))
    for (const aside of asides) {
      const group = aside.closest(".kit-noted")
      const words = group?.querySelector(`.note-on[data-note="${aside.dataset.note}"]`)
      expect(words).toBeTruthy()
      expect(words!.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(group?.firstElementChild?.contains(words!)).toBe(true)
    }
  })

  it("draws no arrows", () => {
    const { container } = render(<KitBody doc={doc} />)
    expect(container.querySelector("[data-arrow]")).toBeNull()
  })

  it("shows the prompt exactly, in the only mono text on the page", () => {
    const { container } = render(<KitBody doc={doc} />)
    const prompt = ofType("prompt")[0].text
    const mono = Array.from(container.querySelectorAll(".mono-stub"))
    expect(mono).toHaveLength(1)
    expect(mono[0].tagName).toBe("PRE")
    expect(mono[0].textContent).toBe(prompt)
    expect(screen.getByRole("button", { name: /Copy prompt/ }).className).toContain("btn")
  })

  it("links the booking card to Cal.com", () => {
    render(<KitBody doc={doc} />)
    const link = screen.getByRole("link", { name: /Book a visit/ })
    expect(link.getAttribute("href")).toBe("https://cal.com/angad888/show-me")
    expect(link.className).toContain("btn")
  })

  it("renders the paths with a My pick tag on the picked one", () => {
    const { container } = render(<KitBody doc={doc} />)
    const paths = Array.from(container.querySelectorAll(".kit-path"))
    expect(paths.map((p) => p.querySelector(".kit-path-name")?.firstChild?.textContent)).toEqual(["Terracotta", "Glass"])
    expect(paths[0].querySelector(".kit-pick")?.textContent).toBe("My pick")
    expect(paths[1].querySelector(".kit-pick")).toBeNull()
  })

  it("sums the timeline and sizes the bars by minutes", () => {
    const { container } = render(<KitBody doc={doc} />)
    expect(screen.getByText("8 minutes, start to finish")).toBeTruthy()
    const parts = container.querySelector<HTMLElement>(".kit-timeline-parts")
    expect(parts?.style.gridTemplateColumns).toBe("minmax(min-content, 3fr) minmax(min-content, 1fr) minmax(min-content, 4fr)")
    expect(Array.from(container.querySelectorAll(".kit-timeline-minutes")).map((m) => m.textContent)).toEqual(["3 min", "1 min", "4 min"])
  })

  it("quotes the before and after, numbering the after parts", () => {
    const { container } = render(<KitBody doc={doc} />)
    expect(container.querySelector(".kit-ba-before .kit-ba-quote")?.textContent).toBe("“Water everything every day.”")
    const labels = Array.from(container.querySelectorAll(".kit-ba-part-label")).map((l) => l.textContent)
    expect(labels).toEqual(["1. Basil", "2. Mint"])
  })

  it("splits a job title into its name and what it does, and quotes the request", () => {
    const { container } = render(<KitBody doc={doc} />)
    const job = container.querySelector(".kit-job")!
    expect(job.querySelector(".kit-job-name")?.textContent).toBe("Repotting")
    expect(job.querySelector(".kit-job-what")).toBeNull()
    expect(job.querySelector(".kit-job-request")?.textContent).toMatch(/^“Choose a pot one size up from the old pot\..*”$/)
    expect(job.querySelector(".kit-job-request span.fill")?.textContent).toBe("the old pot")
    expect(job.querySelector(".kit-job-connect")?.textContent).toContain("Connect: a garden shop")
  })

  it("puts the job's extra line inside the card, between the request and Connect", () => {
    const { container } = render(<KitBody doc={doc} />)
    const recipe = Array.from(container.querySelector(".kit-job-recipe")!.children).map((c) => c.className)
    expect(recipe).toEqual(["kit-job-before", "kit-job-request", "kit-job-more", "kit-job-connect"])
    const more = container.querySelector(".kit-job-more")!
    expect(more.querySelector("a")?.getAttribute("href")).toBe("/writing/sample-post")
  })

  it("renders phrases as bold lines with their explanation below, without bullets", () => {
    const { container } = render(<KitBody doc={doc} />)
    const rows = Array.from(container.querySelectorAll(".kit-phrases > li"))
    expect(rows.map((r) => r.querySelector(".kit-phrase")?.textContent)).toEqual(["“Check before you pour.”", "“Little and often.”"])
    expect(rows.map((r) => r.querySelector(".kit-phrase-note")?.textContent)).toEqual(["A finger in the soil comes first.", "Small sips beat a flood."])
    expect(rows[0].querySelector(".kit-phrase mark.hl")).toBeTruthy()
  })

  it("puts a path's note beside that path box", () => {
    const { container } = render(<KitBody doc={doc} />)
    const path = container.querySelector(".kit-paths .kit-noted")!
    expect(path.firstElementChild?.classList.contains("kit-path")).toBe(true)
    expect(path.querySelector('aside[aria-label="Note"]')?.textContent).toBe("Glazed ones hold water longer.")
  })

  it("ends with the timeline list, the cards, then the last paragraph", () => {
    const { container } = render(<KitBody doc={doc} />)
    const ending = container.querySelector(".kit-ending")!
    const years = Array.from(ending.querySelectorAll(".kit-year-when")).map((y) => y.textContent)
    expect(years).toEqual(["Spring", "Autumn"])
    const kids = Array.from(ending.children).map((c) => c.className)
    expect(kids.indexOf("kit-years")).toBeLessThan(kids.indexOf("kit-cards"))
    expect(ending.lastElementChild?.textContent).toBe("Anything bigger than a windowsill is a job for a landscaper.")
  })

  it("keeps fill-ins as spans for the lighter colour", () => {
    const { container } = render(<KitBody doc={doc} />)
    expect(container.querySelector("span.fill")?.textContent).toBe("the plant name")
  })
})

describe("CopyPrompt", () => {
  it("copies the exact prompt and says Copied for two seconds", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    render(<KitBody doc={doc} />)
    const button = screen.getByRole("button", { name: /Copy prompt/ })
    await act(async () => {
      fireEvent.click(button)
    })
    expect(writeText).toHaveBeenCalledWith(ofType("prompt")[0].text)
    expect(button.textContent).toContain("Copied")
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(button.textContent).toContain("Copy prompt")
    vi.useRealTimers()
  })

  it("selects the prompt when the clipboard refuses", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"))
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    const { container } = render(<KitBody doc={doc} />)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt/ }))
    })
    expect(window.getSelection()?.toString()).toBe(container.querySelector("pre")?.textContent)
    expect(screen.getByRole("button", { name: /Copy prompt/ })).toBeTruthy()
  })
})
