import type { Metadata } from "next"
import { SITE_URL } from "@/lib/writing/feeds"
import { breadcrumbJsonLd, pageMetadata } from "@/lib/writing/seo"
import type { LibraryItem } from "./types"

const SHARE_IMAGE = { url: "/library/og.jpg", width: 1200, height: 630, alt: "Library" }
const LIBRARY_DESCRIPTION = "Fonts and buttons I keep coming back to."
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

export function itemMetadata(item: LibraryItem): Metadata {
  return withShareImage(
    pageMetadata(`/library/${item.slug}`, `${item.name} · Library · Angad Maniyambath`, `${item.note} ${sourceLine(item)}`),
  )
}

export function libraryBreadcrumbs() {
  return breadcrumbJsonLd([HOME, LIBRARY])
}

export function itemJsonLd(item: LibraryItem) {
  return breadcrumbJsonLd([HOME, LIBRARY, { name: item.name, url: `${LIBRARY.url}/${item.slug}` }])
}
