"use client"

import { useEffect, useState } from "react"
import type { ContributionsResponse } from "@/lib/contributions"

const LEVEL_OPACITY = [0.1, 0.28, 0.48, 0.72, 1]

/** Drawn from real GitHub data in a see-through tint of the text colour. If the data can't load, the section stays out of the way. */
export function Activity() {
  const [weeks, setWeeks] = useState<number[][] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/contributions", { signal: controller.signal })
      .then((response) => response.json() as Promise<ContributionsResponse>)
      .then((body) => setWeeks(body.success ? body.data.weeks : []))
      .catch(() => setWeeks([]))
    return () => controller.abort()
  }, [])

  if (weeks !== null && weeks.length === 0) return null
  return (
    <section className="block" aria-labelledby="up-to">
      <h2 className="label" id="up-to">What I've been up to</h2>
      <div className="activity" role="img" aria-label="Angad's GitHub contributions over the last year">
        {(weeks ?? []).map((week, column) => (
          <div className="week" key={column}>
            {week.map((level, day) => (
              <i key={day} style={{ opacity: LEVEL_OPACITY[level] }} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
