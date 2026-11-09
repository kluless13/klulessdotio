import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { JsonLd } from "@/components/writing/JsonLd"
import { RSS_ALTERNATE, blogPostingJsonLd, breadcrumbJsonLd, pageMetadata, personJsonLd, postMetadata, websiteJsonLd } from "@/lib/writing/seo"
import type { PostMeta } from "@/lib/writing/types"

const post: PostMeta = {
  slug: "hello",
  title: "Hello world",
  description: "A first post.",
  short: "Short.",
  date: "2026-01-02",
  category: "Thinking",
  words: 460,
  minutes: 2,
}

describe("writing seo", () => {
  it("person has the id, sameAs in the agreed order, and no email", () => {
    const p = personJsonLd()
    expect(p["@context"]).toBe("https://schema.org")
    expect(p["@id"]).toBe("https://1tx.dev/#angad")
    expect(p.sameAs).toEqual([
      "https://twitter.com/onetrillionx",
      "https://github.com/kluless13",
      "https://www.linkedin.com/in/angad-maniyambath-b019293a7/",
      "https://orcid.org/0009-0000-0985-4721",
    ])
    expect(p.jobTitle).toBe("Head of AI")
    expect(p.worksFor).toEqual({ "@type": "Organization", name: "Truflation", url: "https://truflation.com" })
    expect(p.image).toBe("https://1tx.dev/about/angad.jpg")
    expect(JSON.stringify(p)).not.toMatch(/@[a-z0-9-]+\.[a-z]|email/i)
    expect(websiteJsonLd()["@type"]).toBe("WebSite")
  })

  it("blog posting references the person id and has dates, wordCount and image", () => {
    const b = blogPostingJsonLd({ ...post, updated: "2026-02-03" })
    expect(b.author).toEqual({ "@id": "https://1tx.dev/#angad" })
    expect(b.headline).toBe("Hello world")
    expect(b.datePublished).toBe("2026-01-02")
    expect(b.dateModified).toBe("2026-02-03")
    expect(b.wordCount).toBe(460)
    expect(b.image).toBe("https://1tx.dev/writing/hello/opengraph-image")
    expect(b.mainEntityOfPage).toBe("https://1tx.dev/writing/hello")
    expect(blogPostingJsonLd(post).dateModified).toBe("2026-01-02")
    expect(blogPostingJsonLd(post).isPartOf).toBeUndefined()
  })

  it("series posts get isPartOf", () => {
    const b = blogPostingJsonLd({ ...post, series: { id: "s", part: 1 } }, "My series")
    expect(b.isPartOf).toEqual({ "@type": "CreativeWorkSeries", name: "My series" })
  })

  it("breadcrumb lists items in order", () => {
    const b = breadcrumbJsonLd([{ name: "Home", url: "https://1tx.dev" }, { name: "Writing", url: "https://1tx.dev/writing" }])
    expect(b.itemListElement[1]).toEqual({ "@type": "ListItem", position: 2, name: "Writing", item: "https://1tx.dev/writing" })
  })

  it("post metadata sets canonical and article times", () => {
    const m = postMetadata({ ...post, updated: "2026-02-03" })
    expect(m.title).toBe("Hello world · Angad Maniyambath")
    expect(m.alternates?.canonical).toBe("https://1tx.dev/writing/hello")
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-01-02", modifiedTime: "2026-02-03", authors: ["https://1tx.dev/about"] })
    expect(m.twitter).toMatchObject({ card: "summary_large_image" })
    const p = pageMetadata("/writing", "Writing · Angad Maniyambath", "Posts.")
    expect(p.alternates?.canonical).toBe("https://1tx.dev/writing")
    expect(p.openGraph?.images).toEqual([{ url: "/og.png", width: 1200, height: 630, alt: "Hi, I'm Angad." }])
    expect(p.twitter?.images).toEqual(["/og.png"])
    expect(m.openGraph?.images).toBeUndefined()
  })

  it("JsonLd escapes closing script tags", () => {
    const html = renderToStaticMarkup(createElement(JsonLd, { data: { name: "</script><b>" } }))
    expect(html).toContain('type="application/ld+json"')
    expect(html).not.toContain("</script><b>")
    expect(html).toContain("\\u003c/script>")
  })

  it("points the feed alternate at the absolute RSS url", () => {
    expect(RSS_ALTERNATE).toEqual({ "application/rss+xml": "https://1tx.dev/writing/rss.xml" })
  })
})
