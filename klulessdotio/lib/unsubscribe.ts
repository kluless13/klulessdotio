import { kitSecret, verifyUnsubToken } from "@/lib/downloads/token"
import type { MailProvider } from "@/lib/mail/provider"

export interface UnsubscribeDeps {
  provider: Pick<MailProvider, "unsubscribe">
  env: Record<string, string | undefined>
}

// 400 for a link that does not verify, 502 when the mail provider fails or
// times out, 200 otherwise (an address the provider no longer knows counts as done).
export async function handleUnsubscribe(token: string, deps: UnsubscribeDeps): Promise<{ status: number }> {
  const verified = verifyUnsubToken(token, kitSecret(deps.env) ?? "")
  if (!verified.ok) return { status: 400 }
  try {
    await deps.provider.unsubscribe(verified.email)
  } catch {
    return { status: 502 }
  }
  return { status: 200 }
}
