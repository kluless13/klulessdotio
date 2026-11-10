/**
 * Hand-drawn marks for the starter kit, ported from the Paper builder (kit_ink.py).
 * Every mark is seeded, so the same words always get the same stroke, and no two lines come out alike.
 */
import { hashSeed } from "./inline"

type Point = readonly [number, number]

/** The ragged ends may spill past the words by at most this much. */
const SPILL = 4

/** mulberry32 over a hashed seed: small, fast and the same on server and client. */
function random(seed: string): (min: number, max: number) => number {
  let state = parseInt(hashSeed(seed), 36) >>> 0
  return (min, max) => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296
    return min + (max - min) * unit
  }
}

const num = (value: number) => (Math.round(value * 10) / 10).toFixed(1)

function pointText([x, y]: Point, maxX: number): string {
  return `${num(Math.min(maxX, Math.max(-SPILL, x)))} ${num(y)}`
}

/** One Catmull-Rom segment from p1 to p2 as a cubic curve. */
function curve(p0: Point, p1: Point, p2: Point, p3: Point, maxX: number): string {
  const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
  const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
  return ` C${pointText(c1, maxX)} ${pointText(c2, maxX)} ${pointText(p2, maxX)}`
}

function smoothClosed(points: readonly Point[], maxX: number): string {
  const n = points.length
  const at = (i: number) => points[(i + n) % n]
  const segments = points.map((_, i) => curve(at(i - 1), at(i), at(i + 1), at(i + 2), maxX))
  return `M${pointText(points[0], maxX)}${segments.join("")} Z`
}

function smoothOpen(points: readonly Point[], maxX = Number.POSITIVE_INFINITY): string {
  const last = points.length - 1
  const at = (i: number) => points[Math.min(last, Math.max(0, i))]
  const segments = points.slice(0, last).map((_, i) => curve(at(i - 1), at(i), at(i + 1), at(i + 2), maxX))
  return `M${pointText(points[0], maxX)}${segments.join("")}`
}

export interface HighlightStroke {
  /** The filled body: wobbly top and bottom edges, chisel-cut ends. */
  body: string
  /** A faint darker streak along the bottom, where the ink pools. */
  streak: string
  /** A small per-line change in opacity, within ±0.06. */
  jitter: number
}

/**
 * One highlighter pass over a line of words `width` wide, in a box `height` tall (y = 0 at the top).
 * The height, tilt, wobble and ends vary with `seed` and `line`.
 */
export function highlightStroke(seed: string, width: number, height: number, line: number): HighlightStroke {
  const u = random(`${seed}|${line}`)
  const maxX = width + SPILL
  const steps = Math.max(3, Math.floor(width / 26))
  const yc = height / 2
  const drift = u(-1.6, 1.6)
  const half = (height / 2) * u(0.94, 1.04)
  const slant = u(2, 3.5)

  const top: Point[] = []
  const bottom: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const f = i / steps
    const x = width * f + (i > 0 && i < steps ? u(-2, 2) : 0)
    const mid = yc + drift * f + Math.sin(f * Math.PI * u(0.8, 1.6)) * 0.6
    top.push([x, mid - half + u(-1, 1)])
    bottom.push([x, mid + half * u(0.9, 1.05) + u(-0.8, 0.8)])
  }

  const endMid = yc + drift
  const right: Point[] = [
    [width + u(0.5, 2), endMid - half * 0.55],
    [width + u(2.5, 3.5), endMid + u(-1.5, 1.5)],
    [width + u(0, 2), endMid + half * 0.6],
  ]
  const left: Point[] = [
    [-slant + u(-0.5, 0.5), yc + half * 0.7],
    [-slant * 0.6 + u(-1, 0), yc + u(-1, 1)],
    [u(-1, 1.5), yc - half * 0.75],
  ]
  const body = smoothClosed([...top, ...right, ...[...bottom].reverse(), ...left], maxX)

  const streakPoints: Point[] = Array.from({ length: 7 }, (_, i) => [
    4 + (Math.max(0, width - 10) * i) / 6,
    yc + half * 0.62 + u(-0.7, 0.7) + (drift * i) / 6,
  ])
  const streak = smoothOpen(streakPoints, maxX)
  const jitter = random(`${seed}|${line}|opacity`)(-0.06, 0.06)
  return { body, streak, jitter }
}

/** The SVG path `d` for one highlight stroke (its filled body). */
export function highlightPath(seed: string, width: number, height: number, line: number): string {
  return highlightStroke(seed, width, height, line).body
}

/** A quick pen underline under words `width` wide: a slight sag and a lift at the end. Its baseline sits at y = 4. */
export function underlinePath(seed: string, width: number): string {
  const u = random(`${seed}|underline`)
  const y = 4
  const points: Point[] = Array.from({ length: 7 }, (_, i) => {
    const f = i / 6
    return [-3 + (width + 8) * f, y + Math.sin(f * Math.PI) * u(0.8, 1.8) + u(-0.5, 0.5) - f * u(0.5, 1.5)]
  })
  return smoothOpen([...points, [width + 9, y - u(2.5, 4)]])
}
