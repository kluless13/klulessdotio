"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react"
import {
  ACCOUNT_SIZES,
  DEFAULT_SIZE,
  figuresFor,
  formatPounds,
  formatShort,
  liveSizeAt,
  nearestSize,
  positionOf,
  stepSize,
  type AccountSize,
} from "@/lib/kalibre/accounts"
import { Odometer } from "./Odometer"
import { ListCta } from "./ListCta"

/** How long the gold ring shows after the handle snaps into place */
const SNAP_RING_MS = 600

const KEY_MOVES: Readonly<Record<string, (size: AccountSize) => AccountSize>> = {
  ArrowRight: (size) => stepSize(size, 1),
  ArrowUp: (size) => stepSize(size, 1),
  ArrowLeft: (size) => stepSize(size, -1),
  ArrowDown: (size) => stepSize(size, -1),
  Home: () => ACCOUNT_SIZES[0],
  End: () => ACCOUNT_SIZES[ACCOUNT_SIZES.length - 1],
}

/** Dragging along the track: follows the pointer, then hands the release point back. Main mouse button and touch only. */
function useSliderDrag(trackRef: RefObject<HTMLDivElement>, gripRef: RefObject<HTMLDivElement>, onRelease: (position: number) => void) {
  const [dragPosition, setDragPosition] = useState<number | null>(null)

  const positionFrom = (clientX: number): number | null => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      gripRef.current?.focus({ preventScroll: true })
      setDragPosition(positionFrom(event.clientX))
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      if (dragPosition !== null) setDragPosition(positionFrom(event.clientX) ?? dragPosition)
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      if (dragPosition === null) return
      const position = positionFrom(event.clientX) ?? dragPosition
      setDragPosition(null)
      onRelease(position)
    },
    onPointerCancel: () => setDragPosition(null),
  }

  return { dragPosition, handlers }
}

/** The account size picker: drag, click a label or use the arrow keys. Figures roll to their new values. */
export function AccountSlider() {
  const [size, setSize] = useState<AccountSize>(DEFAULT_SIZE)
  const [snapped, setSnapped] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)
  const snapTimer = useRef<number | undefined>(undefined)
  const figures = figuresFor(size)

  const settle = (next: AccountSize) => {
    setSize(next)
    setSnapped(true)
    window.clearTimeout(snapTimer.current)
    snapTimer.current = window.setTimeout(() => setSnapped(false), SNAP_RING_MS)
  }

  useEffect(() => () => window.clearTimeout(snapTimer.current), [])

  const { dragPosition, handlers } = useSliderDrag(trackRef, gripRef, (position) => {
    settle(nearestSize(position))
    if ("vibrate" in navigator) navigator.vibrate?.(8)
  })

  const dragging = dragPosition !== null
  const position = dragging ? dragPosition : positionOf(size)
  const headline = dragging ? liveSizeAt(dragPosition) : size

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = KEY_MOVES[event.key]
    if (!move) return
    event.preventDefault()
    settle(move(size))
  }

  return (
    <div className="kt-slider-card">
      <div className="kt-slider-top">
        <p className="kt-slider-size">
          {/* Rolls on every change, including while it follows the handle */}
          <Odometer text={formatPounds(headline)} />
        </p>
        <p className="kt-slider-note">Example figures</p>
      </div>

      <div className="kt-slider">
        <div
          className="kt-track"
          ref={trackRef}
          {...handlers}
        >
          <span className="kt-track-rail" />
          <span className="kt-track-fill" style={{ width: `${position * 100}%` }} data-dragging={dragging ? "" : undefined} />
          <div
            className="kt-grip"
            ref={gripRef}
            role="slider"
            tabIndex={0}
            aria-label="Account size"
            aria-valuemin={ACCOUNT_SIZES[0]}
            aria-valuemax={ACCOUNT_SIZES[ACCOUNT_SIZES.length - 1]}
            aria-valuenow={size}
            aria-valuetext={formatPounds(size)}
            style={{ left: `${position * 100}%` }}
            data-dragging={dragging ? "" : undefined}
            data-snapped={snapped ? "" : undefined}
            onKeyDown={onKeyDown}
          >
            {dragging ? <span className="kt-grip-bubble">{formatShort(headline)}</span> : null}
            <span className="kt-grip-lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
        <div className="kt-ticks">
          {ACCOUNT_SIZES.map((option) => (
            <button
              key={option}
              type="button"
              className="kt-tick"
              aria-pressed={option === size}
              onClick={() => settle(option)}
            >
              {formatShort(option)}
            </button>
          ))}
        </div>
      </div>

      <div className="kt-figures">
        <div className="kt-figure kt-figure--early">
          <p className="kt-figure-label">Early-bird fee</p>
          <p className="kt-figure-row">
            <Odometer className="kt-figure-value" text={formatPounds(figures.earlyBird)} />
            <s className="kt-figure-was">{formatPounds(figures.fee)}</s>
          </p>
          <p className="kt-save">Save {formatPounds(figures.saving)}</p>
        </div>
        <Figure label="Profit target" value={figures.profitTarget} />
        <Figure label="Daily loss limit" value={figures.dailyLossLimit} />
        <Figure label="Drawdown floor" value={figures.drawdownFloor} />
      </div>

      <div className="kt-slider-foot">
        <p>Early-bird fee for priority registrants.</p>
        <ListCta className="kt-btn--gold" />
      </div>
    </div>
  )
}

function Figure({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="kt-figure">
      <p className="kt-figure-label">{label}</p>
      <Odometer className="kt-figure-value" text={formatPounds(value)} />
    </div>
  )
}
