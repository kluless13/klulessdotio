import { z } from "zod"
import { DOWNLOADS } from "@/content/downloads"
import { isDownloadAvailable } from "@/lib/downloads/registry"
import { kitSecret, signKitToken, signToken, signUnsubToken, TOKEN_TTL_MS } from "@/lib/downloads/token"
import { isSafeCode, type MailProvider } from "@/lib/mail/provider"
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
  // detail is only ever a short reason code such as "timeout", never an address.
  log: (event: SubscribeEvent, detail?: string) => void
  // Keeps background work alive after the reply (Vercel's waitUntil in the route).
  defer: (work: Promise<unknown>) => void
}

const LIMITER_TIMEOUT_MS = 5000
// The contact chain (create, update, segment re-adds) runs in the background after
// the reply, so it gets a generous total budget: enough for a cold start in Mumbai
// talking to Resend in the US, well under the function's own limit.
const CONTACT_TIMEOUT_MS = 12_000
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

// Only a plain reason code reaches the logs; anything else is just "error".
function failureCode(error: unknown): string {
  if (error instanceof Error && error.message === "timeout") return "timeout"
  const code = (error as { code?: unknown } | null)?.code
  return typeof code === "string" && isSafeCode(code) ? code : "error"
}

// Starts the whole contact chain and hands it to deps.defer, so the reply never
// waits for it. A failure is logged with its reason code once the chain settles.
function startContact(deps: SubscribeDeps, input: Parameters<MailProvider["addContact"]>[0]): void {
  const chain = withTimeout(
    (async () => deps.provider.addContact(input))(),
    CONTACT_TIMEOUT_MS
  ).then(
    () => undefined,
    (error: unknown) => deps.log("contact_failed", failureCode(error))
  )
  deps.defer(chain)
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

    await deps.provider.sendKitEmail({ email, link, unsubscribeLink })
  } catch (error) {
    deps.log("failed:send", failureCode(error))
    return fail(502, "server")
  }

  // Only once the email has gone out, so a failed send never joins the list.
  // It finishes in the background; the reply does not wait for it.
  const segments = [deps.env.RESEND_SEGMENT_ID, deps.env.RESEND_KIT_SEGMENT_ID].filter(
    (id): id is string => Boolean(id)
  )
  startContact(deps, { email, segments })
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

    await deps.provider.sendDownloadEmail({ email, title, link })
  } catch (error) {
    deps.log("failed:send", failureCode(error))
    return fail(502, "server")
  }

  startContact(deps, { email, downloadId, slug })
  deps.log("subscribed")
  return OK
}
