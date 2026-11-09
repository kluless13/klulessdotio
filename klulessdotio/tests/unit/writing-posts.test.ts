import { describe, expect, it } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import {
  featuredSeries,
  groupByCategory,
  loadPosts,
  relatedPosts,
  seriesNeighbours,
} from "@/lib/writing/posts"
import { formatDate } from "@/lib/writing/format"
import { PostError } from "@/lib/writing/types"
import { SERIES } from "@/content/series"
import { DOWNLOADS } from "@/content/downloads"

const fixtures = path.join(process.cwd(), "tests/fixtures/posts")
const validDir = path.join(fixtures, "valid")

describe("loadPosts", () => {
  it("loads valid fixtures newest first with words and minutes", () => {
    const posts = loadPosts(validDir)
    expect(posts).toHaveLength(4)
    expect(posts[0].date).toBe("2026-11-10")
    for (const p of posts) {
      expect(p.minutes).toBe(Math.max(1, Math.round(p.words / 230)))
    }
  })

  it("names the file and field on a bad category", () => {
    expect(() => loadPosts(path.join(fixtures, "bad-category"))).toThrow(PostError)
    expect(() => loadPosts(path.join(fixtures, "bad-category"))).toThrow(
      expect.objectContaining({ file: expect.stringContaining("x.md"), field: "category" }),
    )
  })

  it("names the file and field when short is missing", () => {
    expect(() => loadPosts(path.join(fixtures, "missing-short"))).toThrow(
      expect.objectContaining({ file: expect.stringContaining("x.md"), field: "short" }),
    )
  })

  it("rejects a series part that does not match the series order", () => {
    expect(() => loadPosts(path.join(fixtures, "bad-part"))).toThrow(
      expect.objectContaining({ field: "series" }),
    )
  })

  it("rejects a part that is wrong for a real series slug", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"))
    fs.writeFileSync(
      path.join(dir, "why-prediction-markets-resolve-no.md"),
      "---\ntitle: T\ndescription: d\nshort: s\ndate: 2026-11-09\ncategory: Prediction markets\nseries:\n  id: prediction-markets\n  part: 1\n---\nBody\n",
    )
    expect(() => loadPosts(dir)).toThrow(expect.objectContaining({ field: "series" }))
  })

  it("rejects a description over 160 characters", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"))
    fs.writeFileSync(
      path.join(dir, "long.md"),
      `---\ntitle: T\ndescription: ${"a".repeat(161)}\nshort: s\ndate: 2026-11-09\ncategory: Thinking\n---\nBody\n`,
    )
    expect(() => loadPosts(dir)).toThrow(expect.objectContaining({ field: "description" }))
  })

  it("rejects an unknown download", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"))
    fs.writeFileSync(
      path.join(dir, "d.md"),
      "---\ntitle: T\ndescription: d\nshort: s\ndate: 2026-11-09\ncategory: Thinking\ndownload: nope\n---\nBody\n",
    )
    expect(() => loadPosts(dir)).toThrow(expect.objectContaining({ field: "download" }))
  })

  it("returns an empty list for a missing directory", () => {
    expect(loadPosts(path.join(fixtures, "does-not-exist"))).toEqual([])
  })
})

describe("post helpers", () => {
  const posts = loadPosts(validDir)

  it("groups in category order and orders series by part", () => {
    const groups = groupByCategory(posts)
    expect(groups.map((g) => g.category)).toEqual(["AI and building", "Prediction markets", "Thinking"])
    expect(groups[1].posts.map((p) => p.slug)).toEqual([
      "are-prediction-markets-accurate",
      "why-prediction-markets-resolve-no",
    ])
  })

  it("finds series neighbours", () => {
    const first = posts.find((p) => p.series?.part === 1)!
    const n = seriesNeighbours(first, posts)!
    expect(n.previous).toBeUndefined()
    expect(n.next?.series?.part).toBe(2)
    expect(n.total).toBe(7)
    expect(seriesNeighbours(posts.find((p) => !p.series)!, posts)).toBeNull()
  })

  it("fills related from front matter then category then newest, never itself", () => {
    const base = posts.find((p) => p.slug === "claude-code-notes")!
    const withRelated = { ...base, related: ["the-99-point-gap"] }
    const r = relatedPosts(withRelated, posts)
    expect(r[0].slug).toBe("the-99-point-gap")
    expect(r.map((p) => p.slug)).not.toContain("claude-code-notes")
    expect(r).toHaveLength(3)
    const pm = posts.find((p) => p.series?.part === 1)!
    expect(relatedPosts(pm, posts)[0].slug).toBe("why-prediction-markets-resolve-no")
  })

  it("featuredSeries is null with no published parts and sums minutes otherwise", () => {
    expect(featuredSeries([])).toBeNull()
    const f = featuredSeries(posts)!
    expect(f.series.id).toBe("prediction-markets")
    expect(f.posts).toHaveLength(2)
    expect(f.minutes).toBe(f.posts.reduce((s, p) => s + p.minutes, 0))
  })
})

describe("formatDate and content data", () => {
  it("formats dates in UTC", () => {
    expect(formatDate("2026-11-12", "long")).toBe("12 November 2026")
    expect(formatDate("2026-11-12", "short")).toBe("12 Nov 2026")
  })

  it("content data has no em dashes", () => {
    expect(JSON.stringify([SERIES, DOWNLOADS])).not.toContain("—")
  })
})
