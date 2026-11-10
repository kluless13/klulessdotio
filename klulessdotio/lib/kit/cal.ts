/** Is this a Cal.com booking link (https://cal.com/<user>/<event>)? Those open as a popup on the kit page. */
export function isCalLink(href: string): boolean {
  return /^https:\/\/cal\.com\/[^/?#\s]+\/[^/?#\s]+/.test(href)
}

/** "https://cal.com/angad888/show-me" → "angad888/show-me", the form Cal's embed takes. */
export function calLinkOf(href: string): string {
  return new URL(href).pathname.replace(/^\/+|\/+$/g, "")
}
