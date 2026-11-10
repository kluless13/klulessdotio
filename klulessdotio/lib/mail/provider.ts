import { Resend } from "resend"
import { downloadEmailHtml, downloadEmailText } from "./download-email"
import { KIT_EMAIL_SUBJECT, kitEmailHtml, kitEmailText } from "./kit-email"
import { withTimeout } from "../timeout"

export interface MailProvider {
  addContact(input: {
    email: string
    downloadId?: string
    slug?: string
    segments?: readonly string[]
  }): Promise<void>
  sendDownloadEmail(input: { email: string; title: string; link: string }): Promise<void>
  sendKitEmail(input: { email: string; link: string; unsubscribeLink: string }): Promise<void>
  unsubscribe(email: string): Promise<void>
}

type Env = Record<string, string | undefined>

const FAILED = "mail provider failed"
const CALL_TIMEOUT_MS = 5000

function requireEnv(env: Env, name: string): string {
  const value = env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

// Resend does not document a dedicated error name for duplicates, so match
// on the 409 status or wording instead.
function isDuplicate(error: { message?: string; statusCode?: number | null }): boolean {
  return error.statusCode === 409 || /already exist/i.test(error.message ?? "")
}

function isNotFound(error: { message?: string; statusCode?: number | null }): boolean {
  return error.statusCode === 404 || /not found/i.test(error.message ?? "")
}

// Every Resend call is bounded; any throw, timeout included, becomes FAILED
// so no address or provider detail leaks.
async function call<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await withTimeout(run(), CALL_TIMEOUT_MS)
  } catch {
    throw new Error(FAILED)
  }
}

export function resendProvider(env: Env = process.env): MailProvider {
  const client = () => {
    const apiKey = env.RESEND_API_KEY || env.Resend
    if (!apiKey) throw new Error("RESEND_API_KEY (or Resend) is not configured")
    return new Resend(apiKey)
  }

  return {
    async addContact({ email, segments }) {
      const resend = client()
      const segmentIds = segments ?? (env.RESEND_SEGMENT_ID ? [env.RESEND_SEGMENT_ID] : [])
      const result = await call(() =>
        resend.contacts.create({
          email,
          unsubscribed: false,
          ...(segmentIds.length ? { segments: segmentIds.map((id) => ({ id })) } : {}),
        })
      )
      if (!result.error) return
      if (!isDuplicate(result.error)) throw new Error(FAILED)

      // A returning reader is subscribed again. Segment re-adds are best effort:
      // the contact may already be in them.
      const updated = await call(() => resend.contacts.update({ email, unsubscribed: false }))
      if (updated.error) throw new Error(FAILED)
      await Promise.all(
        segmentIds.map((segmentId) =>
          call(() => resend.contacts.segments.add({ email, segmentId })).catch(() => undefined)
        )
      )
    },

    async sendDownloadEmail({ email, title, link }) {
      const resend = client()
      const from = requireEnv(env, "MAIL_FROM")
      const result = await call(() =>
        resend.emails.send({
          from,
          to: email,
          subject: `Your download: ${title.replace(/[\r\n]+/g, " ")}`,
          html: downloadEmailHtml(title, link),
          text: downloadEmailText(title, link),
        })
      )
      if (result.error) throw new Error(FAILED)
    },

    async sendKitEmail({ email, link, unsubscribeLink }) {
      const resend = client()
      const from = requireEnv(env, "MAIL_FROM")
      const result = await call(() =>
        resend.emails.send({
          from,
          to: email,
          subject: KIT_EMAIL_SUBJECT,
          html: kitEmailHtml(link, unsubscribeLink),
          text: kitEmailText(link, unsubscribeLink),
          headers: {
            "List-Unsubscribe": `<${unsubscribeLink}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        })
      )
      if (result.error) throw new Error(FAILED)
    },

    async unsubscribe(email) {
      const resend = client()
      const result = await call(() => resend.contacts.update({ email, unsubscribed: true }))
      if (result.error && !isNotFound(result.error)) throw new Error(FAILED)
    },
  }
}
