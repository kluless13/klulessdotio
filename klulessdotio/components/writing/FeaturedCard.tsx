import { ArrowRight } from "lucide-react"
import type { PostMeta, Series } from "@/lib/writing/types"

export interface Featured {
  series: Series
  posts: readonly PostMeta[]
  minutes: number
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export function FeaturedCard({ featured, thumb }: { featured: Featured; thumb?: string }) {
  const first = featured.posts[0]
  const part = first.series?.part ?? 1
  return (
    <section className="featured tile" aria-labelledby="featured-title">
      <div className="featured-words">
        <h2 className="featured-title" id="featured-title">
          {featured.series.title}
        </h2>
        <p className="featured-line">{featured.series.description}</p>
        <div className="featured-action">
          <a className="btn" href={`/writing/${first.slug}`}>
            {`Start with part ${part}`} <ArrowRight size={15} aria-hidden="true" />
          </a>
          <span className="featured-count">
            {`${plural(featured.posts.length, "post")}, about ${plural(featured.minutes, "minute")}`}
          </span>
        </div>
      </div>
      {thumb ? <img className="featured-thumb" src={thumb} alt="" width={264} height={220} /> : null}
    </section>
  )
}
