"use client"

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from "react"
import { hashSeed } from "@/lib/kit/inline"
import { highlightStroke } from "@/lib/kit/ink"

/** Room around each stroke so the ragged ends and wobble never clip. */
export const PAD = 8
const SVG = "http://www.w3.org/2000/svg"

export interface LineBox {
  left: number
  top: number
  width: number
  height: number
}

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child)
      return isValidElement<{ children?: ReactNode }>(child) ? textOf(child.props.children) : ""
    })
    .join("")
}

/**
 * One stroke box per line the mark wraps onto, relative to the ink layer's own origin, so it holds
 * however the browser places an absolute box inside a wrapped inline.
 */
export function measure(mark: HTMLElement, layer: HTMLElement): LineBox[] {
  const origin = layer.getBoundingClientRect()
  const size = parseFloat(getComputedStyle(mark).fontSize) || 16
  const height = size * 1.12
  const rects = Array.from(mark.getClientRects()).filter((r) => r.width > 0.5)
  return rects.map((r) => ({
    left: r.left - origin.left,
    top: r.top - origin.top + r.height / 2 + size * 0.06 - height / 2,
    width: r.width,
    height,
  }))
}

const sameBoxes = (a: readonly LineBox[], b: readonly LineBox[]) =>
  a.length === b.length && a.every((box, i) => Object.keys(box).every((k) => Math.abs(box[k as keyof LineBox] - b[i][k as keyof LineBox]) < 0.5))

function useLineBoxes() {
  const markRef = useRef<HTMLElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)
  const [boxes, setBoxes] = useState<LineBox[]>([])

  useEffect(() => {
    const mark = markRef.current
    const layer = layerRef.current
    if (!mark || !layer) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const next = measure(mark, layer)
        setBoxes((prev) => (sameBoxes(prev, next) ? prev : next))
      })
    }
    update()
    document.fonts?.ready.then(update).catch(() => undefined)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update)
    if (observer && mark.parentElement) observer.observe(mark.parentElement)
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  return { markRef, layerRef, boxes }
}

/** Where one line's stroke sits and what it looks like, shared by the React mark and the HTML-string painter. */
function strokeShape(seed: string, box: LineBox, line: number) {
  const { body, streak, jitter } = highlightStroke(seed, box.width, box.height, line)
  const width = box.width + PAD * 2
  const height = box.height + PAD * 2
  return { left: box.left - PAD, top: box.top - PAD, width, height, viewBox: `${-PAD} ${-PAD} ${width} ${height}`, body, streak, jitter: jitter.toFixed(3) }
}

function Stroke({ seed, box, line }: { seed: string; box: LineBox; line: number }) {
  const shape = strokeShape(seed, box, line)
  return (
    <svg
      className="hl-line"
      style={{ left: shape.left, top: shape.top, width: shape.width, height: shape.height, ["--hl-jitter" as string]: shape.jitter }}
      viewBox={shape.viewBox}
      focusable="false"
    >
      <path className="hl-body" d={shape.body} />
      <path className="hl-streak" d={shape.streak} />
    </svg>
  )
}

/** The element's own aria-hidden ink layer (its first child), made on first use. */
export function inkLayer(host: HTMLElement, className: string): HTMLElement {
  const first = host.firstElementChild
  if (first instanceof HTMLElement && first.classList.contains(className)) return first
  const layer = document.createElement("span")
  layer.className = className
  layer.setAttribute("aria-hidden", "true")
  host.prepend(layer)
  return layer
}

/** An absolutely placed SVG with the given paths, for drawing into server-rendered HTML. */
export function svgElement(className: string, box: { left: number; top: number; width: number; height: number }, viewBox: string, paths: readonly [string, string][]): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg")
  svg.setAttribute("class", className)
  svg.setAttribute("viewBox", viewBox)
  svg.setAttribute("focusable", "false")
  Object.assign(svg.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` })
  for (const [pathClass, d] of paths) {
    const path = document.createElementNS(SVG, "path")
    path.setAttribute("class", pathClass)
    path.setAttribute("d", d)
    svg.append(path)
  }
  return svg
}

/**
 * Draw (or redraw) the strokes behind a server-rendered `mark.hl`, with the same geometry as `<Highlight>`.
 * Until a line can be measured the mark keeps its plain translucent background.
 */
export function paintMark(mark: HTMLElement): void {
  const layer = inkLayer(mark, "hl-ink")
  const seed = mark.dataset.seed || hashSeed(mark.textContent ?? "")
  const boxes = measure(mark, layer)
  const strokes = boxes.map((box, line) => {
    const shape = strokeShape(seed, box, line)
    const svg = svgElement("hl-line", shape, shape.viewBox, [
      ["hl-body", shape.body],
      ["hl-streak", shape.streak],
    ])
    svg.style.setProperty("--hl-jitter", shape.jitter)
    return svg
  })
  layer.replaceChildren(...strokes)
  mark.toggleAttribute("data-inked", strokes.length > 0)
}

/**
 * A highlighter pass behind the words: one seeded stroke per line, drawn once the lines can be measured.
 * Before that (and without JS) the mark keeps a plain translucent background. The text never moves.
 */
export function Highlight({ children, seed }: { children: ReactNode; seed?: string }) {
  const key = seed ?? hashSeed(textOf(children))
  const { markRef, layerRef, boxes } = useLineBoxes()
  return (
    <mark ref={markRef} className="hl" data-seed={key} data-inked={boxes.length > 0 ? "" : undefined}>
      <span ref={layerRef} className="hl-ink" aria-hidden="true">
        {boxes.map((box, line) => (
          <Stroke key={line} seed={key} box={box} line={line} />
        ))}
      </span>
      {children}
    </mark>
  )
}
