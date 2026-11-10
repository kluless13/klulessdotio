import type { MetadataRoute } from "next"
import { SITE_DESCRIPTION } from "@/lib/content"
import { LIBRARY_UPDATED } from "@/content/library"
import { allItems } from "@/lib/library/catalogue"
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

const SUMMARY = SITE_DESCRIPTION
const INTRO =
  "Angad Maniyambath is Head of AI at Truflation. He writes research and essays on prediction markets, AI and building."

export const LIBRARY_URL = `${SITE_URL}/library`
export const KIT_URL = `${SITE_URL}/kit`
const KIT_UPDATED = "2026-11-10"
const postUrl = (slug: string) => `${SITE_URL}/writing/${slug}`

export function sitemapEntries(posts: readonly Post[]): { url: string; lastModified: string }[] {
  const latest = posts.reduce((m, p) => ((p.updated ?? p.date) > m ? (p.updated ?? p.date) : m), "") || "2026-11-09"
  return [
    { url: `${SITE_URL}/`, lastModified: latest },
    { url: `${SITE_URL}/writing`, lastModified: latest },
    { url: `${SITE_URL}/about`, lastModified: latest },
    ...posts.map((p) => ({ url: postUrl(p.slug), lastModified: p.updated ?? p.date })),
    { url: LIBRARY_URL, lastModified: LIBRARY_UPDATED },
    ...allItems().map((item) => ({ url: `${LIBRARY_URL}/${item.slug}`, lastModified: LIBRARY_UPDATED })),
    { url: KIT_URL, lastModified: KIT_UPDATED },
  ]
}

export function robotsRules(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: "/api/" })),
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
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Angad Maniyambath, writing</title>",
    `    <link>${SITE_URL}/writing</link>`,
    `    <atom:link href="${SITE_URL}/writing/rss.xml" rel="self" type="application/rss+xml" />`,
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
  const library = [
    `- [Library](${LIBRARY_URL}): Fonts and buttons I keep coming back to.`,
    ...allItems().map((item) => `- [${item.name}](${LIBRARY_URL}/${item.slug}): ${item.note}`),
  ]
  return `${header()}\n## Writing\n\n${lines.join("\n")}\n\n## Library\n\n${library.join("\n")}\n\n## Starter kit\n\n- [Starter kit](${KIT_URL}): A free starter kit for getting AI agents to do real work in your tools. No code.\n\n## About\n\n- [About](${SITE_URL}/about)\n`
}

/** Plain-markdown consumers have no base URL, so relative image and site links become absolute. */
function absolutise(body: string, slug: string): string {
  return body.replace(/\]\(images\//g, `](${postUrl(slug)}/`).replace(/\]\(\/(?!\/)/g, `](${SITE_URL}/`)
}

export function postMarkdown(post: Post): string {
  return `# ${post.title}\n\n${postUrl(post.slug)}\n${post.date}\n\n${absolutise(post.body.trim(), post.slug)}\n`
}

export function llmsFullTxt(posts: readonly Post[]): string {
  return `${header()}\n${posts.map(postMarkdown).join("\n")}`
}
