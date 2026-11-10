import type { ReactNode } from "react"
import "../writing/writing.css"
import "./kit.css"

/** The kit's own styles. The top bar and footer share the writing pages' chrome. */
export default function KitLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
