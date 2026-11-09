"use client"

import { Share } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const COPIED_MS = 2000

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError"

/** Opens the system share sheet where there is one, otherwise copies the post's address. */
export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      setCopied(false)
    }
  }

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        if (isAbort(error)) return
      }
    }
    await copy()
  }

  const label = copied ? "Link copied" : "Share"
  return (
    <button type="button" className="btn share-chip" data-copied={copied || undefined} aria-label={label} onClick={share}>
      <Share size={15} aria-hidden="true" />
      <span className="share-label" aria-live="polite">
        {label}
      </span>
    </button>
  )
}
