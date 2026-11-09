import { ShareButton } from "@/components/writing/ShareButton"
import { SITE_URL } from "@/lib/writing/feeds"
import { formatDate } from "@/lib/writing/format"
import type { PostMeta } from "@/lib/writing/types"

export function PostHead({ post, part }: { post: PostMeta; part?: { part: number; total: number } }) {
  const date = formatDate(post.date, "long")
  const where = part ? `${post.category} · Part ${part.part} of ${part.total}` : post.category
  return (
    <header className="post-head">
      <h1 className="post-title">{post.title}</h1>
      <div className="post-meta-row">
        <p className="post-meta">
          <span>
            <time dateTime={post.date}>{date}</time>
            {` · ${post.minutes} min read`}
          </span>
          <span className="post-meta-dot" aria-hidden="true">
            {" · "}
          </span>
          <span>{where}</span>
        </p>
        <ShareButton title={post.title} url={`${SITE_URL}/writing/${post.slug}`} />
      </div>
    </header>
  )
}
