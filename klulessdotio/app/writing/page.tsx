import fs from "node:fs"
import path from "node:path"
import type { Metadata } from "next"
import { CategoryFilter } from "@/components/writing/CategoryFilter"
import { FeaturedCard, type Featured } from "@/components/writing/FeaturedCard"
import { JsonLd } from "@/components/writing/JsonLd"
import { PostRow } from "@/components/writing/PostRow"
import { WritingShell } from "@/components/writing/WritingShell"
import { SERIES } from "@/content/series"
import { SITE_URL } from "@/lib/writing/feeds"
import { featuredSeries, groupByCategory, loadPosts } from "@/lib/writing/posts"
import { RSS_ALTERNATE, breadcrumbJsonLd, pageMetadata } from "@/lib/writing/seo"
import "./writing.css"
import "./index.css"
import "./featured.css"
import "./rows.css"

const base = pageMetadata("/writing", "Writing · Angad Maniyambath", "Things I looked into, and what I found.")
export const metadata: Metadata = { ...base, alternates: { ...base.alternates, types: RSS_ALTERNATE } }

const CRUMBS = breadcrumbJsonLd([
  { name: "Home", url: SITE_URL },
  { name: "Writing", url: `${SITE_URL}/writing` },
])

/** The series' first chart, when part 1 names a cover that's actually in public/. */
function thumbFor(featured: Featured | null): string | undefined {
  const first = featured?.posts[0]
  if (!first?.cover) return undefined
  const src = `/writing/${first.slug}/${first.cover}`
  return fs.existsSync(path.join(process.cwd(), "public", src)) ? src : undefined
}

const totalParts = (seriesId?: string) => SERIES.find((s) => s.id === seriesId)?.slugs.length

export default function WritingIndex() {
  const posts = loadPosts()
  const groups = groupByCategory(posts)
  const featured = featuredSeries(posts)
  return (
    <WritingShell current="Writing">
      <JsonLd data={CRUMBS} />
      <main className="w-index">
        <div className="w-head">
          <div className="w-title">
            <h1>Writing</h1>
            <p>Things I looked into, and what I found.</p>
          </div>
          {groups.length > 0 ? <CategoryFilter categories={groups.map((g) => g.category)} /> : null}
        </div>
        <div className="w-sections">
          {groups.length === 0 ? <p className="w-empty">First posts soon.</p> : null}
          {featured ? (
            <div data-all-only>
              <FeaturedCard featured={featured} thumb={thumbFor(featured)} />
            </div>
          ) : null}
          {groups.map((group) => (
            <section key={group.category} className="w-group" data-category={group.category} aria-label={group.category}>
              <h2 className="w-group-title">
                {group.category} <span className="w-count">{group.posts.length}</span>
              </h2>
              <div className="w-rows">
                {group.posts.map((post) => (
                  <PostRow key={post.slug} post={post} seriesTotal={totalParts(post.series?.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </WritingShell>
  )
}
