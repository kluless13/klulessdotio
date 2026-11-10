import { describe, expect, it } from "vitest"
import { LIBRARY_PATH, itemPath, itemUrl, slugFromPath } from "@/lib/library/history"

describe("library history paths", () => {
  it("builds an item's path", () => {
    expect(itemPath("geist")).toBe("/library/geist")
  })

  it("builds an item's full address for sharing", () => {
    expect(itemUrl("weighted")).toBe("https://1tx.dev/library/weighted")
  })

  it("reads the slug back from a path", () => {
    expect(slugFromPath("/library/geist")).toBe("geist")
    expect(slugFromPath("/library/geist/")).toBe("geist")
  })

  it("returns null for the library itself and for unknown items", () => {
    expect(LIBRARY_PATH).toBe("/library")
    expect(slugFromPath("/library")).toBeNull()
    expect(slugFromPath("/library/")).toBeNull()
    expect(slugFromPath("/library/nope")).toBeNull()
    expect(slugFromPath("/writing/geist")).toBeNull()
    expect(slugFromPath("/library/geist/extra")).toBeNull()
  })
})
