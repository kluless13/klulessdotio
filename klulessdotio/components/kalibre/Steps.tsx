"use client"

import { useEffect, useRef, useState } from "react"
import { useCoarsePointer, useSeenOnce } from "./hooks"

const BAR_LABELS = ["£10k", "£25k", "£50k", "£100k"] as const
const RESTING_BAR = 2
const BAR_STEP_MS = 120
/** On phones the climb plays once, holds on £100k, then settles back */
const TOUCH_HOLD_MS = 700

/** Plays a card's motion on hover with a mouse, or once on scroll into view on a phone */
function useCardMotion() {
  const coarse = useCoarsePointer()
  const [ref, seen] = useSeenOnce<HTMLElement>()
  const [hovered, setHovered] = useState(false)
  const active = coarse ? seen : hovered
  const handlers = coarse
    ? {}
    : { onPointerEnter: () => setHovered(true), onPointerLeave: () => setHovered(false) }
  return { ref, active, coarse, handlers }
}

function BarsCard() {
  const { ref, active, coarse, handlers } = useCardMotion()
  const [lit, setLit] = useState(RESTING_BAR)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const clear = () => timers.current.forEach((timer) => window.clearTimeout(timer))
    clear()
    if (!active) {
      setLit(RESTING_BAR)
      return clear
    }
    const climb = BAR_LABELS.map((_, index) => window.setTimeout(() => setLit(index), index * BAR_STEP_MS))
    const settle = coarse ? [window.setTimeout(() => setLit(RESTING_BAR), BAR_LABELS.length * BAR_STEP_MS + TOUCH_HOLD_MS)] : []
    timers.current = [...climb, ...settle]
    return clear
  }, [active, coarse])

  return (
    <article className="kt-step kt-step--1" ref={ref} data-active={active ? "" : undefined} {...handlers}>
      <StepText number="01" title="Pick your account size" text="Read the full terms first. Nothing is hidden." />
      <div className="kt-step-art kt-bars-art">
        <div className="kt-bars" aria-hidden="true">
          {BAR_LABELS.map((label, index) => (
            <span key={label} className="kt-bar" data-bar={index} data-lit={index === lit ? "" : undefined} />
          ))}
        </div>
        <div className="kt-bar-labels" aria-hidden="true">
          {BAR_LABELS.map((label, index) => (
            <span key={label} data-lit={index === lit ? "" : undefined}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

function CandlesCard() {
  const { ref, active, handlers } = useCardMotion()
  const [plays, setPlays] = useState(0)
  useEffect(() => {
    if (active) setPlays((count) => count + 1)
  }, [active])

  return (
    <article className="kt-step kt-step--2" ref={ref} data-active={active ? "" : undefined} {...handlers}>
      <StepText number="02" title="Trade the evaluation" text="Stay within the drawdown floor, daily loss limit and profit target to pass." />
      <div className="kt-step-art kt-candles-art" aria-hidden="true">
        <img src="/kalibre/step-candles-bg.png" alt="" width={720} height={640} loading="lazy" />
        <img key={plays} className="kt-candles-fg" data-play={plays > 0 ? "" : undefined} src="/kalibre/step-candles-fg.png" alt="" width={720} height={640} loading="lazy" />
      </div>
    </article>
  )
}

function HalftoneCard() {
  const { ref, active, coarse, handlers } = useCardMotion()
  return (
    <article className="kt-step kt-step--3 kt-on-navy" ref={ref} data-active={active ? "" : undefined} data-touch={coarse ? "" : undefined} {...handlers}>
      <StepText number="03" title="Get funded" text="Payouts processed within 14 days. Consistent traders can add more accounts." />
      <div className="kt-step-bottom">
        <p className="kt-step-stat">
          <strong>14</strong> days to your payout
        </p>
        <div className="kt-step-art kt-halftone-art" aria-hidden="true">
          <img src="/kalibre/step-halftone.png" alt="" width={720} height={580} loading="lazy" />
          {/* A brighter copy shown only through rings that travel out from the corner */}
          <img className="kt-halftone-ripple" src="/kalibre/step-halftone.png" alt="" width={720} height={580} loading="lazy" />
        </div>
      </div>
    </article>
  )
}

function StepText({ number, title, text }: { readonly number: string; readonly title: string; readonly text: string }) {
  return (
    <div className="kt-step-text">
      <p className="kt-step-num">{number}</p>
      <h3 className="kt-step-title">{title}</h3>
      <p className="kt-step-body">{text}</p>
    </div>
  )
}

/** How it works: three cards rising like steps, the heading level with the middle of the tallest */
export function Steps() {
  return (
    <section className="kt-section kt-steps" id="how-it-works" aria-labelledby="kt-steps-title">
      <h2 className="kt-h2 kt-steps-title" id="kt-steps-title">
        How it works
      </h2>
      <BarsCard />
      <CandlesCard />
      <HalftoneCard />
    </section>
  )
}
