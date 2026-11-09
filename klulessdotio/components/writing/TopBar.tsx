import { QuietLink } from "@/components/writing/QuietLink"

export function TopBar({ current }: { current?: "Writing" }) {
  return (
    <header className="top-bar">
      <a className="top-name" href="/">
        Angad Maniyambath
      </a>
      <nav className="top-nav" aria-label="Main">
        <a className="btn" href="/writing" aria-current={current === "Writing" ? "page" : undefined}>
          Writing
        </a>
        <QuietLink />
      </nav>
    </header>
  )
}
