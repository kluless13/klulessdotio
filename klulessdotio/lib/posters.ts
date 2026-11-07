import manifest from "@/lib/posters.manifest.json"

export type GroupId = "earnings" | "cesr" | "netflix" | "bigmac" | "quartr" | "perplexity" | "bobbin" | "prediction"

export interface Poster {
  slug: string
  group: string
  title: string
  w: number
  h: number
}

export interface PosterGroup {
  id: GroupId
  name: string
  text: string
  note?: string
}

// Captions for the official groups are drafts for Angad to approve at the preview.
export const GROUPS: readonly PosterGroup[] = [
  { id: "earnings", name: "Earnings", text: "Posters for NVDA, Meta and Tesla earnings." },
  { id: "cesr", name: "CESR index", text: "Posters for the Cumulative Ethereum Staking Rate markets on Truflation Predict." },
  { id: "netflix", name: "Netflix markets", text: "Posters for the Netflix Index market on Truflation Predict." },
  { id: "bigmac", name: "Big Mac index", text: "A poster for the Big Mac index." },
  { id: "quartr", name: "Quartr Design", note: "Practice and experiments", text: "Quartr does a great job of making an unsexy sector sexy, with designs that capture attention. Posters that make each earnings call seem museum or frame worthy." },
  { id: "perplexity", name: "Perplexity Inspiration", note: "Practice and experiments", text: "Inspired by Perplexity's design, where you convey the message with surreal backgrounds without talking about the product." },
  { id: "bobbin", name: "Bobbin", note: "Case study", text: "Made for my friend Jeff, the creator of Bobbin (bobbin.now), a Threads growth helper app. I use the app and in about 30 days amassed close to 200k views. He loved the designs I made for him." },
  { id: "prediction", name: "Prediction Platforms", note: "Older personal experiments, not official work.", text: "Posters made early on for platforms in the prediction space, building in or around the core incumbents." },
]

export const POSTERS: readonly Poster[] = manifest

export function groupOf(id: string): PosterGroup {
  return GROUPS.find((group) => group.id === id) ?? GROUPS[0]
}

export function firstIndexOfGroup(id: GroupId): number {
  return Math.max(0, POSTERS.findIndex((poster) => poster.group === id))
}

export function nextIndex(index: number, delta: number, length: number): number {
  return (index + delta + length) % length
}

const posterSrc = (poster: Poster): string => `/p/${poster.slug}.webp`
export const fullSrc = posterSrc
export const thumbSrc = (poster: Poster): string => `/p/${poster.slug}-t.webp`

/** Changes at midnight in India and is the same for every visitor that day. */
export function posterOfTheDay(date: Date): number {
  const day = Math.floor((date.getTime() + 5.5 * 3600 * 1000) / 864e5)
  // Stepping by a number that shares no factors with 102 visits every poster before repeating
  return (day * 37) % POSTERS.length
}
