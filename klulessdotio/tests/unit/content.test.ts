import { describe, expect, it } from "vitest"
import * as content from "@/lib/content"
import { GROUPS } from "@/lib/posters"
import { BOOKS } from "@/lib/books"

describe("site copy", () => {
  it("has no em dashes and no email address", () => {
    const all = JSON.stringify([content, GROUPS, BOOKS])
    expect(all).not.toContain("—")
    expect(all).not.toMatch(/[\w.]+@[\w.]+\.\w+/)
  })
  it("has the 11 greetings, English first", () => {
    expect(content.GREETINGS).toHaveLength(11)
    expect(content.GREETINGS[0].text).toBe("Hi, I'm Angad.")
    expect(content.GREETINGS.find((g) => g.lang === "ar")?.dir).toBe("rtl")
  })
  it("has the timeline newest first with Baked and Trufonomics wording", () => {
    expect(content.TIMELINE).toHaveLength(10)
    expect(content.TIMELINE[0].when).toBe("Apr 2026 to present")
    expect(content.TIMELINE.find((t) => t.what === "Founder, Baked")?.text).toContain("web3, blockchain and ReFi")
    expect(content.TIMELINE.find((t) => t.what === "Founder, Trufonomics")?.text?.startsWith("Founded solo.")).toBe(true)
  })
  it("reaches Angad by the four agreed links", () => {
    expect(content.REACH.map((r) => r.name)).toEqual(["Telegram", "LinkedIn", "X", "GitHub"])
  })
  it("links FishTally to its paper", () => {
    const fish = content.PROJECTS.find((p) => p.name === "FishTally")
    expect(fish?.badge?.text).toBe("Published in SoftwareX, 2026")
    expect(fish?.badge?.href).toBe("https://www.sciencedirect.com/science/article/pii/S2352711026001366")
  })
})
