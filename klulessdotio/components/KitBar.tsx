"use client"

import { ArrowRight, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { isKitPath, rememberKitBarClosed } from "@/lib/kitbar"

/** A slim sky strip offering the starter kit, above the top bar on every page but the kit's own. */
export function KitBar() {
  const pathname = usePathname()
  const [closed, setClosed] = useState(false)
  if (closed || isKitPath(pathname)) return null

  const close = () => {
    rememberKitBarClosed()
    setClosed(true)
  }

  return (
    <aside className="kitbar" aria-label="Starter kit">
      <div className="kitbar-content">
        <p className="kitbar-line">
          <span className="kitbar-wide">A free starter kit for getting AI to do real work in your tools.</span>
          <span className="kitbar-narrow">Free starter kit: get AI doing real work in your tools.</span>
        </p>
        <a className="btn kitbar-btn" href="/kit">
          <span className="kitbar-wide">Get the free kit</span>
          <span className="kitbar-narrow">Get the kit</span>
          <ArrowRight className="kitbar-arrow" aria-hidden="true" />
        </a>
      </div>
      <button type="button" className="kitbar-close" aria-label="Close" onClick={close}>
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  )
}
