import { rssXml } from "@/lib/writing/feeds"
import { loadPosts } from "@/lib/writing/posts"

export const dynamic = "force-static"

export function GET() {
  return new Response(rssXml(loadPosts()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
