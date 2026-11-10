import { NextResponse } from "next/server"
import { resendProvider } from "@/lib/mail/provider"
import { handleUnsubscribe } from "@/lib/unsubscribe"

export const dynamic = "force-dynamic"

type Context = { params: { token: string } }

const statusFor = (code: number) => (code === 200 ? "done" : code === 400 ? "invalid" : "error")

// True for the confirm page's form. Mail apps send List-Unsubscribe=One-Click
// (RFC 8058) and expect an empty reply, so they are not treated as forms.
async function cameFromForm(request: Request): Promise<boolean> {
  const type = request.headers.get("content-type")?.toLowerCase() ?? ""
  if (type.startsWith("application/x-www-form-urlencoded")) {
    try {
      const form = await request.formData()
      return !form.has("List-Unsubscribe")
    } catch {
      return false
    }
  }
  return (request.headers.get("accept") ?? "").includes("text/html")
}

export async function POST(request: Request, { params }: Context) {
  const fromForm = await cameFromForm(request)
  const { status } = await handleUnsubscribe(params.token, { provider: resendProvider(), env: process.env })
  if (fromForm) {
    return NextResponse.redirect(new URL(`/unsubscribe?status=${statusFor(status)}`, request.url), 303)
  }
  return new Response(null, { status })
}

// Mail scanners prefetch links, so GET never unsubscribes. It only leads to a
// page where the reader confirms with a button (a POST).
export async function GET(request: Request, { params }: Context) {
  return NextResponse.redirect(new URL(`/unsubscribe?token=${encodeURIComponent(params.token)}`, request.url), 303)
}
