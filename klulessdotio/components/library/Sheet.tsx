"use client"

import { AnimatePresence, motion, useIsPresent, useReducedMotion, type TargetAndTransition } from "framer-motion"
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react"
import { ButtonSheet } from "@/components/library/ButtonSheet"
import { FontSheet } from "@/components/library/FontSheet"
import { positionLabel, stepIndex } from "@/lib/library/navigation"
import type { LibraryItem } from "@/lib/library/types"

/** How the tile grows into the sheet and shrinks back. Tiles use it too, through LibraryView. */
export const GROW = { duration: 0.3, ease: [0.2, 0, 0, 1] } as const
const FADE = { duration: 0.2, ease: "easeOut" } as const
const SWIPE_PX = 50
const TOAST_MS = 2000
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'

export interface SheetProps {
  items: readonly LibraryItem[]
  index: number
  onStep: (index: number) => void
  onClose: () => void
}

/** The open item's tile, so a sheet that has stepped away from where it grew can still shrink into it. */
export function tileFor(slug: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-slug="${slug}"]`)
}

function shrinkInto(frame: HTMLElement | null, slug: string): TargetAndTransition {
  const tile = tileFor(slug)
  if (!frame || !tile) return { opacity: 0, scale: 0.96, transition: GROW }
  const from = frame.getBoundingClientRect()
  const to = tile.getBoundingClientRect()
  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scaleX: to.width / from.width,
    scaleY: to.height / from.height,
    opacity: 0,
    transition: GROW,
  }
}

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest("[inert]"))
}

/** Keeps Tab and Shift+Tab inside the sheet. */
function trapTab(event: KeyboardEvent<HTMLElement>, root: HTMLElement) {
  const list = focusables(root)
  if (list.length === 0) return
  const first = list[0]
  const last = list[list.length - 1]
  const active = document.activeElement
  const leavingStart = event.shiftKey && (active === first || active === root)
  const leavingEnd = !event.shiftKey && (active === last || active === root)
  if (!leavingStart && !leavingEnd) return
  event.preventDefault()
  ;(event.shiftKey ? last : first).focus()
}

// Arrow keys in these places belong to them: typing, scrolling code sideways, or moving through a menu.
function ownsArrows(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.closest("input, textarea, select, pre, [role=menu]") !== null
}

function Toast({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div className="lib-toasts" role="status">
      <AnimatePresence>
        {show ? (
          <motion.div className="lib-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={FADE}>
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/**
 * The open item over the dimmed page. It grows out of its tile through a shared layoutId (the tile carries
 * the same one). Once it steps to another item it lets go of that link, so stepping never replays the grow,
 * and closing shrinks it into the current item's tile by hand instead.
 */
export function Sheet({ items, index, onStep, onClose }: SheetProps) {
  const item = items[index]
  const reduced = useReducedMotion()
  const present = useIsPresent()
  const titleId = useId()
  const layerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const [stepped, setStepped] = useState(false)
  const [copiedAt, setCopiedAt] = useState(0)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const root = document.documentElement
    root.classList.add("no-scroll")
    return () => root.classList.remove("no-scroll")
  }, [])

  // Stepping can remove the focused control (a font sheet has no Copy CSS), so keep focus inside.
  useEffect(() => {
    const layer = layerRef.current
    if (layer && !layer.contains(document.activeElement)) layer.focus({ preventScroll: true })
  }, [item.slug])

  useEffect(() => {
    if (!copiedAt) return
    const timer = window.setTimeout(() => setCopiedAt(0), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [copiedAt])

  const step = (delta: number) => {
    if (!present || items.length < 2) return
    setStepped(true)
    onStep(stepIndex(index, delta, items.length))
  }

  const close = () => {
    if (present) onClose()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      close()
    } else if (event.key === "Tab" && layerRef.current) {
      trapTab(event, layerRef.current)
    } else if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !event.altKey && !event.metaKey && !event.ctrlKey) {
      if (ownsArrows(event.target)) return
      event.preventDefault()
      step(event.key === "ArrowLeft" ? -1 : 1)
    }
  }

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    const inCode = event.target instanceof HTMLElement && event.target.closest("pre") !== null
    touchStart.current = touch && event.touches.length === 1 && !inCode ? { x: touch.clientX, y: touch.clientY } : null
  }

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current
    const touch = event.changedTouches[0]
    touchStart.current = null
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1)
  }

  // Shared with the tile until the first step; after that a plain frame that shrinks into the tile by hand.
  const shared = !reduced && !stepped
  const frameMotion = shared
    ? { layoutId: item.slug, transition: GROW }
    : {
        initial: stepped ? false : { opacity: 0 },
        animate: { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1 },
        exit: reduced ? { opacity: 0, transition: FADE } : "gone",
        variants: { gone: () => shrinkInto(frameRef.current, item.slug) },
        transition: FADE,
      }

  return (
    <div
      ref={layerRef}
      className="lib-sheet-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-closing={present ? undefined : ""}
      onKeyDown={onKeyDown}
    >
      <motion.div
        className="lib-sheet-dim"
        aria-hidden="true"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={GROW}
      />
      <motion.div
        key={shared ? "shared" : "plain"}
        ref={frameRef}
        className="lib-sheet"
        data-kind={item.kind}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        {...frameMotion}
      >
        <motion.div
          key={item.slug}
          className="lib-sheet-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...FADE, delay: shared ? 0.12 : 0 }}
        >
          {item.kind === "font" ? (
            <FontSheet item={item} titleId={titleId} />
          ) : (
            <ButtonSheet item={item} titleId={titleId} onLinkCopied={() => setCopiedAt(Date.now())} />
          )}
        </motion.div>
        <motion.div className="lib-sheet-top" initial={shared ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ ...FADE, delay: 0.12 }}>
          <span className="lib-sheet-position" aria-live="polite">
            {positionLabel(index, items.length)}
          </span>
          <button type="button" ref={closeRef} className="lib-sheet-close" aria-label="Close" onClick={close}>
            <X size={18} aria-hidden="true" />
          </button>
        </motion.div>
      </motion.div>
      {items.length > 1 ? (
        <>
          <motion.button
            type="button"
            className="lib-sheet-arrow lib-sheet-prev"
            aria-label="Previous"
            onClick={() => step(-1)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={GROW}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </motion.button>
          <motion.button
            type="button"
            className="lib-sheet-arrow lib-sheet-next"
            aria-label="Next"
            onClick={() => step(1)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={GROW}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </motion.button>
        </>
      ) : null}
      <Toast show={copiedAt > 0}>
        <Check size={15} aria-hidden="true" />
        Link copied
      </Toast>
    </div>
  )
}
