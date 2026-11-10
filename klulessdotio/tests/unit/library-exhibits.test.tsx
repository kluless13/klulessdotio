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

  it("live exhibits render real buttons, all type=button", () => {
    for (const { slug } of BUTTONS) {
      const { container } = render(<Exhibit slug={slug} state="live" />)
      const buttons = container.querySelectorAll("button")
      expect(buttons.length, slug).toBeGreaterThan(0)
      buttons.forEach((b) => expect(b.getAttribute("type")).toBe("button"))
      cleanup()
    }
  })

  it("mirror, rest, hover and pressed render no interactive elements", () => {
    for (const state of ["mirror", "rest", "hover", "pressed"] as const) {
      for (const { slug } of BUTTONS) {
        const { container } = render(<Exhibit slug={slug} state={state} />)
        expect(container.querySelector("button, [role], [tabindex], [type]"), `${slug} ${state}`).toBeNull()
        cleanup()
      }
    }
  })

  it("forced states keep the exhibit's classes on their spans", () => {
    const { container } = render(<Exhibit slug="weighted" state="pressed" />)
    expect(container.querySelector("span.lx-weighted")).not.toBeNull()
  })

  it("Mine is the site's real .btn with its label", () => {
    const { getByRole } = render(<Exhibit slug="mine" />)
    const button = getByRole("button", { name: "Say hello" })
    expect(button.classList.contains("btn")).toBe(true)
  })

  it("Mine keeps the .btn class in a forced state too", () => {
    const { getByText } = render(<Exhibit slug="mine" state="hover" />)
    expect(getByText("Say hello").classList.contains("btn")).toBe(true)
  })

  it("unknown slug throws", () => {
    expect(() => Exhibit({ slug: "nope" })).toThrow(/Unknown library exhibit/)
  })
})
