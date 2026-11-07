import fs from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { loadContributions, parseContributions } from "@/lib/contributions"

afterEach(() => vi.unstubAllGlobals())

const cell = (date: string, level: number) => `<td tabindex="0" data-date="${date}" id="x" data-level="${level}" role="gridcell"></td>`
const SAMPLE = [cell("2026-01-05", 1), cell("2026-01-04", 0), cell("2026-01-11", 4), cell("2026-01-12", 2)].join("\n")

describe("parseContributions", () => {
  it("groups days into Sunday-first weeks in date order", () => {
    expect(parseContributions(SAMPLE)).toEqual([[0, 1], [4, 2]])
  })
  it("returns nothing for a page with no grid", () => {
    expect(parseContributions("<html></html>")).toEqual([])
  })
})

describe("loadContributions", () => {
  it("returns the grid", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(SAMPLE)))
    expect(await loadContributions()).toEqual({ success: true, data: { weeks: [[0, 1], [4, 2]] } })
  })
  it("fails quietly", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html></html>")))
    expect((await loadContributions()).success).toBe(false)
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline") }))
    expect((await loadContributions()).success).toBe(false)
  })
})

describe("GitHub's real page", () => {
  it("parses a saved sample of the markup", () => {
    const html = fs.readFileSync("tests/fixtures/github-contributions.html", "utf8")
    const weeks = parseContributions(html)
    expect(weeks.flat()).toHaveLength(21)
    expect(weeks.every((week) => week.every((level) => level >= 0 && level <= 4))).toBe(true)
    expect(weeks.slice(0, -1).every((week) => week.length === 7)).toBe(true)
  })
})
