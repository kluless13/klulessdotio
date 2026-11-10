import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { CalButton, CAL_EMBED } from "@/components/kit/CalButton"
import { calLinkOf, isCalLink } from "@/lib/kit/cal"

type CalWindow = Window & { Cal?: ((...args: unknown[]) => void) & { q?: unknown[][] } }
const win = window as CalWindow
const scripts = () => document.querySelectorAll(`script[src="${CAL_EMBED}"]`)

afterEach(() => {
  cleanup()
  scripts().forEach((s) => s.remove())
  delete win.Cal
  document.documentElement.classList.remove("day")
})

function renderButton(tone?: "day" | "night") {
  return render(
    <div data-tone={tone}>
      <CalButton label="Book a free call" href="https://cal.com/angad888/show-me" />
    </div>,
  )
}

/** Fire the click and report whether the link would still navigate. */
function click(link: HTMLElement): boolean {
  let navigates = false
  // Runs after React's handler; read the outcome, then stop jsdom, which can't navigate
  const settle = (event: Event) => {
    navigates = !event.defaultPrevented
    event.preventDefault()
  }
  window.addEventListener("click", settle, { once: true })
  fireEvent(link, new MouseEvent("click", { bubbles: true, cancelable: true }))
  return navigates
}

describe("Cal links", () => {
  it("knows a Cal.com booking link from any other link", () => {
    expect(isCalLink("https://cal.com/angad888/show-me")).toBe(true)
    expect(isCalLink("https://example.com/angad888/show-me")).toBe(false)
    expect(isCalLink("https://cal.com/angad888")).toBe(false)
    expect(isCalLink("/kit")).toBe(false)
    expect(isCalLink("https://cal.com.evil.example/a/b")).toBe(false)
  })

  it("turns a booking link into the event Cal's embed opens", () => {
    expect(calLinkOf("https://cal.com/angad888/show-me")).toBe("angad888/show-me")
    expect(calLinkOf("https://cal.com/angad888/show-me/")).toBe("angad888/show-me")
  })
})

describe("CalButton", () => {
  it("is a .btn link to the booking page", () => {
    renderButton()
    const link = screen.getByRole("link", { name: /Book a free call/ })
    expect(link.getAttribute("href")).toBe("https://cal.com/angad888/show-me")
    expect(link.className).toContain("btn")
  })

  it("loads Cal's embed script once, however many buttons mount", () => {
    renderButton()
    renderButton()
    expect(scripts()).toHaveLength(1)
    expect(win.Cal?.q?.[0]?.[0]).toBe("init")
  })

  it("lets the link navigate until the script has loaded", () => {
    renderButton()
    expect(click(screen.getByRole("link"))).toBe(true)
  })

  it("lets the link navigate when the script fails", () => {
    renderButton()
    fireEvent.error(scripts()[0])
    expect(click(screen.getByRole("link"))).toBe(true)
  })

  it("opens the popup in the night theme once the script is ready", () => {
    renderButton("night")
    fireEvent.load(scripts()[0])
    const cal = vi.fn()
    win.Cal = cal
    expect(click(screen.getByRole("link"))).toBe(false)
    expect(cal).toHaveBeenCalledWith("modal", { calLink: "angad888/show-me", config: { theme: "dark" } })
  })

  it("follows the day tone", () => {
    renderButton("day")
    fireEvent.load(scripts()[0])
    const cal = vi.fn()
    win.Cal = cal
    click(screen.getByRole("link"))
    expect(cal).toHaveBeenCalledWith("ui", expect.objectContaining({ theme: "light" }))
    expect(cal).toHaveBeenCalledWith("modal", { calLink: "angad888/show-me", config: { theme: "light" } })
  })
})
