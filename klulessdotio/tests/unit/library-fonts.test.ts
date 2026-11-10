import { describe, expect, it, vi } from "vitest"

const { stub } = vi.hoisted(() => ({
  stub: (name: string) => ({ style: { fontFamily: name }, variable: "" }),
}))

vi.mock("next/font/google", () => ({
  Inter: () => stub("Inter Stub"),
  Averia_Serif_Libre: () => stub("Averia Stub"),
  Newsreader: () => stub("Newsreader Stub"),
  EB_Garamond: () => stub("EB Garamond Stub"),
  Fraunces: () => stub("Fraunces Stub"),
}))
vi.mock("geist/font/sans", () => ({ GeistSans: stub("Geist Stub") }))

import { FONTS } from "@/content/library"
import { FONTSHARE_STYLESHEET, fontFamily } from "@/lib/library/fonts"

describe("fontFamily", () => {
  it("returns a non-empty family for every catalogue font", () => {
    for (const f of FONTS) expect(fontFamily(f.slug).length).toBeGreaterThan(0)
  })

  it("uses the exact Helvetica stack", () => {
    expect(fontFamily("helvetica")).toBe('"Helvetica Neue", Helvetica, Arial, sans-serif')
  })

  it("returns the next/font family for loaded fonts", () => {
    expect(fontFamily("geist")).toBe("Geist Stub")
    expect(fontFamily("newsreader")).toBe("Newsreader Stub")
  })

  it("names the Fontshare families with a generic fallback", () => {
    expect(fontFamily("satoshi")).toBe("Satoshi, sans-serif")
    expect(fontFamily("general-sans")).toBe('"General Sans", sans-serif')
  })

  it("throws for an unknown slug", () => {
    expect(() => fontFamily("comic-sans")).toThrow()
  })
})

describe("FONTSHARE_STYLESHEET", () => {
  it("requests every catalogue weight for the three Fontshare fonts", () => {
    const url = decodeURIComponent(FONTSHARE_STYLESHEET)
    expect(url).toContain("f[]=satoshi@300,400,500,700,900")
    expect(url).toContain("f[]=switzer@100,200,300,400,500,600,700,800,900")
    expect(url).toContain("f[]=general-sans@200,300,400,500,600,700")
    expect(url).toContain("display=swap")
  })
})
