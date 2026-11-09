import type { Metadata } from "next"
import { SITE_URL } from "@/lib/writing/feeds"
import type { PostMeta } from "@/lib/writing/types"

const CONTEXT = "https://schema.org"
const NAME = "Angad Maniyambath"
const PERSON_ID = `${SITE_URL}/#angad`
const SUFFIX = ` · ${NAME}`

/** The feed link for the head of /writing and every post (`alternates.types`). */
export const RSS_ALTERNATE = { "application/rss+xml": `${SITE_URL}/writing/rss.xml` } as const

export function personJsonLd() {
  return {
    "@context": CONTEXT,
    "@type": "Person",
    "@id": PERSON_ID,
    name: NAME,
    url: SITE_URL,
    image: `${SITE_URL}/about/angad.jpg`,
    jobTitle: "Head of AI",
    worksFor: { "@type": "Organization", name: "Truflation", url: "https://truflation.com" },
    sameAs: [
      "https://twitter.com/onetrillionx",
      "https://github.com/kluless13",
      "https://www.linkedin.com/in/angad-maniyambath-b019293a7/",
      "https://orcid.org/0009-0000-0985-4721",
    ],
  }
}

export function websiteJsonLd() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    url: SITE_URL,
    name: NAME,
    publisher: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
  }
}

export function blogPostingJsonLd(post: PostMeta, seriesTitle?: string) {
  const url = `${SITE_URL}/writing/${post.slug}`
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@id": PERSON_ID, "@type": "Person", name: NAME, url: `${SITE_URL}/about` },
    image: `${url}/opengraph-image`,
    mainEntityOfPage: url,
    url,
    wordCount: post.words,
    ...(seriesTitle ? { isPartOf: { "@type": "CreativeWorkSeries", name: seriesTitle } } : {}),
  }
}

export function breadcrumbJsonLd(items: readonly { name: string; url: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "1tx.dev", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hi, I'm Angad." }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  }
}

export function postMetadata(post: PostMeta): Metadata {
  const title = `${post.title}${SUFFIX}`
  const url = `${SITE_URL}/writing/${post.slug}`
  return {
    title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: post.description,
      url,
      siteName: "1tx.dev",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [`${SITE_URL}/about`],
    },
    twitter: { card: "summary_large_image", title, description: post.description, creator: "@onetrillionx" },
  }
}
