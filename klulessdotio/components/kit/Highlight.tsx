"use client"

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from "react"
import { hashSeed } from "@/lib/kit/inline"
import { highlightStroke } from "@/lib/kit/ink"

/** Room around each stroke so the ragged ends and wobble never clip. */
const PAD = 8

interface LineBox {
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
function measure(mark: HTMLElement, layer: HTMLElement): LineBox[] {
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

function Stroke({ seed, box, line }: { seed: string; box: LineBox; line: number }) {
  const { body, streak, jitter } = highlightStroke(seed, box.width, box.height, line)
  const width = box.width + PAD * 2
  const height = box.height + PAD * 2
  return (
    <svg
      className="hl-line"
      style={{ left: box.left - PAD, top: box.top - PAD, width, height, ["--hl-jitter" as string]: jitter.toFixed(3) }}
      viewBox={`${-PAD} ${-PAD} ${width} ${height}`}
      focusable="false"
    >
      <path className="hl-body" d={body} />
      <path className="hl-streak" d={streak} />
    </svg>
  )
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
