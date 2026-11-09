import { describe, expect, it } from "vitest"
import path from "node:path"
import { loadPosts } from "@/lib/writing/posts"
import {
  AI_CRAWLERS,
  llmsFullTxt,
  llmsTxt,
  postMarkdown,
  robotsRules,
  rssXml,
  sitemapEntries,
} from "@/lib/writing/feeds"

const posts = loadPosts(path.join(process.cwd(), "tests/fixtures/posts/valid"))

describe("sitemap", () => {
  it("sitemap lists home, writing, about and each post with lastModified", () => {
    const entries = sitemapEntries(posts)
    expect(entries.slice(0, 3).map((e) => e.url)).toEqual([
      "https://1tx.dev/",
      "https://1tx.dev/writing",
      "https://1tx.dev/about",
    ])
    expect(entries).toHaveLength(3 + posts.length)
    const first = posts[0]
    const entry = entries.find((e) => e.url === `https://1tx.dev/writing/${first.slug}`)
    expect(entry?.lastModified).toBe(first.updated ?? first.date)
  })
  it("uses the latest updated-or-date across all posts for site pages", () => {
    const older = { ...posts[posts.length - 1], updated: "2030-05-05" }
    const entries = sitemapEntries([posts[0], older])
    expect(entries[0].lastModified).toBe("2030-05-05")
    expect(entries[1].lastModified).toBe("2030-05-05")
  })
  it("uses updated over date", () => {
    const p = { ...posts[0], updated: "2027-01-01" }
    expect(sitemapEntries([p])[3].lastModified).toBe("2027-01-01")
  })
})

describe("robots", () => {
  it("robots disallows api, allows every named AI crawler and points to the sitemap", () => {
    const r = robotsRules()
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
    const star = rules.find((x) => x.userAgent === "*")
    expect(star?.disallow).toBe("/api/")
    for (const bot of AI_CRAWLERS) {
      const rule = rules.find((x) => x.userAgent === bot)
      expect(rule?.allow).toBe("/")
      expect(rule?.disallow).toBe("/api/")
    }
    expect(r.sitemap).toBe("https://1tx.dev/sitemap.xml")
  })
})

describe("rss", () => {
  it("rss escapes ampersands and quotes and includes guid, link and pubDate", () => {
    const p = { ...posts[0], title: `A & B "quoted" <x> it's`, description: "Tom & Jerry" }
    const xml = rssXml([p])
    expect(xml).toContain("A &amp; B &quot;quoted&quot; &lt;x&gt; it&apos;s")
    expect(xml).toContain("Tom &amp; Jerry")
    const url = `https://1tx.dev/writing/${p.slug}`
    expect(xml).toContain(`<link>${url}</link>`)
    expect(xml).toContain(`<guid>${url}</guid>`)
    expect(xml).toContain(`<pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>`)
    expect(xml).toContain("<title>Angad Maniyambath, writing</title>")
  })
  it("declares the atom namespace and a self link", () => {
    const xml = rssXml([])
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"')
    expect(xml).toContain('<atom:link href="https://1tx.dev/writing/rss.xml" rel="self" type="application/rss+xml" />')
  })
})

describe("llms", () => {
  it("llms.txt has the H1, the blockquote and one line per post linking to the .md copy", () => {
    const t = llmsTxt(posts)
    expect(t.startsWith("# Angad Maniyambath\n")).toBe(true)
    expect(t).toContain("> Hi, I'm Angad. Head of AI at Truflation, building Truman, an agent built for macro.")
    for (const p of posts) {
      expect(t).toContain(`- [${p.title}](https://1tx.dev/writing/${p.slug}.md): ${p.description}`)
    }
    expect(t).toContain("## Writing")
    expect(t).toContain("## About\n\n- [About](https://1tx.dev/about)")
    expect(t).not.toContain("—")
  })
  it("llms-full contains every post body newest first", () => {
    const t = llmsFullTxt(posts)
    let last = -1
    for (const p of posts) {
      expect(t).toContain(`# ${p.title}`)
      expect(t).toContain(postMarkdown(p).split("\n\n").slice(2).join("\n\n").trim())
      const i = t.indexOf(`# ${p.title}`)
      expect(i).toBeGreaterThan(last)
      last = i
    }
  })
  it("postMarkdown has title, url, date, blank line and body", () => {
    const p = posts[0]
    const m = postMarkdown(p)
    expect(m.startsWith(`# ${p.title}\n`)).toBe(true)
    expect(m).toContain(`https://1tx.dev/writing/${p.slug}`)
    expect(m).toContain(p.date)
    expect(m).toContain(`\n\n${p.body.trim()}`)
  })
})

describe("absolute links in markdown", () => {
  const body = "![a](images/x.png) and [b](/writing/other) and [c](https://example.com/y) and [d](http://example.com/z)"
  it("postMarkdown rewrites relative images and root-relative links, leaving absolute ones", () => {
    const m = postMarkdown({ ...posts[0], body })
    expect(m).toContain(`![a](https://1tx.dev/writing/${posts[0].slug}/x.png)`)
    expect(m).toContain("[b](https://1tx.dev/writing/other)")
    expect(m).toContain("[c](https://example.com/y)")
    expect(m).toContain("[d](http://example.com/z)")
  })
  it("llmsFullTxt has no relative targets", () => {
    const t = llmsFullTxt([{ ...posts[0], body }])
    expect(t).not.toContain("](images/")
    expect(t).not.toContain("](/")
  })
  it("real content has no relative targets in llms-full", () => {
    const real = loadPosts(path.join(process.cwd(), "content/posts"))
    const t = llmsFullTxt(real)
    expect(t).not.toContain("](images/")
    expect(t).not.toContain("](/")
  })
})

describe("empty", () => {
  it("outputs are valid with zero posts", () => {
    expect(sitemapEntries([])).toHaveLength(3)
    expect(rssXml([])).toContain("<channel>")
    expect(rssXml([])).not.toContain("<item>")
    expect(llmsTxt([])).toContain("## About")
    expect(llmsFullTxt([])).toContain("# Angad Maniyambath")
  })
})
