import { NextResponse } from "next/server"

const REPO_OWNER = "kluless13"
const REPO_NAME = "localcommit"
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits`

const BG_COLOR = "#0d1117"
const TEXT_COLOR = "#8b949e"
const LEVELS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
const CELL_SIZE = 11
const CELL_GAP = 3
const CELL_RADIUS = 2
const LABEL_WIDTH = 30
const TOP_MARGIN = 25
const LEFT_MARGIN = 10

interface CommitResponse {
  commit: {
    author: {
      date: string
    }
  }
}

async function fetchAllCommitDates(): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  let page = 1
  const perPage = 100

  // Fetch up to 20 pages (2000 commits max)
  while (page <= 20) {
    const url = `${GITHUB_API}?per_page=${perPage}&page=${page}`
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "gitmap-heatmap",
    }

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
    }

    const res = await fetch(url, { headers, next: { revalidate: 3600 } })
    if (!res.ok) break

    const commits: CommitResponse[] = await res.json()
    if (commits.length === 0) break

    for (const c of commits) {
      const day = c.commit.author.date.slice(0, 10)
      counts.set(day, (counts.get(day) ?? 0) + 1)
    }

    if (commits.length < perPage) break
    page++
  }

  return counts
}

function buildGrid(counts: Map<string, number>, endDate: Date) {
  const weeks: Array<Array<[Date, number]>> = []
  const start = new Date(endDate)
  start.setDate(start.getDate() - 364)
  // Align to Sunday
  const dayOfWeek = start.getDay()
  start.setDate(start.getDate() - dayOfWeek)

  const current = new Date(start)
  while (current <= endDate) {
    const week: Array<[Date, number]> = []
    for (let dow = 0; dow < 7; dow++) {
      const d = new Date(current)
      d.setDate(d.getDate() + dow)
      if (d <= endDate) {
        const key = d.toISOString().slice(0, 10)
        week.push([d, counts.get(key) ?? 0])
      } else {
        week.push([d, -1])
      }
    }
    weeks.push(week)
    current.setDate(current.getDate() + 7)
  }

  return weeks
}

function levelForValue(value: number, maxVal: number): number {
  if (value <= 0) return 0
  const ratio = value / maxVal
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

function formatDate(d: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`
}

function monthLabel(d: Date): string {
  const months = [
    "Mar", "Apr", "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec", "Jan", "Feb",
  ]
  return months[d.getMonth()]
    ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]
    : ""
}

function generateSvg(
  weeks: Array<Array<[Date, number]>>,
  maxVal: number,
): string {
  const width =
    LEFT_MARGIN + LABEL_WIDTH + weeks.length * (CELL_SIZE + CELL_GAP) + 20
  const height = TOP_MARGIN + 7 * (CELL_SIZE + CELL_GAP) + 30

  const monthLabels: Array<[number, string]> = []
  let lastMonth = -1
  for (let i = 0; i < weeks.length; i++) {
    for (const [d] of weeks[i]) {
      if (d.getMonth() !== lastMonth && d.getDate() <= 7) {
        const x = LEFT_MARGIN + LABEL_WIDTH + i * (CELL_SIZE + CELL_GAP)
        monthLabels.push([x, monthLabel(d)])
        lastMonth = d.getMonth()
        break
      }
    }
  }

  let totalCommits = 0
  let activeDays = 0
  for (const week of weeks) {
    for (const [, count] of week) {
      if (count > 0) {
        totalCommits += count
        activeDays++
      }
    }
  }

  const lines: string[] = []
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  )
  lines.push(
    `  <rect width="${width}" height="${height}" rx="6" fill="${BG_COLOR}"/>`,
  )

  for (const [x, label] of monthLabels) {
    lines.push(
      `  <text x="${x}" y="${TOP_MARGIN - 8}" fill="${TEXT_COLOR}" font-size="10" font-family="monospace">${label}</text>`,
    )
  }

  for (const [row, label] of [
    [0, "Mon"],
    [2, "Wed"],
    [4, "Fri"],
  ] as const) {
    const y = TOP_MARGIN + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 1
    lines.push(
      `  <text x="${LEFT_MARGIN}" y="${y}" fill="${TEXT_COLOR}" font-size="9" font-family="monospace">${label}</text>`,
    )
  }

  for (let col = 0; col < weeks.length; col++) {
    for (let row = 0; row < weeks[col].length; row++) {
      const [d, count] = weeks[col][row]
      const x = LEFT_MARGIN + LABEL_WIDTH + col * (CELL_SIZE + CELL_GAP)
      const y = TOP_MARGIN + row * (CELL_SIZE + CELL_GAP)
      if (count < 0) continue
      const level = levelForValue(count, maxVal)
      const color = LEVELS[level]
      const tooltip =
        count > 0
          ? `${formatDate(d)}: ${count} commits`
          : `${formatDate(d)}: No commits`
      lines.push(
        `  <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" fill="${color}">`,
      )
      lines.push(`    <title>${tooltip}</title>`)
      lines.push(`  </rect>`)
    }
  }

  const legendY = TOP_MARGIN + 7 * (CELL_SIZE + CELL_GAP) + 8
  const legendX = LEFT_MARGIN + LABEL_WIDTH
  lines.push(
    `  <text x="${legendX}" y="${legendY + 9}" fill="${TEXT_COLOR}" font-size="10" font-family="monospace">${totalCommits} local commits | ${activeDays} active days</text>`,
  )

  const lx = width - 120
  lines.push(
    `  <text x="${lx - 30}" y="${legendY + 9}" fill="${TEXT_COLOR}" font-size="9" font-family="monospace">Less</text>`,
  )
  for (let i = 0; i < LEVELS.length; i++) {
    lines.push(
      `  <rect x="${lx + i * (CELL_SIZE + 2)}" y="${legendY}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" fill="${LEVELS[i]}"/>`,
    )
  }
  lines.push(
    `  <text x="${lx + 5 * (CELL_SIZE + 2) + 2}" y="${legendY + 9}" fill="${TEXT_COLOR}" font-size="9" font-family="monospace">More</text>`,
  )

  lines.push("</svg>")
  return lines.join("\n")
}

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const counts = await fetchAllCommitDates()
    const endDate = new Date()
    const weeks = buildGrid(counts, endDate)
    const allCounts = weeks
      .flat()
      .map(([, c]) => c)
      .filter((c) => c > 0)
    const maxVal = allCounts.length > 0 ? Math.max(...allCounts) : 1

    const svg = generateSvg(weeks, maxVal)

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to generate heatmap" },
      { status: 500 },
    )
  }
}
