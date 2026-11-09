import { llmsFullTxt } from "@/lib/writing/feeds"
import { loadPosts } from "@/lib/writing/posts"

export const dynamic = "force-static"

export function GET() {
  return new Response(llmsFullTxt(loadPosts()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
