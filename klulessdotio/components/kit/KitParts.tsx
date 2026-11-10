import { Plug } from "lucide-react"
import type { EndingCard, KitBlock } from "@/lib/kit/types"
import { isCalLink } from "@/lib/kit/cal"
import { CalButton } from "./CalButton"

type Block<T extends KitBlock["type"]> = Extract<KitBlock, { type: T }>

/** Kit text is sanitised HTML from lib/kit/inline.ts, so it can go straight in. */
const html = (value: string) => ({ __html: value })

const COUNTS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]

/** Wrap a request in curly quotes unless the author already quoted it. */
const quoted = (text: string) => (/^\s*[“"]/.test(text) ? text : `“${text.trim()}”`)

/** "Basil:" and "What it's looking at." read as labels without their trailing colon or full stop. */
const label = (text: string) => text.trim().replace(/[:.]\s*$/, "")

/** Requests are plain text; bracketed words like [city] are fill-ins, shown lighter as in the design. */
function Fills({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]\n]+\])/).map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <span key={i} className="kit-fill-in">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function Steps({ block }: { block: Block<"steps"> }) {
  const rows = Math.ceil(block.items.length / 2)
  return (
    <div className="kit-contents">
      <p className="kit-contents-title">The {COUNTS[block.items.length] ?? block.items.length} steps</p>
      <ol className="kit-contents-list" style={{ gridTemplateRows: `repeat(${rows}, auto)` }}>
        {block.items.map((item, i) => (
          <li key={i} className="kit-contents-item">
            <span className="kit-contents-number" aria-hidden="true">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Paths({ block }: { block: Block<"paths"> }) {
  return (
    <div className="kit-paths">
      {block.paths.map((path, i) => (
        <section key={i} className="kit-path">
          <h3 className="kit-path-name">
            {path.name}
            {path.pick ? <span className="kit-pick">My pick</span> : null}
          </h3>
          <p className="kit-path-body" dangerouslySetInnerHTML={html(path.html)} />
        </section>
      ))}
    </div>
  )
}

const TIMELINE_PARTS = [
  ["find", "The agent finds the gaps"],
  ["decide", "We decide"],
  ["fix", "The agent fixes it"],
] as const

export function Timeline({ block }: { block: Block<"timeline"> }) {
  const total = block.find + block.decide + block.fix
  const parts = TIMELINE_PARTS.map(([key, words]) => ({ key, words, minutes: block[key] }))
  return (
    <div className="kit-timeline">
      <div className="kit-timeline-head">
        <p className="kit-timeline-title">
          {total} minute{total === 1 ? "" : "s"}, start to finish
        </p>
        {block.html ? <p className="kit-timeline-aside" dangerouslySetInnerHTML={html(block.html)} /> : null}
      </div>
      <ol className="kit-timeline-parts" style={{ gridTemplateColumns: parts.map((p) => `minmax(min-content, ${p.minutes}fr)`).join(" ") }}>
        {parts.map((part) => (
          <li key={part.key} className="kit-timeline-part" data-part={part.key}>
            <span className="kit-timeline-bar" aria-hidden="true" />
            <span className="kit-timeline-minutes">{part.minutes} min</span>
            <span className="kit-timeline-words">{part.words}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function BeforeAfter({ block }: { block: Block<"beforeAfter"> }) {
  // The first line of the before side is the vague request; anything after it is a short comment on it
  const [request = "", ...comment] = block.before.split("<br>")
  return (
    <div className="kit-ba">
      <div className="kit-ba-before">
        <p className="kit-ba-label">Before</p>
        <p className="kit-ba-quote" dangerouslySetInnerHTML={html(quoted(request))} />
        {comment.length ? <p className="kit-ba-comment" dangerouslySetInnerHTML={html(comment.join("<br>"))} /> : null}
      </div>
      <div className="kit-ba-after">
        <p className="kit-ba-label">After</p>
        <ol className="kit-ba-parts">
          {block.after.map((part, i) => (
            <li key={i} className="kit-ba-part">
              {part.label ? <p className="kit-ba-part-label">{`${i + 1}. ${label(part.label)}`}</p> : null}
              <p className="kit-ba-part-quote">{quoted(part.quote)}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** "Reconciling: making two things agree" is the job's name and, under it, what it does. */
function jobTitle(title: string): { name: string; what: string } {
  const at = title.indexOf(":")
  if (at < 0) return { name: title.trim(), what: "" }
  const what = title.slice(at + 1).trim()
  return { name: title.slice(0, at).trim(), what: what.charAt(0).toUpperCase() + what.slice(1) }
}

export function Job({ block }: { block: Block<"job"> }) {
  const { name, what } = jobTitle(block.title)
  return (
    <section className="kit-job kit-wide">
      <div className="kit-job-about">
        <div className="kit-job-heading">
          <h3 className="kit-job-name">{name}</h3>
          {what ? <p className="kit-job-what">{what}</p> : null}
        </div>
        {block.who ? <p className="kit-job-who">{block.who}</p> : null}
      </div>
      <div className="kit-job-recipe">
        <p className="kit-job-before">
          <strong>Before:</strong> <span dangerouslySetInnerHTML={html(block.before)} />
        </p>
        <blockquote className="kit-job-request">
          <p>
            <Fills text={quoted(block.request)} />
          </p>
        </blockquote>
        <p className="kit-job-connect">
          <Plug size={15} aria-hidden="true" />
          <span>
            Connect: <span dangerouslySetInnerHTML={html(block.connect)} />
          </span>
        </p>
      </div>
    </section>
  )
}

/** "<strong>2022:</strong> I started…" is a year and what happened in it. */
function yearOf(item: string): { when: string; what: string } {
  const match = /^<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/.exec(item)
  return match ? { when: match[1].replace(/:\s*$/, ""), what: match[2] } : { when: "", what: item }
}

function Card({ card }: { card: EndingCard }) {
  return (
    <div className={card.cta ? "kit-card kit-card-action" : "kit-card"}>
      <h3 className="kit-card-title">{card.title}</h3>
      <p className="kit-card-text" dangerouslySetInnerHTML={html(card.html)} />
      {card.cta ? (
        <div className="kit-card-cta">
          {isCalLink(card.cta.href) ? (
            <CalButton label={card.cta.label} href={card.cta.href} />
          ) : (
            <a className="btn" href={card.cta.href}>
              {card.cta.label}
            </a>
          )}
        </div>
      ) : null}
    </div>
  )
}

/**
 * The ending, as on the board: the opening lines, the timeline list, the paragraphs after it, the cards,
 * and the business paragraph. The parser keeps every paragraph after the list in `outro`, so the last one
 * is taken as the business paragraph that follows the cards.
 */
export function Ending({ block }: { block: Block<"ending"> }) {
  const lead = block.outro.slice(0, -1)
  const last = block.outro[block.outro.length - 1]
  return (
    <div className="kit-ending kit-wide">
      {block.intro.map((p, i) => (
        <p key={`intro-${i}`} className="kit-p" dangerouslySetInnerHTML={html(p)} />
      ))}
      {block.timeline.length ? (
        <ol className="kit-years">
          {block.timeline.map((item, i) => {
            const { when, what } = yearOf(item)
            return (
              <li key={i} className="kit-year">
                <span className="kit-year-when" dangerouslySetInnerHTML={html(when)} />
                <span className="kit-year-what" dangerouslySetInnerHTML={html(what)} />
              </li>
            )
          })}
        </ol>
      ) : null}
      {lead.map((p, i) => (
        <p key={`outro-${i}`} className="kit-p" dangerouslySetInnerHTML={html(p)} />
      ))}
      {block.cards.length ? (
        <div className="kit-cards">
          {block.cards.map((card, i) => (
            <Card key={i} card={card} />
          ))}
        </div>
      ) : null}
      {last ? <p className="kit-p kit-business" dangerouslySetInnerHTML={html(last)} /> : null}
    </div>
  )
}
