const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function formatDate(iso: string, style: "long" | "short"): string {
  const d = new Date(`${iso}T00:00:00Z`)
  const month = MONTHS[d.getUTCMonth()]
  const name = style === "long" ? month : month.slice(0, 3)
  return `${d.getUTCDate()} ${name} ${d.getUTCFullYear()}`
}

export function readingMinutes(markdown: string): { words: number; minutes: number } {
  const words = markdown.split(/\s+/).filter(Boolean).length
  return { words, minutes: Math.max(1, Math.round(words / 230)) }
}
