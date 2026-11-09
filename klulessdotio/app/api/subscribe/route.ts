import { NextResponse } from "next/server"
import { SITE_URL } from "@/lib/writing/feeds"
import { resendProvider } from "@/lib/mail/provider"
import { getRateLimitRedis } from "@/lib/ratelimit"
import { handleSubscribe, type SubscribeEvent } from "@/lib/subscribe"

export const dynamic = "force-dynamic"

// Logs the event name only. Never pass an email, IP, token or URL here.
const log = (event: SubscribeEvent) => {
  if (event === "subscribed") console.info(`subscribe:${event}`)
  else console.warn(`subscribe:${event}`)
}

// Links in emails use the fixed site URL in production, so a forged Host
// header cannot point a signed link at another domain.
const originFor = (request: Request) =>
  process.env.NODE_ENV === "production" ? SITE_URL : new URL(request.url).origin

// Connects only when a limit is actually checked, so bad requests never need Redis.
// If the env is missing the call throws and handleSubscribe fails closed.
const lazyRedis = {
  incr: (key: string) => getRateLimitRedis().incr(key),
  expire: (key: string, seconds: number) => getRateLimitRedis().expire(key, seconds),
  ttl: (key: string) => getRateLimitRedis().ttl(key),
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = undefined
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  const result = await handleSubscribe(body, ip, {
    redis: lazyRedis,
    provider: resendProvider(),
    env: process.env,
    now: Date.now,
    origin: originFor(request),
    log,
  })
  return NextResponse.json(result.body, { status: result.status })
}
