import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { BUTTONS } from "@/content/library"
import { EXHIBITS, Exhibit } from "@/components/library/exhibits"

afterEach(cleanup)

describe("library exhibits", () => {
  it("every button slug has an exhibit", () => {
    expect(BUTTONS.every((b) => b.slug in EXHIBITS)).toBe(true)
  })

  it("no extra exhibits", () => {
    expect(Object.keys(EXHIBITS)).toHaveLength(32)
  })

  it("mirror sets data-state=mirror", () => {
    const { container } = render(<Exhibit slug="weighted" state="mirror" />)
    expect(container.querySelector('[data-state="mirror"]')).not.toBeNull()
  })

  it("forced states set data-state", () => {
    const { container } = render(<Exhibit slug="weighted" state="pressed" />)
    expect(container.querySelector('[data-state="pressed"]')).not.toBeNull()
  })

  it("defaults to the live state", () => {
    const { container } = render(<Exhibit slug="weighted" />)
    expect(container.querySelector('[data-state="live"]')).not.toBeNull()
  })

  it("scale becomes a transform on the wrapper", () => {
    const { container } = render(<Exhibit slug="weighted" scale={1.5} />)
    expect((container.querySelector(".lx") as HTMLElement).style.transform).toBe("scale(1.5)")
  })

  it("every exhibit renders a non-submitting button", () => {
    for (const { slug } of BUTTONS) {
      const { container } = render(<Exhibit slug={slug} />)
      const buttons = container.querySelectorAll("button")
      expect(buttons.length, slug).toBeGreaterThan(0)
      buttons.forEach((b) => expect(b.getAttribute("type")).toBe("button"))
      cleanup()
    }
  })

  it("Mine is the site's real .btn with its label", () => {
    const { getByRole } = render(<Exhibit slug="mine" />)
    const button = getByRole("button", { name: "Say hello" })
    expect(button.classList.contains("btn")).toBe(true)
  })

  it("unknown slug throws", () => {
    expect(() => Exhibit({ slug: "nope" })).toThrow(/Unknown library exhibit/)
  })
})
