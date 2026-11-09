import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/writing/JsonLd"
import { PostHead } from "@/components/writing/PostHead"
import { RelatedPosts } from "@/components/writing/RelatedPosts"
import { SeriesNav } from "@/components/writing/SeriesNav"
import { Sheet } from "@/components/writing/Sheet"
import { ShortVersion } from "@/components/writing/ShortVersion"
import { WritingShell } from "@/components/writing/WritingShell"
import { SITE_URL } from "@/lib/writing/feeds"
import { renderMarkdown } from "@/lib/writing/markdown"
import { getPost, loadPosts, relatedPosts, seriesNeighbours } from "@/lib/writing/posts"
import { RSS_ALTERNATE, blogPostingJsonLd, breadcrumbJsonLd, postMetadata } from "@/lib/writing/seo"
import "../writing.css"
import "../post.css"
import "../prose.css"
import "../after.css"

type Props = { params: { slug: string } }

export const dynamicParams = false

export function generateStaticParams() {
  return loadPosts().map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.slug)
  if (!post) return {}
  const base = postMetadata(post)
  return { ...base, alternates: { ...base.alternates, types: RSS_ALTERNATE } }
}

export default async function PostPage({ params }: Props) {
  const posts = loadPosts()
  const post = getPost(params.slug, posts)
  if (!post) notFound()
  const html = await renderMarkdown(post.body, post.slug)
  const place = seriesNeighbours(post, posts)
  const related = relatedPosts(post, posts, 2)
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Writing", url: `${SITE_URL}/writing` },
    { name: post.title, url: `${SITE_URL}/writing/${post.slug}` },
  ])
  return (
    <WritingShell current="Writing">
      <JsonLd data={blogPostingJsonLd(post, place?.series.title)} />
      <JsonLd data={crumbs} />
      <main className="post-page">
        <Sheet>
          <PostHead post={post} part={place ?? undefined} />
          <ShortVersion text={post.short} />
          <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
        </Sheet>
        <div className="post-after">
          {place ? <SeriesNav place={place} /> : null}
          <RelatedPosts posts={related} />
        </div>
      </main>
    </WritingShell>
  )
}
