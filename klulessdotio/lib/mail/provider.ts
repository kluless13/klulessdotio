import { Resend } from "resend"
import { downloadEmailHtml, downloadEmailText } from "./download-email"

export interface MailProvider {
  addContact(input: { email: string; downloadId: string; slug: string }): Promise<void>
  sendDownloadEmail(input: { email: string; title: string; link: string }): Promise<void>
}

type Env = Record<string, string | undefined>

const FAILED = "mail provider failed"

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

export function resendProvider(env: Env = process.env): MailProvider {
  const client = () => new Resend(requireEnv(env, "RESEND_API_KEY"))

  return {
    async addContact({ email }) {
      const resend = client()
      const segmentId = env.RESEND_SEGMENT_ID
      let result
      try {
        result = await resend.contacts.create({
          email,
          unsubscribed: false,
          ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
        })
      } catch {
        throw new Error(FAILED)
      }
      if (result.error && !isDuplicate(result.error)) throw new Error(FAILED)
    },

    async sendDownloadEmail({ email, title, link }) {
      const resend = client()
      const from = requireEnv(env, "MAIL_FROM")
      let result
      try {
        result = await resend.emails.send({
          from,
          to: email,
          subject: `Your download: ${title.replace(/[\r\n]+/g, " ")}`,
          html: downloadEmailHtml(title, link),
          text: downloadEmailText(title, link),
        })
      } catch {
        throw new Error(FAILED)
      }
      if (result.error) throw new Error(FAILED)
    },
  }
}
