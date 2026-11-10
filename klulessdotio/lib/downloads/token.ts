import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { z } from "zod"

export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

const payloadSchema = z.object({
  downloadId: z.string().min(1),
  slug: z.string().min(1),
  exp: z.number().finite(),
})

export type TokenPayload = z.infer<typeof payloadSchema>

export type VerifyResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "expired"; slug: string }

const INVALID: VerifyResult = { ok: false, reason: "invalid" }

function sign(part: string, secret: string): string {
  return createHmac("sha256", secret).update(part).digest("base64url")
}

function encode(payload: unknown, secret: string): string {
  const part = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${part}.${sign(part, secret)}`
}

// Checks the signature and returns the decoded JSON payload, or undefined.
function decodeSigned(token: string, secret: string): unknown {
  if (!secret || typeof token !== "string") return undefined
  const pieces = token.split(".")
  if (pieces.length !== 2 || !pieces[0] || !pieces[1]) return undefined
  const [part, sig] = pieces

  const expected = Buffer.from(sign(part, secret))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return undefined

  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"))
  } catch {
    return undefined
  }
}

export function signToken(payload: TokenPayload, secret: string): string {
  if (!secret) throw new Error("DOWNLOAD_SIGNING_SECRET is not configured")
  return encode(payload, secret)
}

export function verifyToken(token: string, secret: string, now: number = Date.now()): VerifyResult {
  const decoded = decodeSigned(token, secret)
  if (decoded === undefined || decoded === null || typeof decoded !== "object") return INVALID
  // Download tokens carry no kind; kit and unsubscribe tokens must never pass here.
  if ("kind" in decoded) return INVALID

  const parsed = payloadSchema.safeParse(decoded)
  if (!parsed.success) return INVALID

  const payload = parsed.data
  if (payload.exp < now) return { ok: false, reason: "expired", slug: payload.slug }
  return { ok: true, payload }
}

const KIT_ID = "starter-kit"

const kitSchema = z.object({
  kind: z.literal("kit"),
  kit: z.literal(KIT_ID),
  subject: z.string().min(1),
})

const unsubSchema = z.object({
  kind: z.literal("unsub"),
  email: z.string().min(1),
})

export function kitSubject(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16)
}

export function signKitToken(email: string, secret: string): string {
  if (!secret) throw new Error("KIT_SIGNING_SECRET is not configured")
  return encode({ kind: "kit", kit: KIT_ID, subject: kitSubject(email) }, secret)
}

export function verifyKitToken(
  token: string,
  secret: string,
): { ok: true; subject: string } | { ok: false } {
  const parsed = kitSchema.safeParse(decodeSigned(token, secret))
  return parsed.success ? { ok: true, subject: parsed.data.subject } : { ok: false }
}

export function signUnsubToken(email: string, secret: string): string {
  if (!secret) throw new Error("KIT_SIGNING_SECRET is not configured")
  return encode({ kind: "unsub", email: email.trim().toLowerCase() }, secret)
}

export function verifyUnsubToken(
  token: string,
  secret: string,
): { ok: true; email: string } | { ok: false } {
  const parsed = unsubSchema.safeParse(decodeSigned(token, secret))
  return parsed.success ? { ok: true, email: parsed.data.email } : { ok: false }
}

export function kitSecret(env: Record<string, string | undefined>): string | undefined {
  return env.KIT_SIGNING_SECRET || env.DOWNLOAD_SIGNING_SECRET || undefined
}
