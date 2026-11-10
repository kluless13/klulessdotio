/**
 * Page addresses with secrets in them never reach the analytics dashboard:
 * kit links (/kit/<token>) become /kit/[token], and any ?token= parameter is dropped (unsubscribe links).
 */
const BASE = "http://relative.invalid"
const KIT_LINK = /^\/kit\/[^/]+(?:\/.*)?$/

export function redactUrl(url: string): string {
  let parsed: URL
  try {
    parsed = new URL(url, BASE)
  } catch {
    return url
  }
  const kitLink = KIT_LINK.test(parsed.pathname)
  const hasToken = parsed.searchParams.has("token")
  if (!kitLink && !hasToken) return url

  const params = new URLSearchParams(parsed.search)
  params.delete("token")
  const query = params.toString()
  const path = kitLink ? "/kit/[token]" : parsed.pathname
  const rest = `${path}${query ? `?${query}` : ""}${parsed.hash}`
  return parsed.origin === new URL(BASE).origin ? rest : `${parsed.origin}${rest}`
}
