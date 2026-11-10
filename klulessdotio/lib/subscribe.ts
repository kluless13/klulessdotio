import { z } from "zod"
import { DOWNLOADS } from "@/content/downloads"
import { isDownloadAvailable } from "@/lib/downloads/registry"
import { kitSecret, signKitToken, signToken, signUnsubToken, TOKEN_TTL_MS } from "@/lib/downloads/token"
import type { MailProvider } from "@/lib/mail/provider"
import { allow, hashKey } from "@/lib/ratelimit"
import { withTimeout } from "@/lib/timeout"

export type SubscribeEvent = "subscribed" | "rejected" | "rate_limited" | "failed:secret" | "failed:limiter" | "failed:send" | "contact_failed"
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

const LIMITER_TIMEOUT_MS = 5000
// The contact chain (create, update, segment re-adds) is best effort, so it gets
// one short budget in total. It runs beside the email send, which has its own 5s cap.
const CONTACT_TIMEOUT_MS = 1500
const IP_LIMIT = { max: 5, windowSeconds: 3600 }
const EMAIL_LIMIT = { max: 3, windowSeconds: 86400 }

const schema = z.object({
  email: z.string().trim().email().max(254),
  downloadId: z.string(),
  consent: z.literal(true),
  company_url: z.string().max(0).optional(),
  slug: z.string().min(1).max(200),
})

const kitSchema = z.object({
  kind: z.literal("kit"),
  kit: z.literal("starter-kit"),
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
  company_url: z.string().max(0).optional(),
})

const fail = (status: number, error: SubscribeError): SubscribeResult => ({
  status,
  body: { success: false, error },
})
const OK: SubscribeResult = { status: 200, body: { success: true } }

function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false
  const trap = (body as { company_url?: unknown }).company_url
  return typeof trap === "string" && trap.length > 0
}

async function checkLimits(deps: SubscribeDeps, ip: string, email: string): Promise<boolean> {
  const byIp = await allow(deps.redis, hashKey("ip", ip), IP_LIMIT.max, IP_LIMIT.windowSeconds)
  if (!byIp) return false
  return allow(deps.redis, hashKey("email", email), EMAIL_LIMIT.max, EMAIL_LIMIT.windowSeconds)
}

// Bounded so a hung limiter fails closed instead of hanging the request.
const withinLimits = (deps: SubscribeDeps, ip: string, email: string) =>
  withTimeout(checkLimits(deps, ip, email), LIMITER_TIMEOUT_MS)

// Starts the whole contact chain now and resolves true when it finished in time.
// It never rejects, so a slow or failing chain cannot delay or break the reply.
function startContact(deps: SubscribeDeps, input: Parameters<MailProvider["addContact"]>[0]): Promise<boolean> {
  return withTimeout(
    (async () => deps.provider.addContact(input))(),
    CONTACT_TIMEOUT_MS
  ).then(
    () => true,
    () => false
  )
}

function isKitRequest(body: unknown): boolean {
  return typeof body === "object" && body !== null && (body as { kind?: unknown }).kind === "kit"
}

async function handleKitSubscribe(body: unknown, ip: string, deps: SubscribeDeps): Promise<SubscribeResult> {
  const parsed = kitSchema.safeParse(body)
  if (!parsed.success) {
    deps.log("rejected")
    return fail(400, "invalid_email")
  }
  const email = parsed.data.email.toLowerCase()

  const secret = kitSecret(deps.env)
  if (!secret) {
    deps.log("failed:secret")
    return fail(502, "server")
  }

  try {
    if (!(await withinLimits(deps, ip, email))) {
      deps.log("rate_limited")
      return fail(429, "rate_limited")
    }
  } catch {
    deps.log("failed:limiter")
    return fail(502, "server")
  }

  try {
    const link = `${deps.origin}/kit/${signKitToken(email, secret)}`
    const unsubscribeLink = `${deps.origin}/api/unsubscribe/${signUnsubToken(email, secret)}`
    const segments = [deps.env.RESEND_SEGMENT_ID, deps.env.RESEND_KIT_SEGMENT_ID].filter(
      (id): id is string => Boolean(id)
    )

    // Both start together so a slow contact call never delays the reply.
    const contact = startContact(deps, { email, segments })
    await deps.provider.sendKitEmail({ email, link, unsubscribeLink })
    if (!(await contact)) deps.log("contact_failed")
  } catch {
    deps.log("failed:send")
    return fail(502, "server")
  }

  deps.log("subscribed")
  return OK
}

export async function handleSubscribe(
  body: unknown,
  ip: string,
  deps: SubscribeDeps
): Promise<SubscribeResult> {
  if (isHoneypotFilled(body)) return OK
  if (isKitRequest(body)) return handleKitSubscribe(body, ip, deps)

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
    deps.log("failed:secret")
    return fail(502, "server")
  }

  try {
    if (!(await withinLimits(deps, ip, email))) {
      deps.log("rate_limited")
      return fail(429, "rate_limited")
    }
  } catch {
    // Fail closed: without a working limiter we do not send mail.
    deps.log("failed:limiter")
    return fail(502, "server")
  }

  const title = DOWNLOADS.find((d) => d.id === downloadId)?.title ?? downloadId
  try {
    const token = signToken({ downloadId, slug, exp: deps.now() + TOKEN_TTL_MS }, secret)
    const link = `${deps.origin}/api/download/${token}`

    const contact = startContact(deps, { email, downloadId, slug })
    await deps.provider.sendDownloadEmail({ email, title, link })
    if (!(await contact)) deps.log("contact_failed")
  } catch {
    deps.log("failed:send")
    return fail(502, "server")
  }

  deps.log("subscribed")
  return OK
}
