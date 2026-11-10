import { describe, expect, it } from "vitest"
import { BUTTONS, FONTS } from "@/content/library"
import { allItems, itemBySlug, itemsFor, kindLabel, sectionsFor, slugify } from "@/lib/library/catalogue"

describe("library catalogue", () => {
  it("has 10 fonts and 32 buttons", () => {
    expect(FONTS.length).toBe(10)
    expect(BUTTONS.length).toBe(32)
  })

  it("slugs are unique across fonts and buttons", () => {
    const slugs = allItems().map((i) => i.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("slugify", () => {
    expect(slugify("Geist")).toBe("geist")
    expect(slugify("EB Garamond")).toBe("eb-garamond")
    expect(slugify("Weighted, light")).toBe("weighted-light")
    expect(slugify("Aqua, graphite")).toBe("aqua-graphite")
    expect(slugify("shadcn/ui")).toBe("shadcn-ui")
    for (const item of allItems()) expect(item.slug).toBe(slugify(item.name))
  })

  it("eras appear in order", () => {
    expect(sectionsFor("all").map((s) => s.title)).toEqual([
      "Type", "Weighted", "Retro desktops", "Web 2.0 and early iPhone", "Flat and Material", "Modern", "Soft and glass", "Mine",
    ])
  })

  it("filters", () => {
    expect(sectionsFor("type").map((s) => s.title)).toEqual(["Type"])
    expect(sectionsFor("buttons").map((s) => s.title)).not.toContain("Type")
    expect(itemsFor("all").length).toBe(42)
    expect(itemsFor("type").length).toBe(10)
    expect(itemsFor("buttons").length).toBe(32)
  })

  it("every item has a non-empty note, with no bracketed remarks", () => {
    for (const item of allItems()) {
      expect(item.note.trim().length).toBeGreaterThan(0)
      expect(item.note).not.toContain("Shown in")
    }
  })

  it("every button has 2 to 3 how lines and non-empty css", () => {
    for (const b of BUTTONS) {
      expect(b.how.length).toBeGreaterThanOrEqual(2)
      expect(b.how.length).toBeLessThanOrEqual(3)
      expect(b.css.trim().length).toBeGreaterThan(0)
    }
  })

  it("fonts carry weights and an https link", () => {
    for (const f of FONTS) {
      expect(f.weights.length).toBeGreaterThan(0)
      expect(f.link.startsWith("https://")).toBe(true)
    }
    expect(FONTS.find((f) => f.name === "Helvetica")?.systemNote).toBe(
      "Shown in your device's Helvetica. Without it, you'll see Arial.",
    )
  })

  it("has no em dashes in copy", () => {
    const texts: string[] = []
    for (const i of allItems()) {
      texts.push(i.name, i.note)
      if (i.kind === "button") texts.push(...i.how)
      else if (i.systemNote) texts.push(i.systemNote)
    }
    for (const t of texts) expect(t).not.toContain("—")
  })

  it("links: exa.ai sources link to exa.ai, Mine has none", () => {
    for (const b of BUTTONS.filter((x) => x.source.includes("exa.ai"))) {
      expect(b.link).toEqual({ label: "Visit exa.ai", href: "https://exa.ai" })
    }
    expect(BUTTONS.find((b) => b.name === "Mine")?.link).toBeUndefined()
    expect(BUTTONS.find((b) => b.name === "Primer green")?.link?.href).toBe("https://github.com")
    expect(BUTTONS.find((b) => b.name === "shadcn/ui")?.link?.href).toBe("https://ui.shadcn.com")
  })

  it("itemBySlug", () => {
    expect(itemBySlug("weighted")?.name).toBe("Weighted")
    expect(itemBySlug("nope")).toBeUndefined()
  })

  it("kindLabel", () => {
    expect(kindLabel(itemBySlug("geist")!)).toBe("Sans serif")
    expect(kindLabel(itemBySlug("eb-garamond")!)).toBe("Serif")
    expect(kindLabel(BUTTONS[0])).toBe("Button")
  })
})
