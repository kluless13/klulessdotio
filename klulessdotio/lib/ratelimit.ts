import { createHash } from "node:crypto"
import { Redis } from "@upstash/redis"

type Counter = Pick<Redis, "incr" | "expire" | "ttl">

export function hashKey(kind: "ip" | "email", value: string): string {
  const normalised = kind === "email" ? value.trim().toLowerCase() : value
  const digest = createHash("sha256").update(normalised).digest("hex")
  return `rl:${kind}:${digest}`
}

export async function allow(
  redis: Counter,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, windowSeconds)
  } else if ((await redis.ttl(key)) === -1) {
    // A previous EXPIRE failed or never ran; heal the key so it cannot block forever.
    await redis.expire(key, windowSeconds)
  }
  return count <= limit
}

export function getRateLimitRedis(): Counter {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error(
      "Redis env vars not configured. Looked for KV_REST_API_URL/TOKEN " +
        "and UPSTASH_REDIS_REST_URL/TOKEN; neither pair was set."
    )
  }
  return new Redis({ url, token })
}
