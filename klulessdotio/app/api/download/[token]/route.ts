import { serveDownload } from "@/lib/downloads/serve"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  return serveDownload(params.token)
}
