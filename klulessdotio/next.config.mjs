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
    },
  },
  images: {
    unoptimized: true,
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
