"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { paintMark } from "./Highlight"
import { paintUnderline, placeNotes } from "./MarginNotes"

/**
 * The kit's text arrives as server-rendered HTML. Once it can be measured, this draws the highlighter strokes
 * and note underlines into it and moves the notes level with their words, and does it again whenever the
 * fonts land or the width changes. Before then (and without JS) the plain fallbacks in the CSS show.
 */
export function KitInk({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    let frame = 0
    const paint = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        root.querySelectorAll<HTMLElement>("mark.hl").forEach(paintMark)
        root.querySelectorAll<HTMLElement>(".note-on").forEach(paintUnderline)
        placeNotes(root)
      })
    }
    paint()
    document.fonts?.ready.then(paint).catch(() => undefined)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(paint)
    observer?.observe(root)
    window.addEventListener("resize", paint)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener("resize", paint)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
