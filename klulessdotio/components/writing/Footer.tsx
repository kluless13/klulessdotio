import { COPYRIGHT } from "@/lib/content"

const LINKS = [
  { name: "About", href: "/about" },
  { name: "Writing", href: "/writing" },
  { name: "RSS", href: "/writing/rss.xml" },
] as const

export function Footer() {
  return (
    <footer className="w-foot">
      <nav className="w-foot-links" aria-label="Footer">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.name}
          </a>
        ))}
      </nav>
      <p>{COPYRIGHT}</p>
    </footer>
  )
}
