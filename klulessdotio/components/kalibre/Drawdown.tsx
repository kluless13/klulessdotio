"use client"

import { useState, type KeyboardEvent } from "react"
import { formatPounds } from "@/lib/kalibre/accounts"
import {
  BREACH_INDEX,
  BREACH_POINT,
  CANDLES,
  CANDLE_WIDTH,
  CHART_HEIGHT,
  CHART_WIDTH,
  STATIC_FLOOR_Y,
  TRAILING_FLOOR_PATH,
  floorStats,
  type FloorMode,
} from "@/lib/kalibre/chart"
import { Odometer } from "./Odometer"

const MODES: readonly { mode: FloorMode; label: string }[] = [
  { mode: "static", label: "Static floor" },
  { mode: "trailing", label: "Trailing floor" },
]

/** The drawdown section: the copy and figures on one side, the chart with its floor toggle on the other */
export function Drawdown() {
  const [mode, setMode] = useState<FloorMode>("static")
  const stats = floorStats(mode)
  const trailing = mode === "trailing"

  return (
    <section className="kt-section kt-drawdown" id="drawdown" aria-labelledby="kt-drawdown-title" data-mode={mode}>
      <div className="kt-drawdown-copy">
        <h2 className="kt-h2" id="kt-drawdown-title">
          Your floor never moves
        </h2>
        <p className="kt-lead">
          A trailing floor rises as you profit, so one normal dip can end an evaluation. Ours is set once and stays put.
        </p>
        <div className="kt-floor-stats">
          <div className="kt-floor-stat">
            <Odometer className="kt-floor-value" text={formatPounds(stats.floor)} />
            <p>{stats.floorNote}</p>
          </div>
          <div className="kt-floor-stat">
            <p className="kt-floor-row">
              <Odometer className="kt-floor-value" text={formatPounds(stats.room)} />
              {stats.otherRoom !== null ? <s className="kt-floor-was">{formatPounds(stats.otherRoom)}</s> : null}
            </p>
            <p>{stats.roomNote}</p>
          </div>
        </div>
      </div>

      <div className="kt-chart-card">
        <div className="kt-chart-head">
          <FloorToggle mode={mode} onChange={setMode} />
          <p className="kt-chart-caption">£50,000 account, 32 days</p>
        </div>

        <div className="kt-chart">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={trailing ? "With a trailing floor, the dip after the peak ends the evaluation." : "With the static floor, the same dip leaves the account well above its floor."}>
            <path className="kt-line-static" d={`M0 ${STATIC_FLOOR_Y} L${CHART_WIDTH} ${STATIC_FLOOR_Y}`} />
            <path key={mode} className="kt-line-trailing" d={TRAILING_FLOOR_PATH} />
            {CANDLES.map((candle, index) => {
              const after = index > BREACH_INDEX
              return (
                <g
                  key={candle.x}
                  className={`kt-candle ${candle.up ? "kt-candle--up" : "kt-candle--down"}`}
                  data-after={after ? "" : undefined}
                  style={{ transitionDelay: trailing && after ? `${(index - BREACH_INDEX) * 18}ms` : "0ms" }}
                >
                  <path d={`M${candle.x} ${candle.high} L${candle.x} ${candle.low}`} strokeWidth="1.6" strokeLinecap="round" />
                  <rect x={candle.x - CANDLE_WIDTH / 2} y={candle.bodyTop} width={CANDLE_WIDTH} height={candle.bodyHeight} rx="2" />
                </g>
              )
            })}
          </svg>
          <span
            key={`dot-${mode}`}
            className="kt-breach"
            style={{ left: `${(BREACH_POINT.x / CHART_WIDTH) * 100}%`, top: `${(BREACH_POINT.y / CHART_HEIGHT) * 100}%` }}
            aria-hidden="true"
          />
        </div>

        <p className="kt-chart-legend">A trailing floor ends the evaluation here</p>
      </div>
    </section>
  )
}

const ARROWS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]

/** Static or trailing floor: a two-option radio group, with the navy pill sliding between them */
function FloorToggle({ mode, onChange }: { readonly mode: FloorMode; readonly onChange: (mode: FloorMode) => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!ARROWS.includes(event.key)) return
    event.preventDefault()
    const next: FloorMode = mode === "static" ? "trailing" : "static"
    onChange(next)
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-kind="${next}"]`)?.focus()
  }

  return (
    <div className="kt-toggle" role="radiogroup" aria-label="Floor type">
      <span className="kt-toggle-pill" aria-hidden="true" />
      {MODES.map((option) => (
        <button
          key={option.mode}
          type="button"
          role="radio"
          aria-checked={mode === option.mode}
          className="kt-toggle-btn"
          data-kind={option.mode}
          tabIndex={mode === option.mode ? 0 : -1}
          onClick={() => onChange(option.mode)}
          onKeyDown={onKeyDown}
        >
          <span className="kt-toggle-swatch" aria-hidden="true" />
          {option.label}
        </button>
      ))}
    </div>
  )
}
