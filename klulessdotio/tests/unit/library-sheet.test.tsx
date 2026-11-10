import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { MotionGlobalConfig } from "framer-motion"
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"

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
import { allItems } from "@/lib/library/catalogue"

const TOTAL = allItems().length
const dialog = () => screen.queryByRole("dialog")
const sheetTitle = () => within(screen.getByRole("dialog")).getByRole("heading", { level: 2 }).textContent

function spyHistory() {
  return {
    push: vi.spyOn(window.history, "pushState"),
    replace: vi.spyOn(window.history, "replaceState"),
    back: vi.spyOn(window.history, "back").mockImplementation(() => {}),
  }
}

function popTo(path: string, state: unknown = null) {
  window.history.replaceState(state, "", path)
  act(() => {
    window.dispatchEvent(new PopStateEvent("popstate", { state }))
  })
}

// jsdom has no layout, so the shared grow-and-shrink never finishes there and a closing sheet would never unmount.
// These tests take the reduced-motion path (a fade) with animations skipped; the grow is checked in a real browser.
beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
  const query = { matches: true, media: "(prefers-reduced-motion)", addEventListener: () => {}, removeEventListener: () => {} }
  vi.stubGlobal("matchMedia", () => query)
})
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false
  vi.unstubAllGlobals()
})
beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState(null, "", "/library")
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.documentElement.classList.remove("no-scroll")
})

describe("Library sheet", () => {
  it("opens from a tile and pushes the item's address", () => {
    const history = spyHistory()
    render(<LibraryView />)
    fireEvent.click(screen.getByRole("button", { name: "Geist" }))
    expect(history.push).toHaveBeenCalledWith({ library: "geist" }, "", "/library/geist")
    expect(sheetTitle()).toBe("Geist")
    expect(within(screen.getByRole("dialog")).getByText(`1 of ${TOTAL}`)).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }))
    expect(document.documentElement.classList.contains("no-scroll")).toBe(true)
  })

  it("shows the font's weights, its note and a link to get it", () => {
    render(<LibraryView initialSlug="helvetica" />)
    const sheet = screen.getByRole("dialog")
    expect(within(sheet).getByText("Sans serif, by Max Miedinger")).toBeTruthy()
    expect(within(sheet).getByText("Regular 400")).toBeTruthy()
    expect(within(sheet).getByText("Bold 700")).toBeTruthy()
    expect(within(sheet).getByText("Shown in your device's Helvetica. Without it, you'll see Arial.")).toBeTruthy()
    const get = within(sheet).getByRole("link", { name: "Get Helvetica" })
    expect(get.getAttribute("target")).toBe("_blank")
    expect(get.getAttribute("rel")).toBe("noopener")
    expect(get.className).toContain("btn")
  })

  it("shows a button live, in its three states, with its CSS", () => {
    render(<LibraryView initialSlug="weighted" />)
    const sheet = screen.getByRole("dialog")
    expect(sheet.querySelector('.lib-sheet-hero [data-state="live"]')).not.toBeNull()
    for (const state of ["rest", "hover", "pressed"]) expect(sheet.querySelector(`.lib-sheet-states [data-state="${state}"]`)).not.toBeNull()
    expect(within(sheet).getByText("Rest")).toBeTruthy()
    expect(within(sheet).getByText("A darker lip under the face gives it weight.")).toBeTruthy()
    expect(sheet.querySelector("pre code")?.textContent).toContain(".weighted {")
    expect(within(sheet).getByRole("link", { name: "Visit exa.ai" })).toBeTruthy()
  })

  it("copies the CSS and says so for two seconds", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    render(<LibraryView initialSlug="weighted" />)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy CSS" }))
    })
    expect(writeText.mock.calls[0][0]).toContain(".weighted {")
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByRole("button", { name: "Copy CSS" })).toBeTruthy()
    vi.useRealTimers()
    Reflect.deleteProperty(navigator, "clipboard")
  })

  it("steps with the arrow keys and replaces the address, wrapping at the ends", () => {
    const history = spyHistory()
    render(<LibraryView />)
    fireEvent.click(screen.getByRole("button", { name: "Geist" }))
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" })
    expect(sheetTitle()).toBe("Inter")
    expect(history.replace).toHaveBeenLastCalledWith({ library: "inter" }, "", "/library/inter")
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" })
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" })
    expect(sheetTitle()).toBe(allItems()[TOTAL - 1].name)
    expect(within(screen.getByRole("dialog")).getByText(`${TOTAL} of ${TOTAL}`)).toBeTruthy()
  })

  it("steps with the arrow buttons and a swipe, only within the current filter", () => {
    render(<LibraryView />)
    fireEvent.click(screen.getByRole("button", { name: "Type" }))
    fireEvent.click(screen.getByRole("button", { name: "Fraunces" }))
    expect(within(screen.getByRole("dialog")).getByText("10 of 10")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(sheetTitle()).toBe("Geist")
    fireEvent.click(screen.getByRole("button", { name: "Previous" }))
    expect(sheetTitle()).toBe("Fraunces")
    const frame = screen.getByRole("dialog").querySelector(".lib-sheet") as HTMLElement
    fireEvent.touchStart(frame, { touches: [{ clientX: 300, clientY: 400 }] })
    fireEvent.touchEnd(frame, { changedTouches: [{ clientX: 200, clientY: 410 }] })
    expect(sheetTitle()).toBe("Geist")
    fireEvent.touchStart(frame, { touches: [{ clientX: 200, clientY: 400 }] })
    fireEvent.touchEnd(frame, { changedTouches: [{ clientX: 230, clientY: 400 }] })
    expect(sheetTitle()).toBe("Geist")
  })

  it("leaves ⌘ and K to the keycaps", () => {
    render(<LibraryView initialSlug="keycaps" />)
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "k" })
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Meta", metaKey: true })
    expect(sheetTitle()).toBe("Keycaps")
    expect(dialog()).not.toBeNull()
  })

  it("closes with Escape by going back to the entry it pushed, and returns focus to the tile", async () => {
    const history = spyHistory()
    render(<LibraryView />)
    const tile = screen.getByRole("button", { name: "Geist" })
    fireEvent.click(tile)
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(history.back).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(dialog()).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Geist" }))
    expect(document.documentElement.classList.contains("no-scroll")).toBe(false)
  })

  it("closes a sheet loaded from its own address by replacing it with /library", async () => {
    window.history.replaceState(null, "", "/library/geist")
    const history = spyHistory()
    render(<LibraryView initialSlug="geist" />)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(history.back).not.toHaveBeenCalled()
    expect(history.replace).toHaveBeenLastCalledWith(null, "", "/library")
    await waitFor(() => expect(dialog()).toBeNull())
  })

  it("closes on a click on the dimmed page", async () => {
    spyHistory()
    const { container } = render(<LibraryView initialSlug="geist" />)
    fireEvent.click(container.querySelector(".lib-sheet-dim") as HTMLElement)
    await waitFor(() => expect(dialog()).toBeNull())
  })

  it("follows the back and forward buttons", async () => {
    const history = spyHistory()
    render(<LibraryView />)
    fireEvent.click(screen.getByRole("button", { name: "Weighted" }))
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" })
    popTo("/library")
    await waitFor(() => expect(dialog()).toBeNull())
    popTo("/library/weighted-light", { library: "weighted-light" })
    expect(sheetTitle()).toBe("Weighted, light")
    // Reopened by Forward, the entry is still this page's own, so closing goes back again.
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(history.back).toHaveBeenCalledTimes(1)
  })

  it("closes the share menu on Escape and keeps the sheet open", () => {
    render(<LibraryView initialSlug="weighted" />)
    fireEvent.click(screen.getByRole("button", { name: "Share" }))
    const copy = screen.getByRole("menuitem", { name: /Copy link/ })
    expect(document.activeElement).toBe(copy)
    fireEvent.keyDown(copy, { key: "Escape" })
    expect(screen.queryByRole("menu")).toBeNull()
    expect(dialog()).not.toBeNull()
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(screen.getByRole("dialog").hasAttribute("data-closing")).toBe(true)
  })

  it("shows a Link copied toast after copying the link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    render(<LibraryView initialSlug="weighted" />)
    fireEvent.click(screen.getByRole("button", { name: "Share" }))
    await act(async () => {
      fireEvent.click(screen.getByRole("menuitem", { name: /Copy link/ }))
    })
    expect(writeText).toHaveBeenCalledWith("https://1tx.dev/library/weighted")
    expect(screen.getByRole("status").textContent).toContain("Link copied")
    Reflect.deleteProperty(navigator, "clipboard")
  })

  it("keeps Tab inside the sheet", () => {
    render(<LibraryView initialSlug="geist" />)
    const close = screen.getByRole("button", { name: "Close" })
    const next = screen.getByRole("button", { name: "Next" })
    next.focus()
    fireEvent.keyDown(next, { key: "Tab" })
    expect(document.activeElement).not.toBe(next)
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true)
    close.focus()
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true)
  })
})
