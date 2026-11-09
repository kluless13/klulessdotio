import { ArrowLeft, ArrowRight } from "lucide-react"
import type { PostMeta, Series } from "@/lib/writing/types"

export interface SeriesPlace {
  series: Series
  part: number
  total: number
  previous?: PostMeta
  next?: PostMeta
}

function Progress({ part, total }: { part: number; total: number }) {
  return (
    <div className="series-progress">
      <div className="series-segments" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < part ? "seg seg-on" : "seg"} />
        ))}
      </div>
      <span>{`Part ${part} of ${total}`}</span>
    </div>
  )
}

function SeriesCard({ post, direction }: { post: PostMeta; direction: "Previous" | "Next" }) {
  const Arrow = direction === "Next" ? ArrowRight : ArrowLeft
  return (
    <a className={`series-card tile series-${direction.toLowerCase()}`} href={`/writing/${post.slug}`}>
      <span className="series-card-words">
        <span className="series-card-title">{`${direction}: ${post.title}`}</span>
        <span className="series-card-short">{post.short}</span>
      </span>
      <Arrow className="series-card-arrow" size={20} aria-hidden="true" />
    </a>
  )
}

/** The series name, a progress bar of N segments, and only the Previous and Next cards that exist. */
export function SeriesNav({ place }: { place: SeriesPlace }) {
  return (
    <nav className="series-nav" aria-label="Series">
      <div className="series-head">
        <span className="series-name">{place.series.title}</span>
        <Progress part={place.part} total={place.total} />
      </div>
      {place.previous || place.next ? (
        <div className="series-cards">
          {place.previous ? <SeriesCard post={place.previous} direction="Previous" /> : null}
          {place.next ? <SeriesCard post={place.next} direction="Next" /> : null}
        </div>
      ) : null}
    </nav>
  )
}
