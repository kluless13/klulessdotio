import { NextResponse } from "next/server"
import { SITE_URL } from "@/lib/writing/feeds"
import { getRateLimitRedis } from "@/lib/ratelimit"
import { guardSubscribeRequest } from "@/lib/subscribe-guard"
import { handleVisitor } from "@/lib/visitor"

export const dynamic = "force-dynamic"

// Connects only when a count is actually taken, so rejected requests never need Redis.
const lazyRedis = {
  incr: (key: string) => getRateLimitRedis().incr(key),
  expire: (key: string, seconds: number) => getRateLimitRedis().expire(key, seconds),
  ttl: (key: string) => getRateLimitRedis().ttl(key),
}

export async function POST(request: Request) {
  const production = process.env.NODE_ENV === "production"
  const rejection = guardSubscribeRequest(request.headers, [new URL(SITE_URL).origin], production)
  if (rejection) {
    return NextResponse.json({ success: false, error: "server" }, { status: rejection.status })
  }
  // Relies on Vercel overwriting x-forwarded-for with the real client IP.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const result = await handleVisitor(ip, { redis: lazyRedis })
  return NextResponse.json(result.body, { status: result.status })
}
