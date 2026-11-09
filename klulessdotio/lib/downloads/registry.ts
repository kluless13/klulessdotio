import { DOWNLOADS } from "@/content/downloads"

type Env = Record<string, string | undefined>

export function downloadEnvKey(id: string): string {
  return `DOWNLOAD_URL_${id.toUpperCase().replace(/-/g, "_")}`
}

export function downloadUrl(id: string, env: Env = process.env): string | null {
  const value = env[downloadEnvKey(id)]
  return value ? value : null
}

export function isDownloadAvailable(id: string, env: Env = process.env): boolean {
  return DOWNLOADS.some((d) => d.id === id) && downloadUrl(id, env) !== null
}
