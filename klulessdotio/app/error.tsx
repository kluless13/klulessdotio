"use client"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="error-page">
      <h1>Something went wrong.</h1>
      <button type="button" className="btn" onClick={reset}>
        Try again
      </button>
    </main>
  )
}
