"use client"

import type { ReactNode } from "react"
import { hashSeed } from "@/lib/kit/inline"
import { underlinePath } from "@/lib/kit/ink"
import type { Note } from "@/lib/kit/types"
import { inkLayer, measure, PAD, svgElement } from "./Highlight"

/** The pen lifts past the end of the words by up to this much. */
const LIFT = 12
/** Space kept between two notes stacked in the margin. */
const NOTE_GAP = 16

/**
 * A block with handwritten notes: the block, then each note as an aside in reading order.
 * With room for a margin the notes move beside the block (see placeNotes); otherwise they sit under it.
 */
export function MarginNotes({ notes, children }: { notes: readonly Note[]; children: ReactNode }) {
  if (notes.length === 0) return <>{children}</>
  return (
    <div className="kit-noted">
      {children}
      {notes.map((note, i) => (
        <aside key={i} className="kit-note" aria-label="Note" data-note={i + 1}>
          {note.text}
        </aside>
      ))}
    </div>
  )
}

/** A quick pen underline under each line of the noted words, drawn into the server-rendered `.note-on`. */
export function paintUnderline(words: HTMLElement): void {
  const layer = inkLayer(words, "note-ink")
  const size = parseFloat(getComputedStyle(words).fontSize) || 16
  const seed = hashSeed(words.textContent ?? "")
  const lines = measure(words, layer).map((box, i) => {
    // measure() centres a box on the line; the baseline sits 0.3em below that centre
    const baseline = box.top + box.height / 2 + size * 0.3
    const width = box.width + PAD * 2 + LIFT
    const height = PAD * 2 + 8
    return svgElement("note-line", { left: box.left - PAD, top: baseline - PAD, width, height }, `${-PAD} ${-PAD} ${width} ${height}`, [
      ["note-stroke", underlinePath(`${seed}|${i}`, box.width)],
    ])
  })
  layer.replaceChildren(...lines)
  words.toggleAttribute("data-inked", lines.length > 0)
}

function clearPlacement(aside: HTMLElement): void {
  aside.style.removeProperty("top")
  aside.removeAttribute("data-placed")
}

/**
 * Set each margin note's first line level with its words, pushing a note down when it would run into the one above.
 * Notes only move while the stylesheet puts them in the margin (absolutely placed); under it they stay in the flow.
 */
export function placeNotes(root: HTMLElement): void {
  const rootTop = root.getBoundingClientRect().top
  let floor = Number.NEGATIVE_INFINITY
  for (const aside of Array.from(root.querySelectorAll<HTMLElement>("aside.kit-note"))) {
    const group = aside.closest<HTMLElement>(".kit-noted")
    const words = group?.querySelector<HTMLElement>(`.note-on[data-note="${aside.dataset.note}"]`)
    const first = words?.getClientRects()[0]
    if (!group || !first || getComputedStyle(aside).position !== "absolute") {
      clearPlacement(aside)
      continue
    }
    const groupTop = group.getBoundingClientRect().top - rootTop
    const lead = parseFloat(getComputedStyle(aside).lineHeight) || 26
    const level = first.top - rootTop + first.height / 2 - lead / 2 - groupTop
    const top = Math.max(level, floor - groupTop)
    aside.style.top = `${Math.round(top)}px`
    aside.setAttribute("data-placed", "")
    floor = groupTop + top + aside.offsetHeight + NOTE_GAP
  }
}
