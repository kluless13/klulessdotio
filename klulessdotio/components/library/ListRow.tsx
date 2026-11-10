"use client"

import { useId } from "react"
import { FittedExhibit, INERT, specimenWeight } from "@/components/library/Tile"
import { fontFamily } from "@/lib/library/fonts"
import type { ButtonItem, FontItem, LibraryItem } from "@/lib/library/types"

const PANGRAM = "Sphinx of black quartz, judge my vow."

// Buttons sit a little larger on the list's wider stage (1.1 on the boards).
const ROW_FIT = 1.1

function FontRow({ item, aboutId }: { item: FontItem; aboutId: string }) {
  const face = { fontFamily: fontFamily(item.slug), fontWeight: specimenWeight(item) }
  return (
    <>
      <span className="lib-row-specimen">
        <span className="lib-row-face" style={face}>
          {item.name}
        </span>
        <span className="lib-row-pangram" style={{ fontFamily: face.fontFamily }}>
          {PANGRAM}
        </span>
      </span>
      <span className="lib-row-about lib-row-meta" id={aboutId}>
        <span className="lib-row-soft">{item.category}</span>
        <span className="lib-row-soft">{item.by}</span>
        <span>{item.note}</span>
      </span>
    </>
  )
}

function ButtonRow({ item, aboutId }: { item: ButtonItem; aboutId: string }) {
  return (
    <>
      <span className="lib-row-stage" aria-hidden="true" {...INERT}>
        <FittedExhibit slug={item.slug} fit={ROW_FIT} />
      </span>
      <span className="lib-row-about" id={aboutId}>
        <span className="lib-row-name">{item.name}</span>
        <span className="lib-row-soft">{item.source}</span>
        <span className="lib-row-note">{item.note}</span>
      </span>
    </>
  )
}

/** One catalogue row. The whole row is the button; a button exhibit inside mirrors it. */
export function ListRow({ item, onOpen }: { item: LibraryItem; onOpen: (slug: string) => void }) {
  const aboutId = useId()
  return (
    <button
      type="button"
      className={`lib-row lib-row-${item.kind}`}
      data-exhibit-host
      aria-label={item.name}
      aria-describedby={aboutId}
      onClick={() => onOpen(item.slug)}
    >
      {item.kind === "font" ? <FontRow item={item} aboutId={aboutId} /> : <ButtonRow item={item} aboutId={aboutId} />}
    </button>
  )
}
