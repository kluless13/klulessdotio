/**
 * Daily IndexNow report (schedule in vercel.json).
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`. Anything else is refused.
 * Sends Bing only the sitemap pages that are new or changed since the last run.
 */
import { timingSafeEqual } from "node:crypto"
import { Redis } from "@upstash/redis"
import { runIndexNow } from "@/lib/indexnow"
import { sitemapEntries } from "@/lib/writing/feeds"
import { loadPosts } from "@/lib/writing/posts"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function authorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false
  const given = Buffer.from(header)
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

function redisFromEnv(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? new Redis({ url, token }) : null
}

export async function GET(request: Request): Promise<Response> {
  if (!authorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }
  const redis = redisFromEnv()
  if (!redis) return Response.json({ ok: false, error: "storage" }, { status: 503 })

  let entries: ReturnType<typeof sitemapEntries>
  try {
    entries = sitemapEntries(loadPosts())
  } catch {
    return Response.json({ ok: false, error: "posts_unreadable" }, { status: 500 })
  }
  const result = await runIndexNow({ entries, redis, fetch })
  return Response.json(result.body, { status: result.status })
}
