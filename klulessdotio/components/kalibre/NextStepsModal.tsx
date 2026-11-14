"use client"

import { useEffect, useRef, type KeyboardEvent } from "react"
import { CloseIcon } from "./icons"
import { trapFocus, useScrollLock } from "./hooks"

type NextStepsModalProps = {
  readonly firstName: string
  readonly email: string
  readonly onClose: () => void
}

const STEPS = (email: string) => [
  { title: "Confirm your email", text: `We've sent a link to ${email}. It takes one click.` },
  { title: "Get the full terms", text: "Every rule and fee, sent to you before evaluations open." },
  { title: "Early-bird fee and first access", text: "Held for you until evaluations open, end of September 2026." },
  { title: "Your Discord invite", text: "Arrives by email when the community opens." },
]

/** The what's-next window that opens after a successful sign-up. The caller decides where focus goes once it closes. */
export function NextStepsModal({ firstName, email, onClose }: NextStepsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  useScrollLock()

  useEffect(() => {
    primaryRef.current?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
      return
    }
    trapFocus(event, dialogRef.current)
  }

  return (
    <div className="kt-modal-backdrop" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="kt-modal" role="dialog" aria-modal="true" aria-labelledby="kt-modal-title" ref={dialogRef} onKeyDown={onKeyDown}>
        <div className="kt-modal-head">
          <div>
            <h2 id="kt-modal-title">You&rsquo;re on the list, {firstName}.</h2>
            <p>Here&rsquo;s what happens next.</p>
          </div>
          <button type="button" className="kt-icon-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon size={14} />
          </button>
        </div>
        <ol className="kt-modal-steps">
          {STEPS(email).map((step, index) => (
            <li key={step.title}>
              <span className="kt-modal-num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <p className="kt-modal-step-title">{step.title}</p>
                <p className="kt-modal-step-text">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="kt-btn kt-btn--gold kt-modal-ok" ref={primaryRef} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
