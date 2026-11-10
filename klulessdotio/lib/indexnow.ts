// IndexNow tells Bing (and Yandex, Seznam, Naver) the moment a page is new or changed,
// instead of waiting for a crawl. The key is public by design: it is served at
// /<key>.txt to prove the host is ours.

export const INDEXNOW_KEY = "ba285d4060715e950e9cd3f87390ecff"
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
/** Redis hash of url → the lastModified date we last reported. */
export const INDEXNOW_STATE_KEY = "indexnow:lastmod"

const HOST = "1tx.dev"
const TIMEOUT_MS = 10_000

export interface SitemapEntry {
  url: string
  lastModified: string
}

export interface IndexNowStore {
  hgetall: (key: string) => Promise<Record<string, unknown> | null>
  hset: (key: string, values: Record<string, string>) => Promise<number>
}

export interface IndexNowResult {
  status: number
  body: { ok: true; submitted: number } | { ok: false; error: string; upstream?: number }
}

/** Pages that are new, or whose date moved, since the last report. */
export function changedEntries(
  entries: readonly SitemapEntry[],
  previous: Record<string, unknown> | null
): SitemapEntry[] {
  return entries.filter((entry) => previous?.[entry.url] !== entry.lastModified)
}

export function indexNowBody(urls: readonly string[]) {
  return {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: [...urls],
  }
}

/** Reports changed pages, and only remembers them once IndexNow has accepted them. */
export async function runIndexNow(deps: {
  entries: readonly SitemapEntry[]
  redis: IndexNowStore
  fetch: typeof fetch
}): Promise<IndexNowResult> {
  let previous: Record<string, unknown> | null
  try {
    previous = await deps.redis.hgetall(INDEXNOW_STATE_KEY)
  } catch {
    return { status: 503, body: { ok: false, error: "storage" } }
  }

  const changed = changedEntries(deps.entries, previous)
  if (changed.length === 0) return { status: 200, body: { ok: true, submitted: 0 } }

  let response: Response
  try {
    response = await deps.fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowBody(changed.map((e) => e.url))),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    return { status: 502, body: { ok: false, error: "indexnow_unreachable" } }
  }
  // 200 means received, 202 means received and the key check is pending.
  if (response.status !== 200 && response.status !== 202) {
    return { status: 502, body: { ok: false, error: "indexnow_rejected", upstream: response.status } }
  }

  try {
    await deps.redis.hset(INDEXNOW_STATE_KEY, Object.fromEntries(changed.map((e) => [e.url, e.lastModified])))
  } catch {
    // Submitted but not remembered: the next run resubmits, which IndexNow tolerates.
    return { status: 503, body: { ok: false, error: "storage" } }
  }
  return { status: 200, body: { ok: true, submitted: changed.length } }
}
