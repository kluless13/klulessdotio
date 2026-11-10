import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Highlight } from "@/components/kit/Highlight"

afterEach(cleanup)

describe("Highlight", () => {
  it("renders the words in a mark.hl, seeded from the text", () => {
    const { container } = render(
      <p>
        Before <Highlight>plain words</Highlight> after
      </p>
    )
    const mark = container.querySelector("mark.hl")
    expect(mark).not.toBeNull()
    expect(container.querySelector("p")?.textContent).toBe("Before plain words after")
    expect(mark?.getAttribute("data-seed")).toBeTruthy()
  })

  it("keeps the fallback background until a line is measured", () => {
    // jsdom has no layout, so no line boxes: the mark keeps its plain background
    const { container } = render(<Highlight>plain words</Highlight>)
    expect(container.querySelector("mark.hl")?.hasAttribute("data-inked")).toBe(false)
    expect(container.querySelector("svg")).toBeNull()
  })
})
