import { postMarkdown } from "@/lib/writing/feeds"
import { loadPosts } from "@/lib/writing/posts"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return loadPosts().map((p) => ({ slug: p.slug }))
}

export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = loadPosts().find((p) => p.slug === params.slug)
  if (!post) return new Response("Not found", { status: 404 })
  return new Response(postMarkdown(post), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
