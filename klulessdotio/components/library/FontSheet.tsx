"use client"

import { ArrowUpRight } from "lucide-react"
import { PANGRAM } from "@/components/library/ListRow"
import { specimenWeight } from "@/components/library/Tile"
import { fontFamily } from "@/lib/library/fonts"
import type { FontItem } from "@/lib/library/types"

const ALPHABET = "ABCDEFGHIJKLM nopqrstuvwxyz 0123456789 &?!"

/** A font laid out in full: the specimen on the left, the name, note and weights on the right. */
export function FontSheet({ item, titleId }: { item: FontItem; titleId: string }) {
  const family = fontFamily(item.slug)
  return (
    <>
      <div className="lib-sheet-specimen lib-sheet-specimen-font" style={{ fontFamily: family }}>
        <span className="lib-sheet-aa" style={{ fontWeight: specimenWeight(item) }} aria-hidden="true">
          Aa
        </span>
        <p className="lib-sheet-pangram">{PANGRAM}</p>
        <p className="lib-sheet-alphabet">{ALPHABET}</p>
      </div>
      <div className="lib-sheet-about">
        <h2 className="lib-sheet-name" id={titleId} style={{ fontFamily: family }}>
          {item.name}
        </h2>
        <p className="lib-sheet-soft">{`${item.category}, by ${item.by}`}</p>
        <p className="lib-sheet-note">{item.note}</p>
        <ul className="lib-sheet-weights" aria-label="Weights">
          {item.weights.map((weight) => (
            <li key={weight.value} className="lib-sheet-weight">
              <span className="lib-sheet-weight-face" style={{ fontFamily: family, fontWeight: weight.value }}>
                {item.name}
              </span>
              <span className="lib-sheet-weight-name">{`${weight.name} ${weight.value}`}</span>
            </li>
          ))}
        </ul>
        {item.systemNote ? <p className="lib-sheet-soft lib-sheet-system">{item.systemNote}</p> : null}
        <div className="lib-sheet-actions">
          <a className="btn" href={item.link} target="_blank" rel="noopener">
            Get {item.name}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  )
}
