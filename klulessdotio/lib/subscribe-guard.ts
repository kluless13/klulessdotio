import type { SubscribeError } from "@/lib/subscribe"

export interface GuardRejection {
  status: number
  error: SubscribeError
}

// CSRF defence for the subscribe POST: JSON only, and in production only
// from the site's own origin. Returns null when the request may proceed.
export function guardSubscribeRequest(
  headers: Pick<Headers, "get">,
  allowedOrigins: readonly string[],
  production: boolean
): GuardRejection | null {
  const type = headers.get("content-type") ?? ""
  if (!type.toLowerCase().startsWith("application/json")) {
    return { status: 415, error: "invalid_email" }
  }
  if (production && !allowedOrigins.includes(headers.get("origin") ?? "")) {
    return { status: 403, error: "server" }
  }
  return null
}
