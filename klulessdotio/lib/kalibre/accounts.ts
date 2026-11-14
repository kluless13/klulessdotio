/** Example account sizes and the figures the slider card shows for each. Example figures only. */

export const ACCOUNT_SIZES = [10_000, 25_000, 50_000, 100_000] as const
export type AccountSize = (typeof ACCOUNT_SIZES)[number]

export const DEFAULT_SIZE: AccountSize = 50_000

/** Target, daily limit and floor scale with the account: 8%, 4% and 92% of the starting balance */
const PROFIT_TARGET_RATE = 0.08
const DAILY_LOSS_RATE = 0.04
const FLOOR_RATE = 0.92

const FEES: Readonly<Record<AccountSize, { fee: number; earlyBird: number }>> = {
  10_000: { fee: 89, earlyBird: 71 },
  25_000: { fee: 179, earlyBird: 143 },
  50_000: { fee: 299, earlyBird: 239 },
  100_000: { fee: 499, earlyBird: 399 },
}

export interface AccountFigures {
  readonly size: AccountSize
  readonly fee: number
  readonly earlyBird: number
  readonly saving: number
  readonly profitTarget: number
  readonly dailyLossLimit: number
  readonly drawdownFloor: number
}

export function figuresFor(size: AccountSize): AccountFigures {
  const { fee, earlyBird } = FEES[size]
  return {
    size,
    fee,
    earlyBird,
    saving: fee - earlyBird,
    profitTarget: Math.round(size * PROFIT_TARGET_RATE),
    dailyLossLimit: Math.round(size * DAILY_LOSS_RATE),
    drawdownFloor: Math.round(size * FLOOR_RATE),
  }
}

const LAST_STOP = ACCOUNT_SIZES.length - 1

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/** The four sizes sit at equal steps along the track: 0, a third, two thirds and the end */
export function positionOf(size: AccountSize): number {
  return ACCOUNT_SIZES.indexOf(size) / LAST_STOP
}

/** The size the handle snaps to when let go at this point on the track */
export function nearestSize(position: number): AccountSize {
  return ACCOUNT_SIZES[Math.round(clamp01(position) * LAST_STOP)]
}

/** The live size shown above the handle while dragging, between the two nearest stops */
export function liveSizeAt(position: number): number {
  const scaled = clamp01(position) * LAST_STOP
  const lower = Math.floor(scaled)
  if (lower >= LAST_STOP) return ACCOUNT_SIZES[LAST_STOP]
  const from = ACCOUNT_SIZES[lower]
  const to = ACCOUNT_SIZES[lower + 1]
  return Math.round((from + (to - from) * (scaled - lower)) / 1000) * 1000
}

/** One step left or right for the arrow keys, kept inside the four sizes */
export function stepSize(size: AccountSize, step: -1 | 1): AccountSize {
  const index = Math.min(LAST_STOP, Math.max(0, ACCOUNT_SIZES.indexOf(size) + step))
  return ACCOUNT_SIZES[index]
}

const POUNDS = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })

export function formatPounds(value: number): string {
  return POUNDS.format(value)
}

/** £68k: the short form used on the slider labels and the drag bubble */
export function formatShort(value: number): string {
  return `£${Math.round(value / 1000)}k`
}
