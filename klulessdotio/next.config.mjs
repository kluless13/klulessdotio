const PRIVATE_HEADERS = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      "/writing/[slug]/opengraph-image": ["./assets/**/*", "./content/posts/**/*", "./public/writing/**/*"],
      // Reads the posts at request time to build the sitemap list
      "/api/cron/indexnow": ["./content/posts/**/*"],
    },
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Kit links are personal: never leak the token to other sites, never index the page.
        // The share image lives under the same path and stays indexable.
        source: "/kit/:token((?!og\\.jpg$).*)",
        headers: PRIVATE_HEADERS,
      },
      {
        // The unsubscribe link carries a token too
        source: "/unsubscribe",
        headers: PRIVATE_HEADERS,
      },
      {
        source: "/api/unsubscribe/:token",
        headers: PRIVATE_HEADERS,
      },
    ]
  },
  async rewrites() {
    return [{ source: "/writing/:slug.md", destination: "/writing/md/:slug" }]
  },
  async redirects() {
    return [
      { source: "/portfolio", destination: "/", permanent: true },
    ]
  },
}

export default nextConfig
