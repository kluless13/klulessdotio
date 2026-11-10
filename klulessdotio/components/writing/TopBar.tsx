import { QuietLink } from "@/components/writing/QuietLink"

export function TopBar({ current }: { current?: "Writing" | "Library" }) {
  return (
    <header className="top-bar">
      <a className="top-name" href="/">
        Angad Maniyambath
      </a>
      <nav className="top-nav" aria-label="Main">
        <a className="btn" href="/writing" aria-current={current === "Writing" ? "page" : undefined}>
          Writing
        </a>
        <a className="btn" href="/library" aria-current={current === "Library" ? "page" : undefined}>
          Library
        </a>
        <QuietLink />
      </nav>
    </header>
  )
}
