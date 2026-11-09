import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import yaml from "js-yaml"
import { SERIES } from "@/content/series"
import { DOWNLOADS } from "@/content/downloads"
import { frontMatterSchema, normaliseDates } from "./schema"
import { readingMinutes } from "./format"
import {
  CATEGORIES,
  PostError,
  type Category,
  type Post,
  type PostMeta,
  type Series,
} from "./types"

export { readingMinutes } from "./format"

// js-yaml (bundled with gray-matter) turns 2026-13-45 into a rolled-over Date.
// The core schema has no timestamp type, so dates stay strings and get validated.
const MATTER_OPTIONS = {
  engines: { yaml: (s: string): object => (yaml.safeLoad(s, { schema: yaml.CORE_SCHEMA }) as object | undefined) ?? {} },
}

function contentDir(): string {
  return process.env.WRITING_CONTENT_DIR ?? path.join(process.cwd(), "content/posts")
}

function parseFile(dir: string, file: string): Post {
  const slug = file.replace(/\.md$/, "")
  const raw = fs.readFileSync(path.join(dir, file), "utf8")
  const parsed = matter(raw, MATTER_OPTIONS)
  const result = frontMatterSchema.safeParse(normaliseDates(parsed.data))
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new PostError(file, String(issue.path[0] ?? "frontmatter"), issue.message)
  }
  const fm = result.data
  if (fm.series) {
    const series = SERIES.find((s) => s.id === fm.series!.id)
    if (!series) throw new PostError(file, "series", `unknown series "${fm.series.id}"`)
    const index = series.slugs.indexOf(slug)
    if (index === -1) throw new PostError(file, "series", `slug is not in series "${series.id}"`)
    if (fm.series.part !== index + 1) {
      throw new PostError(file, "series", `part must be ${index + 1} for this slug`)
    }
  }
  if (fm.download && !DOWNLOADS.some((d) => d.id === fm.download)) {
    throw new PostError(file, "download", `unknown download "${fm.download}"`)
  }
  const body = parsed.content.trim()
  return { slug, ...fm, body, ...readingMinutes(body) }
}

export function loadPosts(dir: string = contentDir()): readonly Post[] {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter((f) => !f.startsWith("."))
  const stray = files.find((f) => !f.endsWith(".md"))
  if (stray) throw new PostError(stray, "file", "post files must end in .md")
  const posts = files.map((f) => parseFile(dir, f))
  return Object.freeze([...posts].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)))
}

export function getPost(slug: string, posts: readonly Post[] = loadPosts()): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

function seriesOf(post: PostMeta): Series | undefined {
  return post.series ? SERIES.find((s) => s.id === post.series!.id) : undefined
}

export function groupByCategory(
  posts: readonly PostMeta[],
): readonly { category: Category; posts: readonly PostMeta[] }[] {
  return CATEGORIES.map((category) => {
    const inCat = posts.filter((p) => p.category === category)
    const sorted = [...inCat].sort((a, b) =>
      a.series && b.series && a.series.id === b.series.id
        ? a.series.part - b.series.part
        : b.date.localeCompare(a.date),
    )
    return { category, posts: sorted }
  }).filter((g) => g.posts.length > 0)
}

export function seriesNeighbours(post: PostMeta, posts: readonly PostMeta[]) {
  const series = seriesOf(post)
  if (!series || !post.series) return null
  const inSeries = posts.filter((p) => p.series?.id === series.id)
  const at = (part: number) => inSeries.find((p) => p.series!.part === part)
  return {
    series,
    part: post.series.part,
    total: series.slugs.length,
    previous: at(post.series.part - 1),
    next: at(post.series.part + 1),
  }
}

export function relatedPosts(post: PostMeta, posts: readonly PostMeta[], count = 3): readonly PostMeta[] {
  const others = posts.filter((p) => p.slug !== post.slug)
  const newest = (list: readonly PostMeta[]) => [...list].sort((a, b) => b.date.localeCompare(a.date))
  const explicit = (post.related ?? [])
    .map((slug) => others.find((p) => p.slug === slug))
    .filter((p): p is PostMeta => Boolean(p))
  const ordered = [
    ...explicit,
    ...newest(others.filter((p) => p.category === post.category)),
    ...newest(others),
  ]
  const seen = new Set<string>()
  const unique = ordered.filter((p) => !seen.has(p.slug) && Boolean(seen.add(p.slug)))
  return Object.freeze(unique.slice(0, count))
}

export function featuredSeries(posts: readonly PostMeta[]) {
  const series = SERIES.find((s) => s.featured)
  if (!series) return null
  const inSeries = posts
    .filter((p) => p.series?.id === series.id)
    .sort((a, b) => a.series!.part - b.series!.part)
  if (inSeries.length === 0) return null
  return {
    series,
    posts: inSeries,
    minutes: inSeries.reduce((sum, p) => sum + p.minutes, 0),
  }
}
