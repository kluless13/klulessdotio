import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { ElsewhereList } from "@/components/writing/ElsewhereList"
import { JsonLd } from "@/components/writing/JsonLd"
import { Sheet } from "@/components/writing/Sheet"
import { WritingShell } from "@/components/writing/WritingShell"
import { BIO, ELSEWHERE, POINTERS } from "@/content/about"
import { SITE_URL } from "@/lib/writing/feeds"
import { breadcrumbJsonLd, pageMetadata, personJsonLd } from "@/lib/writing/seo"
import "../writing/writing.css"
import "../writing/post.css"
import "./about.css"

export const metadata: Metadata = pageMetadata("/about", "About · Angad Maniyambath", BIO[0])

const CRUMBS = breadcrumbJsonLd([
  { name: "Home", url: SITE_URL },
  { name: "About", url: `${SITE_URL}/about` },
])

export default function About() {
  return (
    <WritingShell>
      <JsonLd data={personJsonLd()} />
      <JsonLd data={CRUMBS} />
      <main className="post-page">
        <Sheet>
          <div className="about-head">
            <h1 className="post-title">About</h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="about-photo" src="/about/angad.jpg" width={104} height={104} alt="Angad Maniyambath" />
          </div>
          <div className="about-bio">
            {BIO.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="about-pointers">
            {POINTERS.map((p) => (
              <a key={p.label} className="about-pointer" href={p.href}>
                <span className="about-pointer-words">
                  <span className="about-pointer-label">{p.label}</span>
                  <span className="about-pointer-line">{p.line}</span>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
          <ElsewhereList links={ELSEWHERE} />
        </Sheet>
      </main>
    </WritingShell>
  )
}
