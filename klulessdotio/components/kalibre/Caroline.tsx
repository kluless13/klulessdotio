"use client"

import { useId, useState } from "react"
import { AmazonMark, ChevronIcon, QuoteMark, Signature } from "./icons"
import { useCoarsePointer } from "./hooks"

const CREDENTIALS = [
  { key: "strathclyde", degree: "PhD, University of Strathclyde", name: "University of Strathclyde", width: 55, height: 64 },
  { key: "oxford", degree: "MA, University of Oxford", name: "University of Oxford", width: 77, height: 72, file: "ox_stack" },
  { key: "insead", degree: "MBA, INSEAD", name: "INSEAD", width: 120, height: 64 },
] as const

const BOOKS = [
  { title: "Passing the Prop Firm Challenge", text: "The drawdown, correlation and behaviour limits that decide most evaluations." },
  { title: "Trading Through Chaos", text: "How to prepare for markets when normal patterns break down." },
  { title: "Sovereign Signals", text: "How central banks and governments move markets before prices react." },
  { title: "Beyond Risk On", text: "Reading market conditions by volatility, correlation and liquidity, not direction." },
  { title: "Why Women Don't Trade… and Why They Should", text: "Why fewer women invest, and why structure, not confidence, explains the gap." },
] as const

const amazonSearch = (title: string) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(title)}`

function Credentials() {
  const coarse = useCoarsePointer()
  const [shown, setShown] = useState<string | null>(null)

  return (
    <ul className="kt-logos" aria-label="Degrees" data-touch={coarse ? "" : undefined} data-hovering={shown ? "" : undefined}>
      {CREDENTIALS.map((item) => {
        const file = "file" in item ? item.file : item.key
        const open = shown === item.key
        return (
          <li key={item.key} className="kt-logo" data-open={open ? "" : undefined}>
            <button
              type="button"
              className="kt-logo-btn"
              aria-label={item.degree}
              aria-expanded={coarse ? open : undefined}
              onPointerEnter={() => !coarse && setShown(item.key)}
              onPointerLeave={() => !coarse && setShown(null)}
              onFocus={() => setShown(item.key)}
              onBlur={() => setShown(null)}
              onClick={() => coarse && setShown(open ? null : item.key)}
              onKeyDown={(event) => event.key === "Escape" && setShown(null)}
            >
              <img className="kt-logo-navy" src={`/kalibre/${file}_navy.png`} alt="" width={item.width} height={item.height} />
              <img className="kt-logo-colour" src={`/kalibre/${file}_color.png`} alt="" width={item.width} height={item.height} />
            </button>
            {/* The button's label already says the degree, so the bubble is visual only */}
            <span className="kt-logo-tip" aria-hidden="true">
              {item.degree}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Books({ id }: { readonly id: string }) {
  return (
    <div className="kt-books" id={id}>
      <div className="kt-books-head">
        <h3>Dr Caroline&rsquo;s books</h3>
        <p>Optional reading on markets and evaluations. Sold on Amazon, separate from KalibreTrades.</p>
      </div>
      <ul className="kt-book-rows">
        {BOOKS.map((book, index) => (
          <li key={book.title} style={{ animationDelay: `${index * 40}ms` }}>
            <a className="kt-book" href={amazonSearch(book.title)} target="_blank" rel="noopener noreferrer">
              <span className="kt-book-text">
                <span className="kt-book-title">{book.title}</span>
                <span className="kt-book-desc">{book.text}</span>
              </span>
              <span className="kt-book-buy" title="Buy on Amazon">
                <AmazonMark />
                <span className="kt-sr">Buy on Amazon, opens in a new tab</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="kt-books-foot">Published by Westerbridge Publications</p>
    </div>
  )
}

/** Dr Caroline: portrait, quote, background, degrees and the books list */
export function Caroline() {
  const [booksOpen, setBooksOpen] = useState(false)
  const booksId = useId()

  return (
    <section className="kt-section kt-caroline" id="dr-caroline" aria-label="Dr Caroline Whitfield">
      <div className="kt-caroline-card">
        <div className="kt-caroline-top">
          <figure className="kt-portrait">
            <img src="/kalibre/portrait.png" alt="" width={440} height={520} loading="lazy" />
            <figcaption>Photo of Dr Caroline coming soon</figcaption>
          </figure>
          <div className="kt-caroline-text">
            <QuoteMark className="kt-quote-mark" />
            <blockquote className="kt-quote">
              The gap between how evaluations are designed and how traders experience them was obvious, and fixable.
            </blockquote>
            <div className="kt-byline">
              <Signature className="kt-signature" />
              <p className="kt-byline-name">Dr Caroline Whitfield</p>
              <p className="kt-byline-role">Founder, KalibreTrades</p>
            </div>
            <div className="kt-background">
              <p>
                More than 10 years of live trading across metals, forex, futures and equities. PhD from Strathclyde, MA from Oxford
                and MBA from INSEAD.
              </p>
              <div className="kt-logos-row">
                <Credentials />
                <button
                  type="button"
                  className="kt-btn kt-btn--navy kt-books-btn"
                  aria-expanded={booksOpen}
                  aria-controls={booksOpen ? booksId : undefined}
                  onClick={() => setBooksOpen((open) => !open)}
                >
                  Read her books
                  <ChevronIcon className="kt-books-chevron" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {booksOpen ? <Books id={booksId} /> : null}
      </div>
    </section>
  )
}
