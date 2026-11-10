"use client"

import { ArrowUpRight, Copy, Share } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"
import { Exhibit, type ExhibitState } from "@/components/library/exhibits"
import { ShareMenu } from "@/components/library/ShareMenu"
import { INERT, tileFit } from "@/components/library/Tile"
import { fontFamily } from "@/lib/library/fonts"
import type { ButtonItem } from "@/lib/library/types"

const COPIED_MS = 2000
// The live button sits 2.2 times its tile size, the state row at its tile size, as on the boards.
const HERO_SCALE = 2.2
const STATES: readonly (readonly [ExhibitState, string])[] = [
  ["rest", "Rest"],
  ["hover", "Hover"],
  ["pressed", "Pressed"],
]

/** What to measure: the button itself when its surface is stretched to fill the stage, else the whole exhibit. */
function measured(stage: HTMLElement, fill: boolean): HTMLElement | null {
  const button = fill ? stage.querySelector<HTMLElement>(".lx-surface > *") : null
  return button ?? stage.querySelector<HTMLElement>(".lx")
}

/**
 * An exhibit scaled as large as `cap` allows while still fitting its stage. A transform doesn't change
 * an element's layout size, so the exhibit's own size can be read at any scale.
 */
function FitStage({ slug, state, cap, fill, className }: { slug: string; state: ExhibitState; cap: number; fill: boolean; className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(cap)

  useEffect(() => {
    const stage = ref.current
    if (!stage) return
    const fit = () => {
      const target = measured(stage, fill)
      if (!target || !target.offsetWidth || !target.offsetHeight) return
      // Room kept clear around the button (so lifts and shadows aren't cut off) comes from the stylesheet.
      const css = getComputedStyle(stage)
      const padX = parseFloat(css.getPropertyValue("--fit-pad-x")) || 0
      const padY = parseFloat(css.getPropertyValue("--fit-pad-y")) || 0
      const roomX = (stage.clientWidth - padX * 2) / target.offsetWidth
      const roomY = (stage.clientHeight - padY * 2) / target.offsetHeight
      setScale(Math.max(0.1, Math.min(cap, roomX, roomY)))
    }
    fit()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(fit)
    observer.observe(stage)
    const target = measured(stage, fill)
    if (target) observer.observe(target)
    return () => observer.disconnect()
  }, [slug, cap, fill])

  return (
    <div ref={ref} className={className} style={{ "--s": scale } as CSSProperties}>
      <Exhibit slug={slug} state={state} scale={scale} />
    </div>
  )
}

function useCopied(): [boolean, () => void] {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const flash = () => {
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
  }
  return [copied, flash]
}

/** A button laid out in full: the live button and its states on the left; the note, the how and the CSS on the right. */
export function ButtonSheet({ item, titleId, onLinkCopied }: { item: ButtonItem; titleId: string; onLinkCopied: () => void }) {
  const [copied, flashCopied] = useCopied()
  const [sharing, setSharing] = useState(false)
  const shareRef = useRef<HTMLButtonElement>(null)
  const closeShare = useCallback(() => setSharing(false), [])
  const fit = tileFit(item.slug)

  // With the menu open and focus back on Share, Escape still closes the menu before the sheet.
  const onShareKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || !sharing) return
    event.stopPropagation()
    closeShare()
  }

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(item.css)
      flashCopied()
    } catch {
      // Clipboard refused: the label stays as it was, so nothing claims a copy that didn't happen.
    }
  }

  return (
    <>
      <div className="lib-sheet-specimen lib-sheet-specimen-button">
        <FitStage className="lib-sheet-hero" slug={item.slug} state="live" cap={HERO_SCALE * fit} fill />
        <div className="lib-sheet-states" aria-hidden="true" {...INERT}>
          {STATES.map(([state, label]) => (
            <div key={state} className="lib-sheet-state">
              <FitStage className="lib-sheet-state-stage" slug={item.slug} state={state} cap={fit} fill={false} />
              <span className="lib-sheet-state-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="lib-sheet-about">
        <h2 className="lib-sheet-name" id={titleId} style={{ fontFamily: fontFamily("geist") }}>
          {item.name}
        </h2>
        <p className="lib-sheet-soft">{item.source}</p>
        <p className="lib-sheet-note">{item.note}</p>
        <ul className="lib-sheet-how">
          {item.how.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <pre className="lib-sheet-code">
          <code>{item.css}</code>
        </pre>
        <div className="lib-sheet-actions">
          <button type="button" className="btn" onClick={copyCss}>
            <span aria-live="polite">{copied ? "Copied" : "Copy CSS"}</span>
            <Copy size={15} aria-hidden="true" />
          </button>
          <div className="lib-share" onKeyDown={onShareKeyDown}>
            <button
              type="button"
              ref={shareRef}
              className="btn lib-btn-alt"
              aria-haspopup="menu"
              aria-expanded={sharing}
              onClick={() => setSharing((open) => !open)}
            >
              Share
              <Share size={15} aria-hidden="true" />
            </button>
            {sharing ? (
              <ShareMenu slug={item.slug} title={item.name} anchorRef={shareRef} onClose={closeShare} onCopied={onLinkCopied} />
            ) : null}
          </div>
          {item.link ? (
            <a className="btn lib-btn-alt" href={item.link.href} target="_blank" rel="noopener">
              {item.link.label}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </>
  )
}
