import type { ReactNode } from "react"

/** The near-solid reading sheet that sits over the sky, so the sky never touches text contrast. */
export function Sheet({ children }: { children: ReactNode }) {
  return <article className="sheet">{children}</article>
}
