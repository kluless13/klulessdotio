/** The drawdown chart: one £50,000 account over 32 days, drawn in a 760 by 360 box. */

export const CHART_WIDTH = 760
export const CHART_HEIGHT = 360

/** The static floor sits at the starting £46,000 for the whole run */
export const STATIC_FLOOR_Y = 316.7

/** The trailing floor climbs with each new high, then holds where the account peaked */
export const TRAILING_FLOOR_PATH =
  "M0 316.7 L11.9 316.7 L35.6 294.8 L59.4 294.8 L83.1 278.4 L106.9 259.3 L130.6 259.3 L154.4 245.6 L178.1 223.7 L201.9 223.7 L225.6 210.1 L249.4 190.9 L273.1 190.9 L296.9 177.3 L320.6 163.6 L344.4 163.6 L368.1 158.1 L760 158.1"

export interface Candle {
  readonly x: number
  readonly high: number
  readonly low: number
  readonly bodyTop: number
  readonly bodyHeight: number
  readonly up: boolean
}

type Row = readonly [x: number, high: number, low: number, bodyTop: number, bodyHeight: number, up: 0 | 1]

const ROWS: readonly Row[] = [
  [11.9, 193.5, 227.0, 207.3, 3, 1],
  [35.6, 172.4, 221.9, 185.5, 22.1, 1],
  [59.4, 174.8, 214.1, 187.9, 11.2, 0],
  [83.1, 162.2, 206.7, 169.1, 27.6, 1],
  [106.9, 132.3, 188.2, 149.9, 22.4, 1],
  [130.6, 133.5, 186.3, 153.8, 12.5, 0],
  [154.4, 121.5, 172.8, 136.3, 28.7, 1],
  [178.1, 101.0, 146.7, 114.4, 26.0, 1],
  [201.9, 107.8, 136.7, 116.9, 13.9, 0],
  [225.6, 88.6, 149.2, 100.7, 30.4, 1],
  [249.4, 66.5, 113.4, 81.6, 18.9, 1],
  [273.1, 67.9, 107.6, 80.2, 17.8, 0],
  [296.9, 47.5, 112.0, 67.9, 26.0, 1],
  [320.6, 44.1, 75.2, 54.3, 12.0, 1],
  [344.4, 49.4, 90.4, 55.9, 17.5, 0],
  [368.1, 30.6, 85.5, 48.8, 25.4, 1],
  [391.9, 26.8, 70.7, 45.0, 20.2, 0],
  [415.6, 48.5, 107.8, 67.7, 27.6, 0],
  [439.4, 80.0, 131.9, 91.4, 33.9, 0],
  [463.1, 107.1, 167.7, 124.2, 33.9, 0],
  [486.9, 134.0, 181.4, 144.5, 16.9, 1],
  [510.6, 135.0, 191.9, 142.3, 40.4, 0],
  [534.4, 179.6, 235.7, 186.0, 32.3, 0],
  [558.1, 207.1, 263.3, 221.0, 30.1, 0],
  [581.9, 218.2, 261.0, 234.7, 18.8, 1],
  [605.6, 226.4, 284.7, 233.6, 39.3, 0],
  [629.4, 255.2, 295.5, 264.7, 10.7, 1],
  [653.1, 230.1, 281.0, 240.1, 22.2, 1],
  [676.9, 231.2, 272.1, 242.6, 11.2, 0],
  [700.6, 216.8, 273.0, 223.7, 29.0, 1],
  [724.4, 195.3, 243.3, 204.6, 21.6, 1],
  [748.1, 181.0, 212.5, 190.9, 15.1, 1],
]

export const CANDLES: readonly Candle[] = ROWS.map(([x, high, low, bodyTop, bodyHeight, up]) => ({
  x,
  high,
  low,
  bodyTop,
  bodyHeight,
  up: up === 1,
}))

export const CANDLE_WIDTH = 14.7

/** The candle where the balance first dips through the trailing floor */
export const BREACH_INDEX = CANDLES.findIndex((candle) => candle.low >= 158.1 && candle.x > 368.1)

export const BREACH_POINT = { x: CANDLES[BREACH_INDEX].x, y: 158.1 } as const

export type FloorMode = "static" | "trailing"

export interface FloorStats {
  readonly floor: number
  readonly floorNote: string
  readonly room: number
  /** The other floor's room, shown struck through for comparison */
  readonly otherRoom: number | null
  readonly roomNote: string
}

/** The two figures beside the chart for each floor */
export function floorStats(mode: FloorMode): FloorStats {
  return mode === "static"
    ? {
        floor: 46_000,
        floorNote: "Your floor on a £50,000 account, fixed",
        room: 8_000,
        otherRoom: 4_000,
        roomNote: "Room to trade once you grow to £54,000",
      }
    : {
        floor: 51_800,
        floorNote: "A trailing floor, after it has risen",
        room: 4_000,
        otherRoom: null,
        roomNote: "Room to trade at £54,000 with a trailing floor",
      }
}
