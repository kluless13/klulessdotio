import fs from "node:fs"
import { Redis } from "@upstash/redis"
import { KIT_CONTENT_KEY } from "../lib/kit/content"
import { parseKit } from "../lib/kit/parse"
import { validateKit } from "../lib/kit/validate"

const DEFAULT_PATH = "docs/writing/kit/kit.md"

async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const file = args.find((a) => !a.startsWith("--")) ?? DEFAULT_PATH

  const markdown = fs.readFileSync(file, "utf8")
  const errors = validateKit(markdown)
  if (errors.length > 0) {
    for (const e of errors) console.error(`line ${e.line}: ${e.message}`)
    return 1
  }

  const doc = await parseKit(markdown)
  const summary = `${Buffer.byteLength(markdown, "utf8")} bytes, ${doc.blocks.length} blocks.`
  if (dryRun) {
    console.log(`Valid (dry run, nothing written). ${summary}`)
    return 0
  }

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.error("Redis env vars not configured (KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN).")
    return 1
  }
  await new Redis({ url, token }).set(KIT_CONTENT_KEY, markdown)
  console.log(`Uploaded ${summary}`)
  return 0
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(`Upload failed: ${err instanceof Error ? err.message : "unknown error"}`)
    process.exit(1)
  }
)
