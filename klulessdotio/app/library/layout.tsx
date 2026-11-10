import type { ReactNode } from "react"
import { FontshareLink } from "@/components/library/FontshareLink"
import "../writing/writing.css"
import "./exhibits/base.css"
import "./exhibits/weighted.css"
import "./exhibits/retro.css"
import "./exhibits/web2.css"
import "./exhibits/flat.css"
import "./exhibits/modern.css"
import "./exhibits/soft.css"
import "./exhibits/mine.css"
import "./library.css"
import "./sheet.css"

/** The Library's own fonts and styles. The top bar and footer share the writing pages' chrome. */
export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <FontshareLink />
      {children}
    </>
  )
}
