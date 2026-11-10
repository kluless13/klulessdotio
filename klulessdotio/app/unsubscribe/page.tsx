import type { Metadata } from "next"
import { ToneShell } from "@/components/ToneShell"
import "./unsubscribe.css"

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
}

const MESSAGES = {
  done: "You're unsubscribed. Your kit link still works.",
  invalid: "That unsubscribe link doesn't look right.",
  error: "Something went wrong on my end. Try again in a minute.",
} as const

type Status = keyof typeof MESSAGES

const isStatus = (value: string | undefined): value is Status =>
  value === "done" || value === "invalid" || value === "error"

// Tokens are base64url plus a dot, so anything else is not a real link.
const TOKEN_SHAPE = /^[\w.-]{1,2000}$/

export default function UnsubscribePage({ searchParams }: { searchParams: { status?: string; token?: string } }) {
  const token = searchParams.token && TOKEN_SHAPE.test(searchParams.token) ? searchParams.token : undefined
  const status: Status = isStatus(searchParams.status) ? searchParams.status : "invalid"
  return (
    <ToneShell className="writing">
      <main className="unsubscribe">
        {token ? (
          <>
            <p>Unsubscribe from Angad&rsquo;s emails? Your kit link will keep working.</p>
            <form method="post" action={`/api/unsubscribe/${token}`}>
              <button type="submit" className="btn">
                Unsubscribe
              </button>
            </form>
          </>
        ) : (
          <p>{MESSAGES[status]}</p>
        )}
      </main>
    </ToneShell>
  )
}
