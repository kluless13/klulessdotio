import { ArrowRight } from "lucide-react"

/** The 404 message: what happened, and the way back. */
export function LostAtSea() {
  return (
    <main className="lost-main">
      <h1>Lost at sea.</h1>
      <p>This page doesn't exist, but the rest of the site does.</p>
      <a className="btn" href="/">
        Take me home <ArrowRight size={15} aria-hidden="true" />
      </a>
    </main>
  )
}
