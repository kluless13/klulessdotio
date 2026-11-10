"use client"

import { AnimatePresence, LayoutGroup, MotionConfig } from "framer-motion"
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import { Controls } from "@/components/library/Controls"
import { ListRow } from "@/components/library/ListRow"
import { GROW, Sheet, tileFor } from "@/components/library/Sheet"
import { Tile } from "@/components/library/Tile"
import { itemsFor, sectionsFor } from "@/lib/library/catalogue"
import { VisitorToast } from "@/components/VisitorToast"
import { fontFamily } from "@/lib/library/fonts"
import { LIBRARY_PATH, itemPath, slugFromPath } from "@/lib/library/history"
import type { Filter } from "@/lib/library/types"
import { readView, writeView, type LibraryViewMode } from "@/lib/library/view-pref"

// Some exhibits set their label in Geist or Inter through these properties.
const EXHIBIT_FONTS = {
  "--font-geist-sans": fontFamily("geist"),
  "--font-inter": fontFamily("inter"),
} as CSSProperties

// Tiles only animate their layout while a sheet shrinks back into one. Otherwise they snap: a filter change
// doesn't slide them about, and a tile that takes back its layoutId (the sheet stepped away) returns unseen.
const INSTANT = { duration: 0 }

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

/** Brings the closing item's tile on screen first, so the sheet has somewhere visible to shrink into. */
function revealTile(slug: string) {
  const tile = tileFor(slug)
  if (!tile) return
  const box = tile.getBoundingClientRect()
  if (box.top < 0 || box.bottom > window.innerHeight) tile.scrollIntoView({ block: "center" })
}

export function LibraryView({ initialSlug }: { initialSlug?: string }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [view, setView] = useState<LibraryViewMode>("grid")
  const [openSlug, setOpenSlug] = useState<string | undefined>(initialSlug)
  const [shrinking, setShrinking] = useState(false)
  // The open sheet's history entry: pushed by this page (close goes back) or the page's own (close replaces it).
  const pushed = useRef(false)
  const openRef = useRef(openSlug)
  openRef.current = openSlug

  useEffect(() => setView(readView(browserStorage())), [])

  // Back and forward open and close the sheet. Next's router restores the same page alongside.
  useEffect(() => {
    const onPopState = () => {
      const slug = slugFromPath(window.location.pathname)
      const state: unknown = window.history.state
      pushed.current = slug !== null && (state as { library?: string } | null)?.library === slug
      if (!slug && openRef.current) {
        revealTile(openRef.current)
        setShrinking(true)
      }
      setOpenSlug(slug ?? undefined)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  // Focus goes back to the item's tile when the sheet closes.
  const lastOpen = useRef(openSlug)
  useEffect(() => {
    if (lastOpen.current && !openSlug) tileFor(lastOpen.current)?.focus({ preventScroll: true })
    lastOpen.current = openSlug
  }, [openSlug])

  const chooseView = (next: LibraryViewMode) => {
    setView(next)
    writeView(browserStorage(), next)
  }

  const openItem = useCallback((slug: string) => {
    // Reopening before the last close finished: that shrink is abandoned, so tiles go back to snapping.
    setShrinking(false)
    setOpenSlug(slug)
    window.history.pushState({ library: slug }, "", itemPath(slug))
    pushed.current = true
  }, [])

  const sections = sectionsFor(filter)
  const filtered = itemsFor(filter)
  // An item opened from the address bar or history may sit outside the current filter.
  const sheetItems = filtered.some((item) => item.slug === openSlug) ? filtered : itemsFor("all")
  const openIndex = openSlug ? sheetItems.findIndex((item) => item.slug === openSlug) : -1

  const stepTo = (index: number) => {
    const slug = sheetItems[index].slug
    setOpenSlug(slug)
    window.history.replaceState({ library: slug }, "", itemPath(slug))
  }

  const closeSheet = () => {
    if (!openSlug) return
    revealTile(openSlug)
    setShrinking(true)
    setOpenSlug(undefined)
    if (pushed.current) {
      pushed.current = false
      window.history.back()
    } else {
      window.history.replaceState(null, "", LIBRARY_PATH)
    }
  }

  const Item = view === "grid" ? Tile : ListRow

  return (
    <main className="lib" style={EXHIBIT_FONTS} data-view={view} data-open-slug={openSlug}>
      {/* Grid and list keep separate layoutIds, so switching views doesn't morph tiles into rows. */}
      <LayoutGroup id={view}>
        <MotionConfig transition={shrinking ? GROW : INSTANT}>
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
                    <Item key={item.slug} item={item} onOpen={openItem} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </MotionConfig>
        <AnimatePresence initial={false} onExitComplete={() => setShrinking(false)}>
          {openIndex >= 0 ? <Sheet key="sheet" items={sheetItems} index={openIndex} onStep={stepTo} onClose={closeSheet} /> : null}
        </AnimatePresence>
      </LayoutGroup>
      <VisitorToast />
    </main>
  )
}
