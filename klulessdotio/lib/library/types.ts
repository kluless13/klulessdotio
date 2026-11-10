export type Era =
  | "Weighted"
  | "Retro desktops"
  | "Web 2.0 and early iPhone"
  | "Flat and Material"
  | "Modern"
  | "Soft and glass"
  | "Mine"

export interface Weight {
  name: string
  value: number
}

export interface FontItem {
  kind: "font"
  slug: string
  name: string
  category: "Sans serif" | "Serif"
  by: string
  note: string
  weights: readonly Weight[]
  link: string
  systemNote?: string
}

export interface SiteLink {
  label: string
  href: string
}

export interface ButtonItem {
  kind: "button"
  slug: string
  name: string
  era: Era
  source: string
  note: string
  how: readonly string[]
  css: string
  link?: SiteLink
}

export type LibraryItem = FontItem | ButtonItem
export type Filter = "all" | "type" | "buttons"

export interface Section {
  title: string
  items: readonly LibraryItem[]
}
