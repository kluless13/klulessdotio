import { describe, expect, it } from "vitest"
import * as about from "@/content/about"

describe("about copy", () => {
  const all = JSON.stringify(about)
  it("has no em dashes, no email and says SoftwareX not SSRN", () => {
    expect(all).not.toContain("—")
    expect(all).not.toMatch(/[\w.]+@[\w.]+\.\w+/)
    expect(all).toContain("SoftwareX")
    expect(all).not.toContain("SSRN")
  })
  it("has four bio paragraphs and four elsewhere links ending in ORCID", () => {
    expect(about.BIO).toHaveLength(4)
    expect(about.ELSEWHERE.map((l) => l.label)).toEqual(["X", "GitHub", "LinkedIn", "ORCID"])
    expect(about.ELSEWHERE[3].href).toBe("https://orcid.org/0009-0000-0985-4721")
  })
})
