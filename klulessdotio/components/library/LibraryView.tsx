"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { Controls } from "@/components/library/Controls"
import { ListRow } from "@/components/library/ListRow"
import { Tile } from "@/components/library/Tile"
import { sectionsFor } from "@/lib/library/catalogue"
import { fontFamily } from "@/lib/library/fonts"
import type { Filter } from "@/lib/library/types"
import { readView, writeView, type LibraryViewMode } from "@/lib/library/view-pref"

// Some exhibits set their label in Geist or Inter through these properties.
const EXHIBIT_FONTS = {
  "--font-geist-sans": fontFamily("geist"),
  "--font-inter": fontFamily("inter"),
} as CSSProperties

/** Reading `window.localStorage` itself throws when storage is blocked. */
function browserStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function sectionId(title: string): string {
  return `lib-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

export function LibraryView({ initialSlug }: { initialSlug?: string }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [view, setView] = useState<LibraryViewMode>("grid")
  // The sheet (next task) opens the item named here.
  const [openSlug, setOpenSlug] = useState<string | undefined>(initialSlug)

  useEffect(() => setView(readView(browserStorage())), [])

  const chooseView = (next: LibraryViewMode) => {
    setView(next)
    writeView(browserStorage(), next)
  }

  const sections = sectionsFor(filter)
  const Item = view === "grid" ? Tile : ListRow

  return (
    <main className="lib" style={EXHIBIT_FONTS} data-view={view} data-open-slug={openSlug}>
      <div className="lib-head">
        <div className="lib-title">
          <h1>Library</h1>
          <p>Things I like and keep coming back to.</p>
        </div>
        <Controls filter={filter} view={view} onFilter={setFilter} onView={chooseView} />
      </div>
      <div className="lib-sections">
        {sections.map((section) => (
          <section key={section.title} className="lib-section" aria-labelledby={sectionId(section.title)}>
            <h2 className="lib-section-title" id={sectionId(section.title)}>
              {section.title} <span className="lib-count">{section.items.length}</span>
            </h2>
            <div className={view === "grid" ? "lib-grid" : "lib-list"}>
              {section.items.map((item) => (
                <Item key={item.slug} item={item} onOpen={setOpenSlug} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
