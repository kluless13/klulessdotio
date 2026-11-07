import { NextResponse } from "next/server"
import { CONTRIBUTIONS_CACHE_SECONDS, loadContributions } from "@/lib/contributions"

// Rendered per request so a failure is never saved as the page. The fetch cache and CDN headers handle speed.
export const dynamic = "force-dynamic"

export async function GET() {
  const body = await loadContributions()
  const maxAge = body.success ? CONTRIBUTIONS_CACHE_SECONDS : 300
  return NextResponse.json(body, { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` } })
}
