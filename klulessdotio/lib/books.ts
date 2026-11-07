export const SPINE_FONTS = {
  serif: 'var(--font-newsreader), Georgia, serif',
  tall: 'var(--font-oswald), "Arial Narrow", sans-serif',
  heavy: 'var(--font-archivo-black), Impact, sans-serif',
  sans: "var(--font-instrument), sans-serif",
} as const

export interface Book {
  slug: string
  title: string
  author: string
  short: string
  w: number
  h: number
  bg: string
  ink: string
  accent: string
  authorInk?: string
  type: string
  size: number
  band: number
  low: number
  weight?: number
  case?: "uppercase"
  track?: string
}

const { serif, tall, heavy, sans } = SPINE_FONTS

// Titles come from the Books Index in Angad's notes. Each spine is designed from the book's real cover. Edit this list to change the shelf.
export const BOOKS: readonly Book[] = [
  { slug: "a-man-for-all-markets", title: "A Man for All Markets", author: "Edward O. Thorp", short: "THORP", w: 46, h: 272, bg: "#1f1d1c", ink: "#f4efe6", accent: "#6d6a66", type: serif, size: 15, band: 8, low: 0, weight: 500 },
  { slug: "superforecasting", title: "Superforecasting", author: "Philip E. Tetlock", short: "TETLOCK", w: 40, h: 250, bg: "#0b0b0b", ink: "#ffffff", accent: "#b98a3e", authorInk: "#c79a4c", type: tall, size: 18, band: 16, low: 0, case: "uppercase", track: ".02em" },
  { slug: "antifragile", title: "Antifragile", author: "Nassim Nicholas Taleb", short: "TALEB", w: 58, h: 288, bg: "#f5f3ee", ink: "#b3322a", accent: "#b3322a", authorInk: "#1a1a1a", type: heavy, size: 22, band: 6, low: 6, weight: 400 },
  { slug: "fooled-by-randomness", title: "Fooled by Randomness", author: "Nassim Nicholas Taleb", short: "TALEB", w: 38, h: 256, bg: "#2c2f8f", ink: "#e9c766", accent: "#e9c766", type: serif, size: 15, band: 4, low: 4, weight: 600 },
  { slug: "the-signal-and-the-noise", title: "The Signal and the Noise", author: "Nate Silver", short: "SILVER", w: 50, h: 278, bg: "#f7e803", ink: "#111111", accent: "#111111", type: sans, size: 17, band: 0, low: 0, weight: 600 },
  { slug: "zero-to-one", title: "Zero to One", author: "Peter Thiel", short: "THIEL", w: 30, h: 240, bg: "#5f8fb6", ink: "#ffffff", accent: "#ffffff", type: serif, size: 16, band: 0, low: 0, weight: 500 },
  { slug: "the-hard-thing", title: "The Hard Thing About Hard Things", author: "Ben Horowitz", short: "HOROWITZ", w: 44, h: 280, bg: "#0e0a0a", ink: "#f0612a", accent: "#f0612a", authorInk: "#f4efe6", type: tall, size: 16, band: 0, low: 5, case: "uppercase", track: ".01em" },
  { slug: "thinking-fast-and-slow", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", short: "KAHNEMAN", w: 54, h: 268, bg: "#fbf8f0", ink: "#141414", accent: "#eab92c", type: serif, size: 17, band: 10, low: 0, weight: 500 },
  { slug: "market-wizards", title: "Market Wizards", author: "Jack D. Schwager", short: "SCHWAGER", w: 42, h: 260, bg: "#14665f", ink: "#ffffff", accent: "#f2ead8", type: serif, size: 18, band: 12, low: 12, weight: 600, case: "uppercase" },
  { slug: "reminiscences", title: "Reminiscences of a Stock Operator", author: "Edwin Lefèvre", short: "LEFÈVRE", w: 36, h: 284, bg: "#efe6d0", ink: "#7c5a1e", accent: "#17140f", authorInk: "#17140f", type: tall, size: 14, band: 26, low: 0 },
  { slug: "the-mom-test", title: "The Mom Test", author: "Rob Fitzpatrick", short: "FITZPATRICK", w: 26, h: 228, bg: "#de1a6b", ink: "#ffffff", accent: "#ffffff", type: heavy, size: 13, band: 0, low: 0, weight: 400 },
]

/** Books keep their proportions on desktop. On phones they get thinner but stay tall enough for their titles. */
export function fitBook(book: Book, wide: boolean): Book {
  if (wide) return book
  return {
    ...book,
    w: Math.round(book.w * 0.66),
    h: Math.round(book.h * 0.82),
    size: Math.max(10, Math.round(book.size * 0.7)),
    band: Math.round(book.band * 0.7),
    low: Math.round(book.low * 0.7),
  }
}
