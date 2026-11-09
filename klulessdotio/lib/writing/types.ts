export const CATEGORIES = ["AI and building", "Prediction markets", "Thinking"] as const
export type Category = (typeof CATEGORIES)[number]

export interface Series {
  id: string
  title: string
  description: string
  slugs: readonly string[]
  featured: boolean
}

export interface Download {
  id: string
  title: string
  description: string
  fileName: string
  sizeLabel?: string
}

export interface PostMeta {
  slug: string
  title: string
  description: string
  short: string
  date: string
  updated?: string
  category: Category
  series?: { id: string; part: number }
  download?: string
  related?: readonly string[]
  cover?: string
  words: number
  minutes: number
}

export interface Post extends PostMeta {
  body: string
}

export class PostError extends Error {
  file: string
  field: string
  constructor(file: string, field: string, message: string) {
    super(`${file}: ${field}: ${message}`)
    this.name = "PostError"
    this.file = file
    this.field = field
  }
}
