"use client"

import { useEffect, useRef } from "react"
import { FONTSHARE_STYLESHEET } from "@/lib/library/fonts"

/**
 * The Library's Fontshare stylesheet, loaded without blocking the first paint: it starts as print-only
 * (which the browser fetches at low priority) and switches to all media once it has arrived.
 * The noscript copy covers visitors without JavaScript.
 */
export function FontshareLink() {
  const link = useRef<HTMLLinkElement>(null)

  // The sheet can finish before hydration attaches onLoad, so check once on mount too.
  useEffect(() => {
    if (link.current?.sheet) link.current.media = "all"
  }, [])

  return (
    <>
      <link ref={link} rel="stylesheet" href={FONTSHARE_STYLESHEET} media="print" onLoad={(event) => (event.currentTarget.media = "all")} />
      <noscript>
        <link rel="stylesheet" href={FONTSHARE_STYLESHEET} />
      </noscript>
    </>
  )
}
