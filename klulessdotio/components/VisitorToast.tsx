"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { formatVisitor, isClosed, markClosed, readVisitor, writeVisitor } from "@/lib/visitor-store"

const OFFSET_VAR = "--toast-offset-bottom-left"
// Space between this toast and the "Link copied" toast that stacks above it.
const STACK_GAP = 12

interface Shown {
  lead: string
  number: number
}

function getStorage(kind: "localStorage" | "sessionStorage"): Storage | null {
  try {
    return window[kind]
  } catch {
    return null
  }
}

export function VisitorToast() {
  const [shown, setShown] = useState<Shown | null>(null)
  const requested = useRef(false)
  const toastRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Without local storage the number could never be remembered, so every load
    // would count as a new visitor. Do nothing at all.
    const local = getStorage("localStorage")
    if (!local || isClosed(getStorage("sessionStorage"))) return
    const stored = readVisitor(local)
    if (stored) {
      setShown({ lead: "Welcome back, visitor", number: stored })
      return
    }
    // StrictMode runs this effect twice on mount; only the first may post.
    if (requested.current) return
    requested.current = true
    fetch("/api/visitor", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const number = json?.success ? json.data?.number : null
        if (!Number.isSafeInteger(number) || number < 1) return
        writeVisitor(local, number)
        setShown({ lead: "You're visitor", number })
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!shown) return
    const root = document.documentElement
    root.style.setProperty(OFFSET_VAR, `${(toastRef.current?.offsetHeight ?? 0) + STACK_GAP}px`)
    return () => {
      root.style.removeProperty(OFFSET_VAR)
    }
  }, [shown])

  if (!shown) return null

  return (
    <div className="visitor-toast" role="status" ref={toastRef}>
      <span className="visitor-dot" aria-hidden="true" />
      <span className="visitor-words">
        <span className="visitor-lead">{shown.lead}</span>
        <span className="visitor-number">{formatVisitor(shown.number)}</span>
      </span>
      <button
        type="button"
        className="visitor-close"
        aria-label="Close"
        onClick={() => {
          markClosed(getStorage("sessionStorage"))
          setShown(null)
        }}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
