import type { Metadata } from "next"
import { Byline } from "@/components/kit/Byline"
import { Highlight } from "@/components/kit/Highlight"
import { KitGate } from "@/components/kit/KitGate"
import { ToneShell } from "@/components/ToneShell"
import { JsonLd } from "@/components/writing/JsonLd"
import { KIT_URL, SITE_URL } from "@/lib/writing/feeds"
import { breadcrumbJsonLd, pageMetadata } from "@/lib/writing/seo"

const TITLE = "Talk to it. It does the work. · Angad Maniyambath"
const DESCRIPTION =
  "A free starter kit for getting AI agents to do real work in your tools. Five steps, a starting prompt and five real jobs, for Claude or ChatGPT. No code."
const SHARE = { url: "/kit/og.jpg", width: 1200, height: 630, alt: "Talk to it. It does the work. A free starter kit." }

const base = pageMetadata("/kit", TITLE, DESCRIPTION)
export const metadata: Metadata = {
  ...base,
  openGraph: { ...base.openGraph, images: [SHARE] },
  twitter: { ...base.twitter, images: [SHARE.url] },
}

const CRUMBS = breadcrumbJsonLd([
  { name: "Home", url: SITE_URL },
  { name: "Starter kit", url: KIT_URL },
])

const STEPS = [
  "Switch from chatting to working",
  "Give it hands",
  "Talk to it like a capable colleague",
  "Let it learn how you work",
  "Find your first real job",
] as const

const TILES = [
  ["A starting prompt", "Paste it in once. The agent interviews you, then writes its own notes on how you like to work."],
  ["Five kinds of jobs", "Reconciling, reporting, drafting, organising and building, each with a request written out for you."],
] as const

export default function KitSignupPage() {
  return (
    <ToneShell className="kit">
      <JsonLd data={CRUMBS} />
      <main className="kit-page">
        <article className="kit-sheet">
          <header className="kit-head">
            <h1 className="kit-title">Talk to it. It does the work.</h1>
            <p className="kit-dek">A free starter kit for getting AI agents to do real work in your tools. No code.</p>
            <Byline />
          </header>
          <KitGate />
          <div className="kit-prose">
            <p>
              It&apos;s for people who have only ever chatted with AI. Business owners, teachers, accountants, scientists: anyone with
              spreadsheets, documents and accounts to look after. <Highlight>You talk to the agent in plain words</Highlight>, the way
              you&apos;d brief a capable colleague, and it does the work inside your tools.
            </p>
            <p>
              It works whether you pay for Claude or for ChatGPT. The setup for each sits side by side, so you only follow your own.
            </p>
          </div>
          <section className="kit-inside" aria-labelledby="kit-inside-title">
            <h2 className="kit-inside-title" id="kit-inside-title">
              What&apos;s inside
            </h2>
            <div className="kit-box kit-steps">
              <h3 className="kit-box-title">Five steps, from chatting to working</h3>
              <ol className="kit-steps-list">
                {STEPS.map((step, i) => (
                  <li key={step} className="kit-step">
                    <span className="kit-step-number" aria-hidden="true">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="kit-pair">
              {TILES.map(([title, text]) => (
                <div key={title} className="kit-box">
                  <h3 className="kit-box-title">{title}</h3>
                  <p className="kit-box-text">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
    </ToneShell>
  )
}
