import type { Metadata } from "next"
import { SITE_URL } from "@/lib/writing/feeds"
import { breadcrumbJsonLd, pageMetadata } from "@/lib/writing/seo"
import type { LibraryItem } from "./types"

const SHARE_IMAGE = { url: "/library/og.jpg", width: 1200, height: 630, alt: "Library" }
const LIBRARY_DESCRIPTION =
  "Fonts and buttons I keep coming back to, from Mac OS 8 and Aqua to liquid glass. Rebuilt in CSS, each one live to try, with code to copy."
// Each item's description ends with what the visitor can do there, so it's long enough for search results.
const FONT_ENDING = "See every weight, a full specimen and where to get it in Angad's Library."
const BUTTON_ENDING = "Try it live, see how it's made and copy the CSS in Angad's Library."
const HOME = { name: "Home", url: SITE_URL }
const LIBRARY = { name: "Library", url: `${SITE_URL}/library` }

function withShareImage(meta: Metadata): Metadata {
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [SHARE_IMAGE] },
    twitter: { ...meta.twitter, images: [SHARE_IMAGE.url] },
  }
}

export function libraryMetadata(): Metadata {
  return withShareImage(pageMetadata("/library", "Library · Angad Maniyambath", LIBRARY_DESCRIPTION))
}

function sourceLine(item: LibraryItem): string {
  return item.kind === "font" ? `${item.category}, by ${item.by}.` : `${item.source}.`
}

function itemDescription(item: LibraryItem): string {
  const ending = item.kind === "font" ? FONT_ENDING : BUTTON_ENDING
  return `${item.note} ${sourceLine(item)} ${ending}`
}

export function itemMetadata(item: LibraryItem): Metadata {
  return withShareImage(
    pageMetadata(`/library/${item.slug}`, `${item.name} · Library · Angad Maniyambath`, itemDescription(item)),
  )
}

export function libraryBreadcrumbs() {
  return breadcrumbJsonLd([HOME, LIBRARY])
}

export function itemJsonLd(item: LibraryItem) {
  return breadcrumbJsonLd([HOME, LIBRARY, { name: item.name, url: `${LIBRARY.url}/${item.slug}` }])
}
