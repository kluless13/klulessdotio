import type { Redis } from "@upstash/redis"
import { allow, hashKey } from "@/lib/ratelimit"

// Lives in the client-safe store module; re-exported so the server side has one import.
export { formatVisitor } from "@/lib/visitor-store"

export const VISITOR_KEY = "visitor:count"
export const VISITOR_LIMIT = 5
export const VISITOR_WINDOW_SECONDS = 3600

type Counter = Pick<Redis, "incr" | "expire" | "ttl">

export interface VisitorResult {
  status: number
  body: { success: boolean; data?: { number: number }; error?: "rate_limited" | "server" }
}

// Hands out the next visitor number. Each IP gets a few numbers an hour, so a
// script cannot run the count up. The IP is hashed for the limit and never logged.
export async function handleVisitor(ip: string, deps: { redis: Counter }): Promise<VisitorResult> {
  try {
    const allowed = await allow(deps.redis, hashKey("visitor", ip), VISITOR_LIMIT, VISITOR_WINDOW_SECONDS)
    if (!allowed) return { status: 429, body: { success: false, error: "rate_limited" } }
    const number = await deps.redis.incr(VISITOR_KEY)
    return { status: 200, body: { success: true, data: { number } } }
  } catch {
    return { status: 503, body: { success: false, error: "server" } }
  }
}
