import { readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
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

describe("playable live exhibits", () => {
  it("gel switch flips aria-checked and the label", () => {
    render(<Exhibit slug="gel-switch" />)
    const toggle = screen.getByRole("switch")
    expect(toggle.getAttribute("aria-checked")).toBe("true")
    expect(toggle.textContent).toContain("ON")
    fireEvent.click(toggle)
    expect(toggle.getAttribute("aria-checked")).toBe("false")
    expect(toggle.textContent).toContain("OFF")
    fireEvent.click(toggle)
    expect(toggle.getAttribute("aria-checked")).toBe("true")
  })

  it("segmented moves the selection to the clicked segment", () => {
    render(<Exhibit slug="segmented" />)
    expect(screen.getByRole("button", { name: "Week" }).getAttribute("aria-pressed")).toBe("true")
    fireEvent.click(screen.getByRole("button", { name: "Day" }))
    expect(screen.getByRole("button", { name: "Day" }).getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByRole("button", { name: "Week" }).getAttribute("aria-pressed")).toBe("false")
  })

  it("keycaps press K on a k keydown and clear after 150ms", () => {
    vi.useFakeTimers()
    try {
      render(<Exhibit slug="keycaps" />)
      const k = screen.getByText("K")
      expect(k.getAttribute("data-pressed")).toBeNull()
      act(() => {
        fireEvent.keyDown(window, { key: "k" })
      })
      expect(k.getAttribute("data-pressed")).toBe("true")
      expect(screen.getByText("⌘").getAttribute("data-pressed")).toBeNull()
      act(() => {
        vi.advanceTimersByTime(150)
      })
      expect(k.getAttribute("data-pressed")).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it("keycaps press the command key for a Meta keydown and never prevent default", () => {
    render(<Exhibit slug="keycaps" />)
    let event!: KeyboardEvent
    act(() => {
      event = new KeyboardEvent("keydown", { key: "Meta", metaKey: true, cancelable: true })
      window.dispatchEvent(event)
    })
    expect(screen.getByText("⌘").getAttribute("data-pressed")).toBe("true")
    expect(event.defaultPrevented).toBe(false)
  })

  it("keycaps ignore keys typed in an input", () => {
    render(
      <>
        <input aria-label="field" />
        <Exhibit slug="keycaps" />
      </>,
    )
    fireEvent.keyDown(screen.getByLabelText("field"), { key: "k" })
    expect(screen.getByText("K").getAttribute("data-pressed")).toBeNull()
  })

  it("keycaps remove their listener on unmount", () => {
    const remove = vi.spyOn(window, "removeEventListener")
    const { unmount } = render(<Exhibit slug="keycaps" />)
    unmount()
    expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function))
    expect(() => fireEvent.keyDown(window, { key: "k" })).not.toThrow()
    remove.mockRestore()
  })

  it("keycaps in a forced state do not listen", () => {
    const add = vi.spyOn(window, "addEventListener")
    render(<Exhibit slug="keycaps" state="pressed" />)
    expect(add).not.toHaveBeenCalledWith("keydown", expect.any(Function))
    add.mockRestore()
  })

  it.each(["floating-action", "neumorphic", "liquid-glass"])("%s toggles aria-pressed on click", (slug) => {
    render(<Exhibit slug={slug} />)
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-pressed")).toBe("false")
    fireEvent.click(button)
    expect(button.getAttribute("aria-pressed")).toBe("true")
    fireEvent.click(button)
    expect(button.getAttribute("aria-pressed")).toBe("false")
  })

  it("neumorphic keeps its label while the icon changes", () => {
    const { container } = render(<Exhibit slug="neumorphic" />)
    const button = screen.getByRole("button")
    const before = container.querySelector("svg")?.getAttribute("class")
    fireEvent.click(button)
    expect(button.textContent).toContain("Play")
    expect(container.querySelector("svg")?.getAttribute("class")).not.toBe(before)
  })

  it("glossy download replays its bounce on each click", () => {
    const { container } = render(<Exhibit slug="glossy-download" />)
    expect(container.querySelector(".lx-bounce")).toBeNull()
    fireEvent.click(screen.getByRole("button"))
    expect(container.querySelector(".lx-bounce")).not.toBeNull()
  })

  it.each(["gel-switch", "segmented", "keycaps", "floating-action", "neumorphic", "liquid-glass", "glossy-download"])(
    "%s renders no button or switch in a forced state",
    (slug) => {
      const { container } = render(<Exhibit slug={slug} state="pressed" />)
      expect(container.querySelector('button, [role="switch"]')).toBeNull()
    },
  )
})

describe("click-free effects on tiles", () => {
  const css = readFileSync(path.resolve(process.cwd(), "app/library/exhibits.css"), "utf8")

  it("mirror aqua carries the hooks the pulse selector targets", () => {
    const { container } = render(<Exhibit slug="aqua" state="mirror" />)
    expect(container.querySelector('.lx[data-state="mirror"] .lx-aqua')).not.toBeNull()
    expect(css).toMatch(/\.lx:is\(\[data-state="live"\], \[data-state="mirror"\]\) \.lx-aqua[^{]*\{\s*animation: lx-aqua-pulse/)
  })

  it("forced aqua states stay static", () => {
    for (const state of ["rest", "hover", "pressed"] as const) {
      const { container } = render(<Exhibit slug="aqua" state={state} />)
      expect(container.querySelector(".lx")?.getAttribute("data-state")).toBe(state)
      cleanup()
    }
    expect(css).not.toMatch(/data-state="(rest|hover|pressed)"\][^{]*\.lx-aqua[^{]*\{[^}]*lx-aqua-pulse/)
  })

  it("mirror traffic lights carry the glyph hooks under a host", () => {
    const { container } = render(
      <div data-exhibit-host>
        <Exhibit slug="traffic-lights" state="mirror" />
      </div>,
    )
    expect(container.querySelectorAll('[data-exhibit-host] .lx[data-state="mirror"] .lx-lights .lx-light')).toHaveLength(3)
    expect(css).toMatch(/\[data-exhibit-host\]:is\(:hover, :focus-visible\) \.lx\[data-state="mirror"\] \.lx-lights \.lx-light::after/)
  })

  it("floating action label follows its state", () => {
    render(<Exhibit slug="floating-action" />)
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-label")).toBe("Add")
    fireEvent.click(button)
    expect(button.getAttribute("aria-label")).toBe("Close")
    fireEvent.click(button)
    expect(button.getAttribute("aria-label")).toBe("Add")
  })
})
