import { NextResponse } from "next/server"
import { SITE_URL } from "@/lib/writing/feeds"
import { resendProvider } from "@/lib/mail/provider"
import { getRateLimitRedis } from "@/lib/ratelimit"
import { guardSubscribeRequest } from "@/lib/subscribe-guard"
import { allowedOrigins, linkOrigin } from "@/lib/subscribe-origins"
import { handleSubscribe, type SubscribeEvent } from "@/lib/subscribe"

export const dynamic = "force-dynamic"

// Logs the event name only. Never pass an email, IP, token or URL here.
const log = (event: SubscribeEvent) => {
  if (event === "subscribed") console.info(`subscribe:${event}`)
  else console.warn(`subscribe:${event}`)
}

// Connects only when a limit is actually checked, so bad requests never need Redis.
// If the env is missing the call throws and handleSubscribe fails closed.
const lazyRedis = {
  incr: (key: string) => getRateLimitRedis().incr(key),
  expire: (key: string, seconds: number) => getRateLimitRedis().expire(key, seconds),
  ttl: (key: string) => getRateLimitRedis().ttl(key),
}

export async function POST(request: Request) {
  const production = process.env.NODE_ENV === "production"
  const rejection = guardSubscribeRequest(request.headers, allowedOrigins(new URL(SITE_URL).origin, process.env), production)
  if (rejection) {
    log("rejected")
    return NextResponse.json({ success: false, error: rejection.error }, { status: rejection.status })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = undefined
  }
  // Relies on Vercel overwriting x-forwarded-for with the real client IP.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  const result = await handleSubscribe(body, ip, {
    redis: lazyRedis,
    provider: resendProvider(),
    env: process.env,
    now: Date.now,
    origin: linkOrigin(SITE_URL, new URL(request.url).origin, process.env),
    log,
  })
  return NextResponse.json(result.body, { status: result.status })
}
