import fs from "node:fs"
import { withTimeout } from "../timeout"
import { parseKit } from "./parse"
import { makeKitRedis } from "./redis"
import { validateKit } from "./validate"
import type { KitDoc } from "./types"

export const KIT_CONTENT_KEY = "kit:starter-kit:content"
const REDIS_TIMEOUT_MS = 5000

type Env = Record<string, string | undefined>
interface Deps {
  redis?: { get(key: string): Promise<string | null> }
  readFile?: (p: string) => string
}
export type KitContentResult = { ok: true; doc: KitDoc } | { ok: false; reason: "unavailable" }

const UNAVAILABLE = { ok: false, reason: "unavailable" } as const

async function readSource(env: Env, deps: Deps): Promise<string | null> {
  if (env.KIT_CONTENT_FILE) {
    const readFile = deps.readFile ?? ((p: string) => fs.readFileSync(p, "utf8"))
    return readFile(env.KIT_CONTENT_FILE)
  }
  const redis = deps.redis ?? makeKitRedis(env)
  if (!redis) return null
  const value = await withTimeout(redis.get(KIT_CONTENT_KEY), REDIS_TIMEOUT_MS)
  return typeof value === "string" ? value : null
}

export async function loadKitContent(env: Env, deps: Deps = {}): Promise<KitContentResult> {
  try {
    const markdown = await readSource(env, deps)
    if (!markdown || validateKit(markdown).length > 0) return UNAVAILABLE
    return { ok: true, doc: await parseKit(markdown) }
  } catch {
    return UNAVAILABLE
  }
}
