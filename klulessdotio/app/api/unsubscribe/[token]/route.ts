import { NextResponse } from "next/server"
import { resendProvider } from "@/lib/mail/provider"
import { handleUnsubscribe } from "@/lib/unsubscribe"

export const dynamic = "force-dynamic"

type Context = { params: { token: string } }

const run = (token: string) => handleUnsubscribe(token, { provider: resendProvider(), env: process.env })

const statusFor = (code: number) => (code === 200 ? "done" : code === 400 ? "invalid" : "error")

// One-click unsubscribe (RFC 8058): mail clients POST and expect an empty reply.
export async function POST(_request: Request, { params }: Context) {
  const { status } = await run(params.token)
  return new Response(null, { status })
}

// The link in the email body: do it, then show a small confirmation page.
export async function GET(request: Request, { params }: Context) {
  const { status } = await run(params.token)
  const target = new URL(`/unsubscribe?status=${statusFor(status)}`, request.url)
  return NextResponse.redirect(target, 303)
}
