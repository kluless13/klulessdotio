import type { Metadata } from "next"
import { ToneShell } from "@/components/ToneShell"

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

export default function UnsubscribePage({ searchParams }: { searchParams: { status?: string } }) {
  const status: Status = isStatus(searchParams.status) ? searchParams.status : "invalid"
  return (
    <ToneShell className="writing">
      <main style={{ maxWidth: "32rem", margin: "6rem auto", padding: "0 1rem" }}>
        <p>{MESSAGES[status]}</p>
      </main>
    </ToneShell>
  )
}
