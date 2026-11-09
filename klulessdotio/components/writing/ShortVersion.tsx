export function ShortVersion({ text }: { text: string }) {
  return (
    <section className="short-version" aria-labelledby="short-version-title">
      <h2 className="short-version-title" id="short-version-title">
        The short version
      </h2>
      <p>{text}</p>
    </section>
  )
}
