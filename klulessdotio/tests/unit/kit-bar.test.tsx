import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { KitBar } from "@/components/KitBar"
import { KITBAR_KEY, KITBAR_OFF_CLASS, KITBAR_SCRIPT, isKitPath } from "@/lib/kitbar"

const nav = vi.hoisted(() => ({ pathname: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }))

beforeEach(() => {
  nav.pathname = "/"
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.localStorage.clear()
  document.documentElement.classList.remove(KITBAR_OFF_CLASS)
})

const bar = () => screen.queryByRole("complementary", { name: "Starter kit" })

describe("KitBar", () => {
  it("offers the free kit with a link to /kit", () => {
    render(<KitBar />)
    expect(bar()).not.toBeNull()
    expect(screen.getByText("A free starter kit for getting AI to do real work in your tools.")).toBeTruthy()
    expect(screen.getByText("Free starter kit: get AI doing real work in your tools.")).toBeTruthy()
    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toBe("/kit")
    expect(link.textContent).toContain("Get the free kit")
  })

  it("closes, remembers the choice and hides across the page", () => {
    render(<KitBar />)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(bar()).toBeNull()
    expect(window.localStorage.getItem(KITBAR_KEY)).toBe("1")
    expect(document.documentElement.classList.contains(KITBAR_OFF_CLASS)).toBe(true)
  })

  it("still closes for this view when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    render(<KitBar />)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(bar()).toBeNull()
  })

  it("moves focus to the top bar's first link when closed", () => {
    render(
      <>
        <KitBar />
        <header>
          <span>Angad</span>
          <a href="/">Home</a>
          <a href="/writing">Writing</a>
        </header>
      </>,
    )
    const close = screen.getByRole("button", { name: "Close" })
    close.focus()
    fireEvent.click(close)
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Home" }))
  })

  it("lets go of focus when nothing follows it", () => {
    render(<KitBar />)
    const close = screen.getByRole("button", { name: "Close" })
    close.focus()
    fireEvent.click(close)
    expect(document.activeElement).toBe(document.body)
  })

  it("follows client-side navigation into and out of the kit", () => {
    nav.pathname = "/kit"
    const { rerender } = render(<KitBar />)
    expect(bar()).toBeNull()
    nav.pathname = "/writing"
    rerender(<KitBar />)
    expect(bar()).not.toBeNull()
    nav.pathname = "/kit/abc.def"
    rerender(<KitBar />)
    expect(bar()).toBeNull()
  })

  it.each(["/kit", "/kit/abc.def"])("is not rendered on %s", (path) => {
    nav.pathname = path
    render(<KitBar />)
    expect(bar()).toBeNull()
  })
})

describe("isKitPath", () => {
  it("matches the kit pages only", () => {
    expect(isKitPath("/kit")).toBe(true)
    expect(isKitPath("/kit/abc.def")).toBe(true)
    expect(isKitPath("/kitchen")).toBe(false)
    expect(isKitPath("/writing/kit")).toBe(false)
    expect(isKitPath("/")).toBe(false)
    expect(isKitPath(null)).toBe(false)
  })
})

describe("KITBAR_SCRIPT", () => {
  const run = () => new Function(KITBAR_SCRIPT)()

  it("hides the bar before paint for someone who closed it", () => {
    window.localStorage.setItem(KITBAR_KEY, "1")
    run()
    expect(document.documentElement.classList.contains(KITBAR_OFF_CLASS)).toBe(true)
  })

  it("leaves it alone otherwise, and survives blocked storage", () => {
    run()
    expect(document.documentElement.classList.contains(KITBAR_OFF_CLASS)).toBe(false)
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(run).not.toThrow()
    expect(document.documentElement.classList.contains(KITBAR_OFF_CLASS)).toBe(false)
  })
})
