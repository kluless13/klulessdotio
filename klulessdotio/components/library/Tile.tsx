"use client"

import { useId, type CSSProperties } from "react"
import { Exhibit } from "@/components/library/exhibits"
import { kindLabel } from "@/lib/library/catalogue"
import { fontFamily } from "@/lib/library/fonts"
import type { FontItem, LibraryItem } from "@/lib/library/types"

// React 18's types don't know `inert` yet, but the attribute renders as written.
export const INERT = { inert: "" } as Record<string, string>

// How big each button sits in a 244px tile, from the Paper boards (tile_scale).
// Wide exhibits (segmented, shadcn/ui) come down to stay under about 188px across, which fits
// the narrowest stage in each size step of library.css.
const TILE_FIT: Readonly<Record<string, number>> = {
  "weighted-icon": 1.3,
  keycaps: 1.3,
  segmented: 0.85,
  platinum: 1.3,
  bevel: 1.4,
  luna: 1.4,
  aero: 1.4,
  "aqua-help": 1.6,
  "traffic-lights": 1.5,
  "bootstrap-2": 1.2,
  "gel-switch": 1.3,
  "glossy-bar-button": 1.5,
  "text-button": 1.3,
  "shadcn-ui": 0.85,
  "blue-pill": 1.2,
  "liquid-glass": 1.1,
}

export function tileFit(slug: string): number {
  return Object.hasOwn(TILE_FIT, slug) ? TILE_FIT[slug] : 1
}

/** A button exhibit that mirrors its host, sized by CSS from `fit` and the size of the stage around it. */
export function FittedExhibit({ slug, fit }: { slug: string; fit: number }) {
  return (
    <span className="lib-fit" style={{ "--fit": fit } as CSSProperties}>
      <Exhibit slug={slug} state="mirror" />
    </span>
  )
}

/** Sans faces show in their Medium, serifs in their Regular, as on the boards. */
export function specimenWeight(font: FontItem): number {
  return font.category === "Serif" ? 400 : 500
}

export function Tile({ item, onOpen }: { item: LibraryItem; onOpen: (slug: string) => void }) {
  const kindId = useId()
  return (
    <button
      type="button"
      className="lib-tile"
      data-exhibit-host
      aria-label={item.name}
      aria-describedby={kindId}
      onClick={() => onOpen(item.slug)}
    >
      <span className="lib-stage" aria-hidden="true" {...INERT}>
        {item.kind === "font" ? (
          <span className="lib-glyph" style={{ fontFamily: fontFamily(item.slug), fontWeight: specimenWeight(item) }}>
            Aa
          </span>
        ) : (
          <FittedExhibit slug={item.slug} fit={tileFit(item.slug)} />
        )}
      </span>
      <span className="lib-caption">
        <span className="lib-name">{item.name}</span>
        <span className="lib-kind" id={kindId}>
          {kindLabel(item)}
        </span>
      </span>
    </button>
  )
}
