import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Privacy notice: KalibreTrades concept" },
  robots: { index: false, follow: false },
}

export default function KalibrePrivacy() {
  return (
    <main className="kt-privacy">
      <a className="kt-link" href="/kalibre">
        Back to KalibreTrades
      </a>
      <h1>Privacy notice</h1>
      <p>
        This is a concept site for KalibreTrades, designed by Angad. The sign-up forms are here to show how they work. Nothing you type is
        sent anywhere or stored on a server.
      </p>
      <p>
        To show the &ldquo;already on the list&rdquo; state, this browser remembers the last five email addresses you try, in its own local
        storage. Clearing your browser data removes them.
      </p>
      <p>KalibreTrades will publish its real privacy notice before evaluations open.</p>
    </main>
  )
}
