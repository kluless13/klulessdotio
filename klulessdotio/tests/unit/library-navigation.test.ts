import { describe, expect, it } from "vitest"
import { positionLabel, stepIndex } from "@/lib/library/navigation"

describe("library navigation", () => {
  it("wraps when stepping", () => {
    expect(stepIndex(0, -1, 10)).toBe(9)
    expect(stepIndex(9, 1, 10)).toBe(0)
    expect(stepIndex(3, 1, 10)).toBe(4)
  })

  it("labels the position", () => {
    expect(positionLabel(2, 10)).toBe("3 of 10")
  })
})
