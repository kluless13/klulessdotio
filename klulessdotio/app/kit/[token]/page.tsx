import type { Metadata } from "next"
import type { ReactNode } from "react"
import { KitBody } from "@/components/kit/KitBody"
import { KitGate } from "@/components/kit/KitGate"
import { ToneShell } from "@/components/ToneShell"
import { kitSecret, verifyKitToken } from "@/lib/downloads/token"
import { loadKitContent } from "@/lib/kit/content"
import "../guide.css"

// Every link is someone's own: read the text fresh for each request and never cache a page across tokens
export const dynamic = "force-dynamic"

const TITLE = "Your starter kit · Angad Maniyambath"

export async function generateMetadata(): Promise<Metadata> {
  return { title: TITLE, robots: { index: false, follow: false } }
}

function isValid(token: string, secret: string): boolean {
  try {
    return verifyKitToken(token, secret).ok
  } catch {
    return false
  }
}

/** A short sheet for the two states that aren't the kit: a bad link, or the text being out of reach. */
function Notice({ title, line, children }: { title: string; line: string; children?: ReactNode }) {
  return (
    <article className="kit-sheet kit-notice">
      <header className="kit-head">
        <h1 className="kit-title">{title}</h1>
        <p className="kit-dek">{line}</p>
      </header>
      {children}
    </article>
  )
}

function Page({ children }: { children: ReactNode }) {
  return (
    <ToneShell className="kit">
      <main className="kit-page">{children}</main>
    </ToneShell>
  )
}

/**
 * The kit, for a valid kit link. Any other token (garbled, truncated, a download or unsubscribe token) gets a
 * friendly note and the signup form. If the text can't be read, the reader is told to try again shortly.
 * Next 14 pages can't set their own status code, so that state is a 200 carrying the message (noindex either way).
 */
export default async function KitPage({ params }: { params: { token: string } }) {
  const secret = kitSecret(process.env)
  if (!secret) {
    return (
      <Page>
        <Notice title="Something went wrong on my end." line="Try again in a minute." />
      </Page>
    )
  }
  if (!isValid(params.token, secret)) {
    return (
      <Page>
        <Notice title="This link doesn't work." line="Pop in your email and I'll send you a fresh one.">
          <KitGate />
        </Notice>
      </Page>
    )
  }
  const content = await loadKitContent(process.env)
  if (!content.ok) {
    return (
      <Page>
        <Notice title="Something went wrong on my end." line="Try again in a minute." />
      </Page>
    )
  }
  return (
    <Page>
      <KitBody doc={content.doc} />
    </Page>
  )
}
