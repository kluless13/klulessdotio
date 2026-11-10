"use client"

import { ArrowRight } from "lucide-react"
import { useEffect, useId, useRef, useState, type FormEvent } from "react"

type Status = "idle" | "sending" | "done" | "invalid-email" | "rate-limited" | "server"

const MESSAGES: Record<"done" | "invalid-email" | "rate-limited" | "server", string> = {
  done: "Check your inbox. Your link works for good.",
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
  const titleId = useId()
  const inputId = useId()
  const statusRef = useRef<HTMLParagraphElement>(null)

  // The form disappears once sent, so focus moves to the message instead of falling back to the page
  useEffect(() => {
    if (status === "done") statusRef.current?.focus()
  }, [status])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    setStatus(await requestKit(email.trim(), trap))
  }

  const message = status in MESSAGES ? MESSAGES[status as keyof typeof MESSAGES] : ""
  const done = status === "done"

  return (
    <section className="kit-gate" aria-labelledby={titleId}>
      <div className="kit-gate-text">
        <h2 className="kit-gate-title" id={titleId}>
          Unlock it for free
        </h2>
        <p>
          Pop in your email and I&apos;ll send you the link. You&apos;ll also get my occasional posts on working with agents. One
          click to unsubscribe, any time.
        </p>
      </div>
      {done ? null : (
        <form className="kit-gate-form" onSubmit={onSubmit}>
          <label className="kit-gate-label" htmlFor={inputId}>
            Email
          </label>
          <input
            className="kit-gate-input"
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Your email"
            required
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
          <button className="btn kit-gate-button" type="submit" disabled={status === "sending"}>
            Send me the kit
            <ArrowRight size={15} aria-hidden="true" />
          </button>
          <p className="kit-gate-note">The link arrives by email, usually within a minute.</p>
        </form>
      )}
      <p ref={statusRef} className="kit-gate-status" data-state={status} aria-live="polite" tabIndex={-1}>
        {message}
      </p>
    </section>
  )
}
