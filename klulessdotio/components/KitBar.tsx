"use client"

import { ArrowRight, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useRef, useState } from "react"
import { isKitPath, rememberKitBarClosed } from "@/lib/kitbar"

/** Keyboard users land on the page's first link or button after the bar, usually the top bar's first link. */
function focusAfter(bar: HTMLElement | null) {
  const next = bar?.nextElementSibling?.querySelector<HTMLElement>("a[href], button")
  if (next) next.focus()
  else (document.activeElement as HTMLElement | null)?.blur()
}

/** A slim sky strip offering the starter kit, above the top bar on every page but the kit's own. */
export function KitBar() {
  const pathname = usePathname()
  const ref = useRef<HTMLElement>(null)
  const [closed, setClosed] = useState(false)
  if (closed || isKitPath(pathname)) return null

  const close = () => {
    rememberKitBarClosed()
    focusAfter(ref.current)
    setClosed(true)
  }

  return (
    <aside ref={ref} className="kitbar" aria-label="Starter kit">
      <div className="kitbar-content">
        <p className="kitbar-line">
          <span className="kitbar-wide">A free starter kit for getting AI to do real work in your tools.</span>
          <span className="kitbar-narrow">Free starter kit: get AI doing real work in your tools.</span>
        </p>
        <a className="kitbar-cta" href="/kit">
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
