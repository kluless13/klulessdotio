export type LibraryViewMode = "grid" | "list"

const KEY = "1tx-library-view"
const DEFAULT_VIEW: LibraryViewMode = "grid"

function isViewMode(value: unknown): value is LibraryViewMode {
  return value === "grid" || value === "list"
}

/** The visitor's last view. Blocked or missing storage, and anything unexpected, reads as grid. */
export function readView(storage: Pick<Storage, "getItem"> | null): LibraryViewMode {
  if (!storage) return DEFAULT_VIEW
  try {
    const stored = storage.getItem(KEY)
    return isViewMode(stored) ? stored : DEFAULT_VIEW
  } catch {
    return DEFAULT_VIEW
  }
}

/** Remembers the view. With storage blocked the choice simply lasts until the page closes. */
export function writeView(storage: Pick<Storage, "setItem"> | null, view: LibraryViewMode): void {
  if (!storage) return
  try {
    storage.setItem(KEY, view)
  } catch {
    // Storage is full or blocked: the page works without it.
  }
}
