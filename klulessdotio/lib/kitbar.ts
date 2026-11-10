/** The starter kit bar: where it shows, and how a visitor's "no thanks" is remembered. */

export const KITBAR_KEY = "1tx-kitbar-dismissed"
export const KITBAR_OFF_CLASS = "kitbar-off"

/** The kit's own pages already make the offer. */
export function isKitPath(pathname: string | null): boolean {
  return pathname === "/kit" || (pathname?.startsWith("/kit/") ?? false)
}

/** Remembers the close for later visits. With storage blocked it only hides for this view. */
export function rememberKitBarClosed(): void {
  try {
    window.localStorage.setItem(KITBAR_KEY, "1")
  } catch {
    // Storage is blocked: the root class still hides the bar until the next full load
  }
  document.documentElement.classList.add(KITBAR_OFF_CLASS)
}

/** Runs in the head before the first paint, so someone who closed the bar never sees it flash. */
export const KITBAR_SCRIPT = `try{if(localStorage.getItem("${KITBAR_KEY}")==="1")document.documentElement.classList.add("${KITBAR_OFF_CLASS}")}catch(e){}`
