import { z } from "zod"
import { DOWNLOADS } from "@/content/downloads"
import { isDownloadAvailable } from "@/lib/downloads/registry"
import { signToken, TOKEN_TTL_MS } from "@/lib/downloads/token"
import type { MailProvider } from "@/lib/mail/provider"
import { allow, hashKey } from "@/lib/ratelimit"

export type SubscribeEvent = "subscribed" | "rejected" | "rate_limited" | "failed" | "contact_failed"
export type SubscribeError = "invalid_email" | "rate_limited" | "unavailable" | "server"
export interface SubscribeResult {
  status: number
  body: { success: boolean; error?: SubscribeError }
}

export interface SubscribeDeps {
  redis: Parameters<typeof allow>[0]
  provider: MailProvider
  env: Record<string, string | undefined>
  now: () => number
  origin: string
  log: (event: SubscribeEvent) => void
}

const IP_LIMIT = { max: 5, windowSeconds: 3600 }
const EMAIL_LIMIT = { max: 3, windowSeconds: 86400 }

const schema = z.object({
  email: z.string().trim().email().max(254),
  downloadId: z.string(),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
  slug: z.string().min(1).max(200),
})

const fail = (status: number, error: SubscribeError): SubscribeResult => ({
  status,
  body: { success: false, error },
})
const OK: SubscribeResult = { status: 200, body: { success: true } }

function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false
  const website = (body as { website?: unknown }).website
  return typeof website === "string" && website.length > 0
}

async function withinLimits(deps: SubscribeDeps, ip: string, email: string): Promise<boolean> {
  const byIp = await allow(deps.redis, hashKey("ip", ip), IP_LIMIT.max, IP_LIMIT.windowSeconds)
  if (!byIp) return false
  return allow(deps.redis, hashKey("email", email), EMAIL_LIMIT.max, EMAIL_LIMIT.windowSeconds)
}

export async function handleSubscribe(
  body: unknown,
  ip: string,
  deps: SubscribeDeps
): Promise<SubscribeResult> {
  if (isHoneypotFilled(body)) return OK

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    deps.log("rejected")
    return fail(400, "invalid_email")
  }
  const { email, downloadId, slug } = parsed.data

  if (!isDownloadAvailable(downloadId, deps.env)) {
    deps.log("rejected")
    return fail(404, "unavailable")
  }

  const secret = deps.env.DOWNLOAD_SIGNING_SECRET
  if (!secret) {
    deps.log("failed")
    return fail(502, "server")
  }

  try {
    if (!(await withinLimits(deps, ip, email))) {
      deps.log("rate_limited")
      return fail(429, "rate_limited")
    }
  } catch {
    // Fail closed: without a working limiter we do not send mail.
    deps.log("failed")
    return fail(502, "server")
  }

  const title = DOWNLOADS.find((d) => d.id === downloadId)?.title ?? downloadId
  try {
    const token = signToken({ downloadId, slug, exp: deps.now() + TOKEN_TTL_MS }, secret)
    const link = `${deps.origin}/api/download/${token}`

    try {
      await deps.provider.addContact({ email, downloadId, slug })
    } catch {
      deps.log("contact_failed")
    }
    await deps.provider.sendDownloadEmail({ email, title, link })
  } catch {
    deps.log("failed")
    return fail(502, "server")
  }

  deps.log("subscribed")
  return OK
}
