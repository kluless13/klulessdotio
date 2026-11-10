import { afterEach, describe, expect, it } from "vitest"
import { paintMark } from "@/components/kit/Highlight"
import { paintUnderline, placeNotes } from "@/components/kit/MarginNotes"

type Box = { left: number; top: number; width: number; height: number }

const rect = ({ left, top, width, height }: Box) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect

/** jsdom has no layout, so give an element fixed line boxes. */
function fakeLines(el: Element, lines: Box[], box: Box = lines[0] ?? { left: 0, top: 0, width: 0, height: 0 }) {
  el.getClientRects = () => lines.map(rect) as unknown as DOMRectList
  el.getBoundingClientRect = () => rect(box)
}

afterEach(() => {
  document.body.innerHTML = ""
})

describe("paintMark", () => {
  it("draws one stroke per line behind the words and marks the highlight inked", () => {
    document.body.innerHTML = '<p><mark class="hl" data-seed="abc">two line words</mark></p>'
    const mark = document.querySelector<HTMLElement>("mark.hl")!
    fakeLines(mark, [
      { left: 100, top: 10, width: 200, height: 24 },
      { left: 0, top: 42, width: 80, height: 24 },
    ])
    paintMark(mark)
    const layer = mark.querySelector(".hl-ink")!
    expect(layer.getAttribute("aria-hidden")).toBe("true")
    expect(layer.querySelectorAll("svg.hl-line")).toHaveLength(2)
    expect(layer.querySelectorAll("path.hl-body")).toHaveLength(2)
    expect(mark.hasAttribute("data-inked")).toBe(true)
    expect(mark.textContent).toBe("two line words")
  })

  it("keeps the fallback when nothing can be measured, and reuses its layer", () => {
    document.body.innerHTML = '<mark class="hl" data-seed="abc">words</mark>'
    const mark = document.querySelector<HTMLElement>("mark.hl")!
    paintMark(mark)
    paintMark(mark)
    expect(mark.querySelectorAll(".hl-ink")).toHaveLength(1)
    expect(mark.querySelector("svg")).toBeNull()
    expect(mark.hasAttribute("data-inked")).toBe(false)
  })
})

describe("paintUnderline", () => {
  it("draws a pen underline under each line of the noted words", () => {
    document.body.innerHTML = '<p>See <span class="note-on" data-note="1">these words</span> here.</p>'
    const words = document.querySelector<HTMLElement>(".note-on")!
    fakeLines(words, [{ left: 40, top: 0, width: 90, height: 24 }])
    paintUnderline(words)
    expect(words.querySelectorAll(".note-ink svg.note-line path")).toHaveLength(1)
    expect(words.hasAttribute("data-inked")).toBe(true)
    expect(words.textContent).toBe("these words")
  })
})

describe("placeNotes", () => {
  function setup() {
    document.body.innerHTML = `
      <div class="root">
        <div class="kit-noted" id="a"><p>One <span class="note-on" data-note="1">first</span></p><aside class="kit-note" data-note="1">Note one</aside></div>
        <div class="kit-noted" id="b"><p>Two <span class="note-on" data-note="1">second</span></p><aside class="kit-note" data-note="1">Note two</aside></div>
      </div>`
    const root = document.querySelector<HTMLElement>(".root")!
    const [a, b] = Array.from(document.querySelectorAll<HTMLElement>(".kit-noted"))
    const [n1, n2] = Array.from(document.querySelectorAll<HTMLElement>("aside"))
    for (const n of [n1, n2]) {
      n.style.position = "absolute"
      n.style.lineHeight = "26px"
      Object.defineProperty(n, "offsetHeight", { value: 120, configurable: true })
    }
    fakeLines(root, [], { left: 0, top: 0, width: 896, height: 2000 })
    fakeLines(a, [], { left: 0, top: 40, width: 632, height: 100 })
    fakeLines(b, [], { left: 0, top: 160, width: 632, height: 100 })
    fakeLines(a.querySelector(".note-on")!, [{ left: 50, top: 100, width: 40, height: 20 }])
    fakeLines(b.querySelector(".note-on")!, [{ left: 50, top: 170, width: 40, height: 20 }])
    return { root, n1, n2 }
  }

  it("sets each note's first line level with its words", () => {
    const { root, n1 } = setup()
    placeNotes(root)
    // words centre 110, minus the block top 40, minus half the note's 26px line
    expect(n1.style.top).toBe("57px")
    expect(n1.hasAttribute("data-placed")).toBe(true)
  })

  it("pushes a note down so it never overlaps the one above", () => {
    const { root, n2 } = setup()
    placeNotes(root)
    // note one ends at 40 + 57 + 120 = 217 in the root, plus a 16px gap; block two starts at 160
    expect(n2.style.top).toBe("73px")
  })

  it("leaves notes in the flow when there is no margin", () => {
    const { root, n1 } = setup()
    n1.style.position = "static"
    n1.style.top = "57px"
    placeNotes(root)
    expect(n1.style.top).toBe("")
    expect(n1.hasAttribute("data-placed")).toBe(false)
  })
})
