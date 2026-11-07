export type ContributionsResponse = { success: true; data: { weeks: number[][] } } | { success: false; error: string }

const CONTRIBUTIONS_URL = "https://github.com/users/kluless13/contributions"
export const CONTRIBUTIONS_CACHE_SECONDS = 21600
const UNAVAILABLE: ContributionsResponse = { success: false, error: "Contributions unavailable" }

/** GitHub's public contribution page lists one cell per day, with a level from 0 to 4. */
export function parseContributions(html: string): number[][] {
  const days = Array.from(html.matchAll(/<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="([0-4])"[^>]*>/g))
    .map((match) => ({ date: match[1], level: Number(match[2]) }))
    .sort((a, b) => a.date.localeCompare(b.date))
  return days.reduce<number[][]>((weeks, day) => {
    const isSunday = new Date(`${day.date}T00:00:00Z`).getUTCDay() === 0
    if (isSunday || weeks.length === 0) return [...weeks, [day.level]]
    return [...weeks.slice(0, -1), [...weeks[weeks.length - 1], day.level]]
  }, [])
}

export async function loadContributions(): Promise<ContributionsResponse> {
  try {
    const response = await fetch(CONTRIBUTIONS_URL, { headers: { "User-Agent": "1tx.dev" }, next: { revalidate: CONTRIBUTIONS_CACHE_SECONDS } })
    if (!response.ok) return UNAVAILABLE
    const weeks = parseContributions(await response.text())
    return weeks.length > 0 ? { success: true, data: { weeks } } : UNAVAILABLE
  } catch (error) {
    console.error("Contributions request failed", error)
    return UNAVAILABLE
  }
}
