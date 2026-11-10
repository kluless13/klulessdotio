import { Redis } from "@upstash/redis"

/**
 * Redis client for the kit text. Deserialisation is off so GET returns the
 * stored Markdown verbatim instead of running JSON.parse on it.
 */
export function makeKitRedis(env: Record<string, string | undefined>): Redis | null {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token, automaticDeserialization: false })
}
