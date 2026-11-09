import { createHmac, timingSafeEqual } from "node:crypto"
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

export function signToken(payload: TokenPayload, secret: string): string {
  if (!secret) throw new Error("DOWNLOAD_SIGNING_SECRET is not configured")
  const part = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${part}.${sign(part, secret)}`
}

export function verifyToken(token: string, secret: string, now: number = Date.now()): VerifyResult {
  if (!secret || typeof token !== "string") return INVALID
  const pieces = token.split(".")
  if (pieces.length !== 2 || !pieces[0] || !pieces[1]) return INVALID
  const [part, sig] = pieces

  const expected = Buffer.from(sign(part, secret))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return INVALID

  let parsed: z.SafeParseReturnType<unknown, TokenPayload>
  try {
    parsed = payloadSchema.safeParse(JSON.parse(Buffer.from(part, "base64url").toString("utf8")))
  } catch {
    return INVALID
  }
  if (!parsed.success) return INVALID

  const payload = parsed.data
  if (payload.exp < now) return { ok: false, reason: "expired", slug: payload.slug }
  return { ok: true, payload }
}
