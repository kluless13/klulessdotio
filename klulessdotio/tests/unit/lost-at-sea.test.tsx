import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { LostAtSea } from "@/components/LostAtSea"

afterEach(cleanup)

describe("LostAtSea", () => {
  it("says the page is lost, in the agreed words", () => {
    render(<LostAtSea />)
    expect(screen.getByRole("heading", { level: 1, name: "Lost at sea." })).toBeTruthy()
    expect(screen.getByText("This page doesn't exist, but the rest of the site does.")).toBeTruthy()
  })

  it("offers a way home", () => {
    render(<LostAtSea />)
    const home = screen.getByRole("link", { name: "Take me home" })
    expect(home.getAttribute("href")).toBe("/")
    expect(home.className).toContain("btn")
  })

  it("has no 404 eyebrow above the heading", () => {
    const { container } = render(<LostAtSea />)
    expect(container.textContent).not.toContain("404")
  })
})
