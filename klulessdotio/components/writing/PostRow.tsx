import { formatDate } from "@/lib/writing/format"
import type { PostMeta } from "@/lib/writing/types"

export function PartPill({ part, total }: { part: number; total: number }) {
  return <span className="pill">{`Part ${part} of ${total}`}</span>
}

export function PostRow({ post, seriesTotal }: { post: PostMeta; seriesTotal?: number }) {
  return (
    <a className="row-card tile" href={`/writing/${post.slug}`}>
      <div className="row-words">
        <h3 className="row-title">{post.title}</h3>
        <p className="row-short">{post.short}</p>
      </div>
      <div className="row-meta">
        {post.series && seriesTotal ? <PartPill part={post.series.part} total={seriesTotal} /> : null}
        <span className="row-when">
          <time dateTime={post.date}>{formatDate(post.date, "short")}</time>
          <span className="row-dot" aria-hidden="true">
            {" · "}
          </span>
          <span>{`${post.minutes} min read`}</span>
        </span>
      </div>
    </a>
  )
}
