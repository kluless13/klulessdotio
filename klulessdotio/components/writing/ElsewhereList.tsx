import { ArrowUpRight } from "lucide-react"
import { BrandIcon } from "@/components/writing/BrandIcon"
import type { ElsewhereLink } from "@/content/about"

export function ElsewhereList({ links }: { links: readonly ElsewhereLink[] }) {
  return (
    <section className="about-elsewhere" aria-label="Elsewhere">
      <h2>Elsewhere</h2>
      <div className="about-links">
        {links.map((link) => (
          <a key={link.label} className="about-link" href={link.href} rel="me noopener" target="_blank">
            <BrandIcon label={link.label} />
            <span className="about-link-label">{link.label}</span>
            <span className="about-link-handle">{link.handle}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  )
}
