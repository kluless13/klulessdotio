import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { QuietLink } from "@/components/writing/QuietLink"

const realLocation = window.location

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  Object.defineProperty(window, "location", { configurable: true, value: realLocation })
})

describe("QuietLink", () => {
  it("QuietLink writes quiet mode then navigates", () => {
    const order: string[] = []
    const assign = vi.fn(() => order.push(`assign:${window.localStorage.getItem("1tx-mode")}`))
    Object.defineProperty(window, "location", { configurable: true, value: { ...realLocation, assign } })

    render(<QuietLink />)
    const link = screen.getByRole("link", { name: "Quiet" })
    expect(link.getAttribute("href")).toBe("/")
    const event = fireEvent.click(link)

    expect(event).toBe(false)
    expect(window.localStorage.getItem("1tx-mode")).toBe("quiet")
    expect(assign).toHaveBeenCalledWith("/")
    expect(order).toEqual(["assign:quiet"])
  })

  it("leaves modified clicks to the browser", () => {
    const assign = vi.fn()
    Object.defineProperty(window, "location", { configurable: true, value: { ...realLocation, assign } })

    render(<QuietLink />)
    fireEvent.click(screen.getByRole("link", { name: "Quiet" }), { metaKey: true })

    expect(assign).not.toHaveBeenCalled()
  })
})
