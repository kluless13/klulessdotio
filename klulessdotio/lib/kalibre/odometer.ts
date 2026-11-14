/** How a figure rolls from one value to the next, digit by digit, like an odometer. */

export const DIGIT_STAGGER_MS = 40

export type RollDirection = "up" | "down" | "none"

export interface RollColumn {
  /** Stable key: the column's place counted from the right */
  readonly key: string
  readonly char: string
  readonly isDigit: boolean
  /** Ones move first, then tens, hundreds and so on */
  readonly delayMs: number
}

const isDigit = (char: string): boolean => char >= "0" && char <= "9"

export function rollDirection(from: number, to: number): RollDirection {
  if (to > from) return "up"
  if (to < from) return "down"
  return "none"
}

/** Splits a formatted figure into columns, keyed from the right so digits keep their place as the length changes */
export function rollColumns(text: string): readonly RollColumn[] {
  const chars = Array.from(text)
  const digitRanks = chars.reduceRight<number[]>((ranks, char, index) => {
    const next = [...ranks]
    next[index] = isDigit(char) ? ranks.filter((rank) => rank >= 0).length : -1
    return next
  }, [])
  return chars.map((char, index) => {
    const fromRight = chars.length - 1 - index
    const rank = digitRanks[index]
    return {
      key: `c${fromRight}`,
      char,
      isDigit: isDigit(char),
      delayMs: rank >= 0 ? rank * DIGIT_STAGGER_MS : 0,
    }
  })
}
