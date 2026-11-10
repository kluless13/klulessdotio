import { BUTTONS, FONTS } from "@/content/library"
import { slugify } from "./slug"
import type { Era, Filter, LibraryItem, Section } from "./types"

export { slugify }

export const ERAS: readonly Era[] = [
  "Weighted",
  "Retro desktops",
  "Web 2.0 and early iPhone",
  "Flat and Material",
  "Modern",
  "Soft and glass",
  "Mine",
]

const TYPE_TITLE = "Type"

export function allItems(): readonly LibraryItem[] {
  const buttons = ERAS.flatMap((era) => BUTTONS.filter((b) => b.era === era))
  return [...FONTS, ...buttons]
}

export function itemBySlug(slug: string): LibraryItem | undefined {
  return allItems().find((item) => item.slug === slug)
}

function typeSections(): readonly Section[] {
  return [{ title: TYPE_TITLE, items: FONTS }]
}

function buttonSections(): readonly Section[] {
  return ERAS.map((era) => ({ title: era, items: BUTTONS.filter((b) => b.era === era) })).filter(
    (s) => s.items.length > 0,
  )
}

export function sectionsFor(filter: Filter): readonly Section[] {
  if (filter === "type") return typeSections()
  if (filter === "buttons") return buttonSections()
  return [...typeSections(), ...buttonSections()]
}

export function itemsFor(filter: Filter): readonly LibraryItem[] {
  return sectionsFor(filter).flatMap((s) => s.items)
}

export function kindLabel(item: LibraryItem): string {
  return item.kind === "font" ? item.category : "Button"
}
