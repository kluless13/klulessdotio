import { NextResponse } from "next/server"
import { WEATHER_CACHE_SECONDS, loadWeather } from "@/lib/weather"

export const revalidate = 900

/** Always answers 200: the sky carries on without weather if the service is down. */
export async function GET() {
  const body = await loadWeather()
  const maxAge = body.success ? WEATHER_CACHE_SECONDS : 60
  return NextResponse.json(body, { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` } })
}
