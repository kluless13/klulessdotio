import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { JsonLd } from "@/components/writing/JsonLd"
import { itemJsonLd, itemMetadata, libraryMetadata } from "@/lib/library/seo"
import { itemBySlug } from "@/lib/library/catalogue"
import { RSS_ALTERNATE, collectionPageJsonLd, blogPostingJsonLd, breadcrumbJsonLd, pageMetadata, personJsonLd, postMetadata, websiteJsonLd } from "@/lib/writing/seo"
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
    expect(b.author).toEqual({ "@id": "https://1tx.dev/#angad", "@type": "Person", name: "Angad Maniyambath", url: "https://1tx.dev/about" })
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

describe("library seo", () => {
  it("collection page points at the library and the person", () => {
    expect(collectionPageJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Library",
      url: "https://1tx.dev/library",
      description: "Fonts and buttons I keep coming back to.",
      author: { "@id": "https://1tx.dev/#angad" },
    })
  })

  it("the library page has its own title, canonical and share image", () => {
    const m = libraryMetadata()
    expect(m.title).toBe("Library · Angad Maniyambath")
    expect(m.alternates?.canonical).toBe("https://1tx.dev/library")
    expect(m.openGraph?.images).toEqual([{ url: "/library/og.jpg", width: 1200, height: 630, alt: "Library" }])
    expect(m.twitter?.images).toEqual(["/library/og.jpg"])
  })

  it("a font describes its category and maker, a button its source", () => {
    const geist = itemBySlug("geist")!
    expect(itemMetadata(geist).title).toBe("Geist · Library · Angad Maniyambath")
    expect(itemMetadata(geist).description).toBe("Simple and elegant. Sans serif, by Vercel.")
    expect(itemMetadata(geist).alternates?.canonical).toBe("https://1tx.dev/library/geist")
    const aqua = itemBySlug("aqua")!
    expect(itemMetadata(aqua).description).toBe("Glassy, a bit of jelly. Mac OS X, 2001.")
    expect(itemMetadata(aqua).twitter?.images).toEqual(["/library/og.jpg"])
  })

  it("item breadcrumbs run Home, Library, item", () => {
    const crumbs = itemJsonLd(itemBySlug("geist")!)
    expect(crumbs.itemListElement.map((c) => c.name)).toEqual(["Home", "Library", "Geist"])
    expect(crumbs.itemListElement[2].item).toBe("https://1tx.dev/library/geist")
  })
})
