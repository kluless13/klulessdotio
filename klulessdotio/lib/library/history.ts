import { itemBySlug } from "./catalogue"

export const LIBRARY_PATH = "/library"

// The address shared links point at, whatever host the page is served from.
const SHARE_ORIGIN = "https://1tx.dev"

export function itemPath(slug: string): string {
  return `${LIBRARY_PATH}/${slug}`
}

export function itemUrl(slug: string): string {
  return `${SHARE_ORIGIN}${itemPath(slug)}`
}

/** The open item named by a /library/<slug> path, or null for /library itself and anything unknown. */
export function slugFromPath(pathname: string): string | null {
  const match = /^\/library\/([^/]+)\/?$/.exec(pathname)
  if (!match) return null
  return itemBySlug(match[1]) ? match[1] : null
}
