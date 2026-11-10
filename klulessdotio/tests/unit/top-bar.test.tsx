import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, within } from "@testing-library/react"
import { TopBar } from "@/components/writing/TopBar"

afterEach(cleanup)

describe("TopBar", () => {
  it("lists Writing, Library and Quiet in that order", () => {
    render(<TopBar />)
    const nav = screen.getByRole("navigation", { name: "Main" })
    const names = within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent)
    expect(names).toEqual(["Writing", "Library", "Quiet"])
    expect(screen.getByRole("link", { name: "Library" }).getAttribute("href")).toBe("/library")
  })

  it("marks only the current page", () => {
    render(<TopBar current="Library" />)
    expect(screen.getByRole("link", { name: "Library" }).getAttribute("aria-current")).toBe("page")
    expect(screen.getByRole("link", { name: "Writing" }).getAttribute("aria-current")).toBeNull()
    expect(screen.getByRole("link", { name: "Quiet" }).getAttribute("aria-current")).toBeNull()
  })
})
