import { describe, expect, it } from "vitest"
import { highlightPath, highlightStroke, underlinePath } from "@/lib/kit/ink"

/** Every x coordinate in a path made only of M, C and L commands with absolute "x y" pairs. */
function xs(d: string): number[] {
  const numbers = d
    .replace(/[MCLZ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number)
  return numbers.filter((_, i) => i % 2 === 0)
}

describe("highlightPath", () => {
  it("gives the same path for the same inputs", () => {
    expect(highlightPath("abc", 240, 22, 0)).toBe(highlightPath("abc", 240, 22, 0))
  })

  it("changes with the seed and with the line", () => {
    const base = highlightPath("abc", 240, 22, 0)
    expect(highlightPath("abd", 240, 22, 0)).not.toBe(base)
    expect(highlightPath("abc", 240, 22, 1)).not.toBe(base)
  })

  it("starts with M and stays within the width, give or take 4px", () => {
    for (const [seed, width, line] of [["a", 40, 0], ["seed", 240, 1], ["long one", 612, 2], ["tiny", 12, 0]] as const) {
      const d = highlightPath(seed, width, 22, line)
      expect(d.startsWith("M")).toBe(true)
      expect(d).not.toContain("NaN")
      for (const x of xs(d)) {
        expect(x).toBeGreaterThanOrEqual(-4)
        expect(x).toBeLessThanOrEqual(width + 4)
      }
    }
  })

  it("is the body of the full stroke, which also has a streak and an opacity jitter", () => {
    const stroke = highlightStroke("abc", 240, 22, 0)
    expect(stroke.body).toBe(highlightPath("abc", 240, 22, 0))
    expect(stroke.streak.startsWith("M")).toBe(true)
    expect(Math.abs(stroke.jitter)).toBeLessThanOrEqual(0.06)
  })
})

describe("underlinePath", () => {
  it("is deterministic, seeded and starts with M", () => {
    const d = underlinePath("words", 120)
    expect(d.startsWith("M")).toBe(true)
    expect(underlinePath("words", 120)).toBe(d)
    expect(underlinePath("other", 120)).not.toBe(d)
    expect(d).not.toContain("NaN")
  })
})
