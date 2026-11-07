import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { GROUPS, POSTERS, groupOf, nextIndex, posterOfTheDay, firstIndexOfGroup } from "@/lib/posters"

describe("posters", () => {
  it("has 102 posters", () => {
    expect(POSTERS).toHaveLength(102)
  })
  it("leaves out the duplicates", () => {
    const titles = POSTERS.map((p) => p.title)
    expect(titles).not.toContain("nvda earnings 10")
    expect(titles.filter((t) => t === "cesr index 1")).toHaveLength(1)
    expect(titles.filter((t) => t.startsWith("netflix markets"))).toHaveLength(2)
    expect(new Set(POSTERS.map((p) => p.slug)).size).toBe(102)
  })
  it("has every file on disk", () => {
    for (const poster of POSTERS) {
      expect(fs.existsSync(path.join("public/p", `${poster.slug}.webp`))).toBe(true)
      expect(fs.existsSync(path.join("public/p", `${poster.slug}-t.webp`))).toBe(true)
    }
  })
  it("labels each group as Angad confirmed", () => {
    expect(groupOf("earnings").note).toBeUndefined()
    expect(groupOf("cesr").note).toBeUndefined()
    expect(groupOf("netflix").note).toBeUndefined()
    expect(groupOf("bigmac").note).toBeUndefined()
    expect(groupOf("bobbin").note).toBe("Case study")
    expect(groupOf("bobbin").text).toContain("Jeff")
    expect(groupOf("perplexity").note).toBe("Practice and experiments")
    expect(groupOf("quartr").note).toBe("Practice and experiments")
    expect(groupOf("prediction").note).toBe("Older personal experiments, not official work.")
    const official = GROUPS.filter((group) => !group.note)
    expect(JSON.stringify(official).toLowerCase()).not.toContain("stud")
  })
  it("merges NVDA, Meta and Tesla into Earnings", () => {
    const earnings = POSTERS.filter((p) => p.group === "earnings").map((p) => p.title)
    expect(earnings.some((t) => t.startsWith("nvda"))).toBe(true)
    expect(earnings.some((t) => t.startsWith("meta"))).toBe(true)
    expect(earnings.some((t) => t.startsWith("tsla"))).toBe(true)
  })
  it("picks the same poster all day in India and a different one tomorrow", () => {
    const morning = posterOfTheDay(new Date("2026-11-08T00:00:00+05:30"))
    const night = posterOfTheDay(new Date("2026-11-08T23:59:00+05:30"))
    const tomorrow = posterOfTheDay(new Date("2026-11-09T00:00:00+05:30"))
    expect(morning).toBe(night)
    expect(tomorrow).not.toBe(morning)
    expect(morning).toBeGreaterThanOrEqual(0)
    expect(morning).toBeLessThan(102)
  })
  it("wraps around at both ends", () => {
    expect(nextIndex(0, -1, 102)).toBe(101)
    expect(nextIndex(101, 1, 102)).toBe(0)
    expect(nextIndex(5, 1, 102)).toBe(6)
  })
  it("jumps to a group's first poster", () => {
    expect(POSTERS[firstIndexOfGroup("bobbin")].group).toBe("bobbin")
  })
})
