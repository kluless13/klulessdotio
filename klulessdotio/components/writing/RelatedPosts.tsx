import { formatDate } from "@/lib/writing/format"
import type { PostMeta } from "@/lib/writing/types"

export function RelatedPosts({ posts }: { posts: readonly PostMeta[] }) {
  if (posts.length === 0) return null
  return (
    <section className="related" aria-labelledby="related-title">
      <h2 className="related-title" id="related-title">
        Related
      </h2>
      <div className="related-cards">
        {posts.map((post) => (
          <a key={post.slug} className="related-card tile" href={`/writing/${post.slug}`}>
            <span className="related-card-title">{post.title}</span>
            <span className="related-card-short">{post.short}</span>
            <span className="related-card-meta">
              <time dateTime={post.date}>{formatDate(post.date, "short")}</time>
              {` · ${post.minutes} min read`}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
