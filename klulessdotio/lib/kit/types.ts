export type Inline = string // sanitised HTML for one paragraph's inline content
export interface Note {
  on: string
  text: string
}

export interface EndingCard {
  title: string
  html: Inline
  cta?: { label: string; href: string }
}

export type KitBlock =
  | { type: "heading"; level: 2 | 3; text: string; step?: number }
  | { type: "paragraph"; html: Inline; notes: readonly Note[] }
  | { type: "list"; ordered: boolean; items: readonly Inline[]; notes: readonly Note[] }
  | { type: "steps"; items: readonly string[] }
  | { type: "paths"; paths: readonly { name: string; pick: boolean; html: Inline }[] }
  | { type: "timeline"; find: number; decide: number; fix: number; html: Inline }
  | { type: "beforeAfter"; before: Inline; after: readonly { label: string; quote: string }[] }
  | { type: "prompt"; text: string }
  | { type: "job"; title: string; who: string; before: Inline; request: string; connect: Inline }
  | {
      type: "ending"
      intro: readonly Inline[]
      timeline: readonly Inline[]
      cards: readonly EndingCard[]
      outro: readonly Inline[]
    }

export interface KitDoc {
  title: string
  blocks: readonly KitBlock[]
}
