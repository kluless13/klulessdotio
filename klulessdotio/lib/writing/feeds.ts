import type { MetadataRoute } from "next"
import type { Post } from "@/lib/writing/types"

export const SITE_URL = "https://1tx.dev"

export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
] as const

const SUMMARY = "Hi, I'm Angad. Head of AI at Truflation, building Truman, an agent built for macro."
const INTRO =
  "Angad Maniyambath is Head of AI at Truflation. He writes research and essays on prediction markets, AI and building."

const postUrl = (slug: string) => `${SITE_URL}/writing/${slug}`

export function sitemapEntries(posts: readonly Post[]): { url: string; lastModified: string }[] {
  const latest = posts[0]?.updated ?? posts[0]?.date ?? "2026-11-09"
  return [
    { url: `${SITE_URL}/`, lastModified: latest },
    { url: `${SITE_URL}/writing`, lastModified: latest },
    { url: `${SITE_URL}/about`, lastModified: latest },
    ...posts.map((p) => ({ url: postUrl(p.slug), lastModified: p.updated ?? p.date })),
  ]
}

export function robotsRules(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
}
const escapeXml = (s: string) => s.replace(/[&<>"']/g, (c) => XML_ESCAPES[c])

export function rssXml(posts: readonly Post[]): string {
  const items = posts.map((p) => {
    const url = escapeXml(postUrl(p.slug))
    return [
      "    <item>",
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid>${url}</guid>`,
      `      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(p.description)}</description>`,
      "    </item>",
    ].join("\n")
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Angad Maniyambath, writing</title>",
    `    <link>${SITE_URL}/writing</link>`,
    `    <description>${escapeXml(INTRO)}</description>`,
    "    <language>en</language>",
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n")
}

const header = () => `# Angad Maniyambath\n\n> ${SUMMARY}\n\n${INTRO}\n`

export function llmsTxt(posts: readonly Post[]): string {
  const lines = posts.map((p) => `- [${p.title}](${postUrl(p.slug)}.md): ${p.description}`)
  return `${header()}\n## Writing\n\n${lines.join("\n")}\n\n## About\n\n- [About](${SITE_URL}/about)\n`
}

export function postMarkdown(post: Post): string {
  return `# ${post.title}\n\n${postUrl(post.slug)}\n${post.date}\n\n${post.body.trim()}\n`
}

export function llmsFullTxt(posts: readonly Post[]): string {
  return `${header()}\n${posts.map(postMarkdown).join("\n")}`
}
