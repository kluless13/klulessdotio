import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"

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

import { LibraryView } from "@/components/library/LibraryView"
import { ERAS } from "@/lib/library/catalogue"

const KEY = "1tx-library-view"

const headings = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.firstChild?.textContent?.trim())

beforeEach(() => window.localStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("LibraryView", () => {
  it("shows the title, the subtitle and every section in order", () => {
    render(<LibraryView />)
    expect(screen.getByRole("heading", { level: 1, name: "Library" })).toBeTruthy()
    expect(screen.getByText("Things I like and keep coming back to.")).toBeTruthy()
    expect(headings()).toEqual(["Type", ...ERAS])
    expect(screen.getByRole("heading", { level: 2, name: "Type 10" })).toBeTruthy()
  })

  it("makes each tile one button named after the item, hosting a mirrored exhibit", () => {
    render(<LibraryView />)
    const tile = screen.getByRole("button", { name: "Weighted" })
    expect(tile.hasAttribute("data-exhibit-host")).toBe(true)
    const stage = tile.querySelector(".lib-stage")
    expect(stage?.getAttribute("aria-hidden")).toBe("true")
    expect(stage?.hasAttribute("inert")).toBe(true)
    expect(tile.querySelector('[data-state="mirror"]')).not.toBeNull()
    expect(tile.querySelector("button")).toBeNull()
    expect(within(tile).getByText("Button")).toBeTruthy()
  })

  it("shows a font tile as Aa in its own face", () => {
    render(<LibraryView />)
    const tile = screen.getByRole("button", { name: "Geist" })
    const glyph = within(tile).getByText("Aa")
    expect(glyph.style.fontFamily).toContain("Geist Stub")
    expect(within(tile).getByText("Sans serif")).toBeTruthy()
  })

  it("sets the exhibit font properties on its root", () => {
    const { container } = render(<LibraryView />)
    const root = container.querySelector<HTMLElement>(".lib")
    expect(root?.style.getPropertyValue("--font-geist-sans")).toBe("Geist Stub")
    expect(root?.style.getPropertyValue("--font-inter")).toBe("Inter Stub")
  })

  it("filters to type and to buttons", () => {
    render(<LibraryView />)
    fireEvent.click(screen.getByRole("button", { name: "Type" }))
    expect(headings()).toEqual(["Type"])
    expect(screen.getByRole("button", { name: "Type" }).getAttribute("aria-pressed")).toBe("true")
    fireEvent.click(screen.getByRole("button", { name: "Buttons" }))
    expect(headings()).toEqual([...ERAS])
    fireEvent.click(screen.getByRole("button", { name: "All" }))
    expect(headings()).toEqual(["Type", ...ERAS])
  })

  it("switches to the list and remembers it", () => {
    const { container } = render(<LibraryView />)
    fireEvent.click(screen.getByRole("button", { name: "List" }))
    expect(window.localStorage.getItem(KEY)).toBe("list")
    expect(container.querySelector(".lib-tile")).toBeNull()
    const row = screen.getByRole("button", { name: "Geist" })
    expect(within(row).getByText("Sphinx of black quartz, judge my vow.")).toBeTruthy()
    expect(within(row).getByText("Vercel")).toBeTruthy()
    const buttonRow = screen.getByRole("button", { name: "Weighted" })
    expect(buttonRow.hasAttribute("data-exhibit-host")).toBe(true)
    expect(within(buttonRow).getByText("Seen on exa.ai")).toBeTruthy()
  })

  it("opens in the remembered view", () => {
    window.localStorage.setItem(KEY, "list")
    const { container } = render(<LibraryView />)
    expect(container.querySelector(".lib-row")).not.toBeNull()
    expect(screen.getByRole("button", { name: "List" }).getAttribute("aria-pressed")).toBe("true")
  })

  it("works with storage blocked", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("SecurityError")
    })
    const { container } = render(<LibraryView />)
    expect(container.querySelector(".lib-tile")).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "List" }))
    expect(container.querySelector(".lib-row")).not.toBeNull()
  })

  it("remembers the clicked item and starts from the initial one", () => {
    const { container } = render(<LibraryView initialSlug="inter" />)
    const root = container.querySelector(".lib")
    expect(root?.getAttribute("data-open-slug")).toBe("inter")
    fireEvent.click(screen.getByRole("button", { name: "Weighted" }))
    expect(root?.getAttribute("data-open-slug")).toBe("weighted")
  })
})
