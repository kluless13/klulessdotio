"use client"

import { useId, useState, type FormEvent } from "react"
import type { Download } from "@/lib/writing/types"

type Status = "idle" | "sending" | "done" | "invalid-email" | "rate-limited" | "server"

const MESSAGES: Record<"done" | "invalid-email" | "rate-limited" | "server", string> = {
  done: "Check your inbox. The link works for 7 days.",
  "invalid-email": "That email doesn't look right.",
  "rate-limited": "Too many tries. Give it an hour.",
  server: "Something went wrong on my end. Try again in a minute.",
}

async function subscribe(payload: Record<string, unknown>): Promise<Status> {
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

export function EmailGate({ download, slug }: { download: Download; slug: string }) {
  const [email, setEmail] = useState("")
  const [trap, setTrap] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const titleId = useId()
  const inputId = useId()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    setStatus(await subscribe({ email: email.trim(), downloadId: download.id, slug, consent: true, company_url: trap }))
  }

  const message = status in MESSAGES ? MESSAGES[status as keyof typeof MESSAGES] : ""
  const done = status === "done"

  return (
    <section className="email-gate" aria-labelledby={titleId}>
      <div className="email-gate-text">
        <h2 className="email-gate-title" id={titleId}>
          {download.title}
        </h2>
        <p>{download.description}</p>
      </div>
      {done ? null : (
        <form className="email-gate-form" onSubmit={onSubmit}>
          <label className="email-gate-label" htmlFor={inputId}>
            Email
          </label>
          <input
            className="email-gate-input"
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div aria-hidden="true">
            <input
              className="email-gate-trap"
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
          <button className="btn email-gate-button" type="submit" disabled={status === "sending"}>
            Send it to me
          </button>
          <p className="email-gate-note">I&apos;ll email you the link and add you to my list. One click to unsubscribe, any time.</p>
        </form>
      )}
      <p className="email-gate-status" data-state={status} aria-live="polite">
        {message}
      </p>
    </section>
  )
}
