import { NextResponse } from "next/server"
import { CONTRIBUTIONS_CACHE_SECONDS, loadContributions } from "@/lib/contributions"

export const revalidate = 21600

export async function GET() {
  const body = await loadContributions()
  const maxAge = body.success ? CONTRIBUTIONS_CACHE_SECONDS : 300
  return NextResponse.json(body, { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` } })
}
