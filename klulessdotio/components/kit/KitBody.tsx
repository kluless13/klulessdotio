import { Caveat } from "next/font/google"
import type { KitBlock, KitDoc } from "@/lib/kit/types"
import { Byline } from "./Byline"
import { CopyPrompt } from "./CopyPrompt"
import { KitInk } from "./KitInk"
import { MarginNotes } from "./MarginNotes"
import { BeforeAfter, Ending, Job, Paths, Steps, Timeline } from "./KitParts"

// The margin notes' handwriting. Only the kit page loads it, and only when a note is drawn
const caveat = Caveat({ subsets: ["latin"], weight: "500", variable: "--font-caveat", display: "swap", preload: false })

const DEK = "A free starter kit for getting AI agents to do real work in your tools. No code."

/** Kit text is sanitised HTML from lib/kit/inline.ts, so it can go straight in. */
const html = (value: string) => ({ __html: value })

function Heading({ block }: { block: Extract<KitBlock, { type: "heading" }> }) {
  if (block.level === 3) return <h3 className="kit-h3">{block.text}</h3>
  if (block.step === undefined) return <h2 className="kit-h2">{block.text}</h2>
  return (
    <h2 className="kit-h2 kit-step" id={`step-${block.step}`}>
      <span className="kit-badge">{block.step}</span>
      {block.text}
    </h2>
  )
}

function List({ block }: { block: Extract<KitBlock, { type: "list" }> }) {
  const Tag = block.ordered ? "ol" : "ul"
  return (
    <Tag className={block.ordered ? "kit-list kit-list-numbered" : "kit-list"}>
      {block.items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={html(item)} />
      ))}
    </Tag>
  )
}

function Block({ block }: { block: KitBlock }) {
  switch (block.type) {
    case "heading":
      return <Heading block={block} />
    case "paragraph":
      return (
        <MarginNotes notes={block.notes}>
          <p className="kit-p" dangerouslySetInnerHTML={html(block.html)} />
        </MarginNotes>
      )
    case "list":
      return (
        <MarginNotes notes={block.notes}>
          <List block={block} />
        </MarginNotes>
      )
    case "steps":
      return <Steps block={block} />
    case "paths":
      return <Paths block={block} />
    case "timeline":
      return <Timeline block={block} />
    case "beforeAfter":
      return <BeforeAfter block={block} />
    case "prompt":
      return <CopyPrompt text={block.text} />
    case "job":
      return <Job block={block} />
    case "ending":
      return <Ending block={block} />
  }
}

/**
 * The kit itself on its reading sheet: a 632px text column with a margin for handwritten notes,
 * and the prompt, job cards and ending cards across the full sheet.
 */
export function KitBody({ doc }: { doc: KitDoc }) {
  return (
    <article className="kit-sheet kit-guide">
      <header className="kit-head">
        <h1 className="kit-title">{doc.title}</h1>
        <p className="kit-dek">{DEK}</p>
        <Byline />
      </header>
      <KitInk className={`kit-body ${caveat.variable}`}>
        {doc.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </KitInk>
    </article>
  )
}
