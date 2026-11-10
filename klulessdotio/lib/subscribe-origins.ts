type Env = Record<string, string | undefined>

const withScheme = (host: string) => (host.includes("://") ? host : `https://${host}`)

// The site's own origin, plus this deployment's, so previews can sign up.
export function allowedOrigins(siteOrigin: string, env: Env): string[] {
  return [siteOrigin, env.VERCEL_URL, env.VERCEL_BRANCH_URL]
    .filter((host): host is string => Boolean(host))
    .map(withScheme)
}

// Origin for links in emails. Production uses the fixed site URL so a forged
// Host header cannot redirect a signed link; previews use their own deployment.
export function linkOrigin(siteUrl: string, requestOrigin: string, env: Env): string {
  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) return withScheme(env.VERCEL_URL)
  return env.NODE_ENV === "production" ? siteUrl : requestOrigin
}
