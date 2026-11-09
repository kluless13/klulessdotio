import type { MetadataRoute } from "next"
import { sitemapEntries } from "@/lib/writing/feeds"
import { loadPosts } from "@/lib/writing/posts"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(loadPosts())
}
