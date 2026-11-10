"use client"

import { Check, Mail } from "lucide-react"
import { useEffect, useRef } from "react"

interface KitGateSentProps {
  email: string
  titleId: string
  onRetry: () => void
}

/**
 * The sent moment: an envelope lifts off and a tick settles in its place, then the
 * lines rise in one after another. Reduced motion shows the end state at once (kit.css).
 */
export function KitGateSent({ email, titleId, onRetry }: KitGateSentProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // The form is gone, so focus moves to the heading instead of falling back to the page.
  // Focus alone announces it: a live region inserted already filled is unreliable.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="kit-sent">
      <div className="kit-sent-badge" aria-hidden="true">
        <Mail className="kit-sent-envelope" size={20} strokeWidth={1.75} />
        <Check className="kit-sent-check" size={20} strokeWidth={2.25} />
      </div>
      <div className="kit-sent-text">
        <h2 className="kit-sent-title" id={titleId} ref={headingRef} tabIndex={-1}>
          It&apos;s on its way.
        </h2>
        <p className="kit-sent-line">Sent to {email}. Your link works for good.</p>
        <p className="kit-sent-hint">Not in your inbox? Check Promotions and drag it to Primary.</p>
        <p className="kit-sent-retry">
          Wrong address?{" "}
          <button type="button" className="kit-sent-retry-button" onClick={onRetry}>
            Try again
          </button>
        </p>
      </div>
    </div>
  )
}
