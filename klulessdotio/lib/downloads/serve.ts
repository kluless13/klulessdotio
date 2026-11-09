import { DOWNLOADS } from "@/content/downloads"
import { downloadUrl, isDownloadAvailable } from "./registry"
import { verifyToken } from "./token"

type Env = Record<string, string | undefined>

const TEXT = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" }

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

function expiredPage(slug: string): Response {
  const href = `/writing/${encodeURIComponent(slug)}`
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="robots" content="noindex"><title>Link expired</title></head>` +
    `<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem">` +
    `<p>This link has expired.</p><p><a href="${escapeHtml(href)}">Get a fresh one</a></p></body></html>`
  return new Response(html, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
  })
}

const SAFE_FILE_NAME = /^[\w.-]+$/
const safeFileName = (name: string) => (SAFE_FILE_NAME.test(name) ? name : "download")

export async function serveDownload(token: string, env: Env = process.env): Promise<Response> {
  const result = verifyToken(token, env.DOWNLOAD_SIGNING_SECRET ?? "")
  if (!result.ok) {
    return result.reason === "expired"
      ? expiredPage(result.slug)
      : new Response("This link doesn't work.", { status: 400, headers: TEXT })
  }

  const { downloadId } = result.payload
  const meta = DOWNLOADS.find((d) => d.id === downloadId)
  const url = downloadUrl(downloadId, env)
  const unavailable = () => new Response("This download is unavailable.", { status: 404, headers: TEXT })
  if (!meta || !url || !isDownloadAvailable(downloadId, env)) return unavailable()

  let upstream: Response
  try {
    upstream = await fetch(url, { cache: "no-store" })
  } catch {
    return unavailable()
  }
  if (!upstream.ok || !upstream.body) return unavailable()

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeFileName(meta.fileName)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  })
}
