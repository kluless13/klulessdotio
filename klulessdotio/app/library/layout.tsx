import type { ReactNode } from "react"
import { FONTSHARE_STYLESHEET } from "@/lib/library/fonts"
import "../writing/writing.css"
import "./exhibits.css"
import "./library.css"
import "./sheet.css"

/** The Library's own fonts and styles. The top bar and footer share the writing pages' chrome. */
export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href={FONTSHARE_STYLESHEET} precedence="default" />
      {children}
    </>
  )
}
