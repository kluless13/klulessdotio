"use client"

import { ArrowRight, LoaderCircle } from "lucide-react"
import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { KitGateSent } from "@/components/kit/KitGateSent"

type Status = "idle" | "sending" | "done" | "invalid-email" | "rate-limited" | "server"
type Problem = "invalid-email" | "rate-limited" | "server"

const MESSAGES: Record<Problem, string> = {
  "invalid-email": "That email doesn't look right.",
  "rate-limited": "Too many tries. Give it an hour.",
  server: "Something went wrong on my end. Try again in a minute.",
}

async function requestKit(email: string, trap: string): Promise<Status> {
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "kit", kit: "starter-kit", email, consent: true, company_url: trap }),
    })
    if (res.ok) return "done"
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    if (data.error === "invalid_email") return "invalid-email"
    if (data.error === "rate_limited") return "rate-limited"
    return "server"
  } catch {
    return "server"
  }
}

/** The starter kit signup. Pressing the button is consent, as on the post download gate. */
export function KitGate() {
  const [email, setEmail] = useState("")
  const [trap, setTrap] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [retried, setRetried] = useState(false)
  const titleId = useId()
  const sentId = useId()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  // After "Try again" the form comes back with the address kept, ready to correct
  useEffect(() => {
    if (retried && status === "idle") inputRef.current?.focus()
  }, [retried, status])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    setStatus(await requestKit(email.trim(), trap))
  }

  function retry() {
    setRetried(true)
    setStatus("idle")
  }

  const sending = status === "sending"
  const message = status in MESSAGES ? MESSAGES[status as Problem] : ""

  if (status === "done") {
    return (
      <section className="kit-gate" data-state="done" aria-labelledby={sentId}>
        <KitGateSent email={email.trim()} titleId={sentId} onRetry={retry} />
      </section>
    )
  }

  return (
    <section className="kit-gate" data-state={status} aria-labelledby={titleId}>
      <div className="kit-gate-text">
        <h2 className="kit-gate-title" id={titleId}>
          Unlock it for free
        </h2>
        <p>
          Pop in your email and I&apos;ll send you the link. You&apos;ll also get my occasional posts on working with agents. One
          click to unsubscribe, any time.
        </p>
      </div>
      <form className="kit-gate-form" onSubmit={onSubmit}>
        <label className="kit-gate-label" htmlFor={inputId}>
          Email
        </label>
        <input
          ref={inputRef}
          className="kit-gate-input"
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Your email"
          required
          readOnly={sending}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="kit-gate-trap" aria-hidden="true">
          <input
            type="text"
            name="company_url"
            tabIndex={-1}
            autoComplete="new-password"
            data-1p-ignore
            data-lpignore="true"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>
        <button className="btn kit-gate-button" type="submit" aria-disabled={sending}>
          {sending ? (
            <>
              <LoaderCircle className="kit-gate-spinner" size={15} aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              Send me the kit
              <ArrowRight size={15} aria-hidden="true" />
            </>
          )}
        </button>
        <p className="kit-gate-note">The link arrives by email, usually within a minute.</p>
      </form>
      <p className="kit-gate-status" data-state={status} aria-live="polite">
        {message}
      </p>
    </section>
  )
}
