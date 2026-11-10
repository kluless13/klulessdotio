const NUMBER_KEY = "1tx-visitor"
const CLOSED_KEY = "1tx-visitor-closed"

export function readVisitor(storage: Pick<Storage, "getItem"> | null): number | null {
  try {
    const raw = storage?.getItem(NUMBER_KEY)
    if (!raw || !/^\d+$/.test(raw)) return null
    const n = Number(raw)
    return Number.isSafeInteger(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

export function writeVisitor(storage: Pick<Storage, "setItem"> | null, n: number): void {
  try {
    storage?.setItem(NUMBER_KEY, String(n))
  } catch {
    // Storage blocked or full; the number just won't be remembered.
  }
}

export function isClosed(session: Pick<Storage, "getItem"> | null): boolean {
  try {
    return session?.getItem(CLOSED_KEY) === "1"
  } catch {
    return false
  }
}

export function markClosed(session: Pick<Storage, "setItem"> | null): void {
  try {
    session?.setItem(CLOSED_KEY, "1")
  } catch {
    // Storage blocked; the toast will simply come back next page.
  }
}

// "#1,284". Kept here, not in lib/visitor.ts, so the client never imports the server-only rate limiter.
export function formatVisitor(n: number): string {
  return "#" + n.toLocaleString("en-US")
}
