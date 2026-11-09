import fs from "node:fs"
import path from "node:path"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import type { Element, ElementContent, Root, RootContent } from "hast"

type HasFile = (publicPath: string) => boolean

const OWN_HOSTS = new Set(["1tx.dev", "www.1tx.dev"])

const defaultHasFile: HasFile = (publicPath) =>
  fs.existsSync(path.join(process.cwd(), "public", publicPath))

function isElement(node: RootContent | ElementContent | undefined, tag?: string): node is Element {
  return !!node && node.type === "element" && (!tag || node.tagName === tag)
}

const isBlank = (node: RootContent | ElementContent) =>
  node.type === "text" && node.value.trim() === ""

function meaningful(node: Element): ElementContent[] {
  return node.children.filter((c) => !isBlank(c))
}

function soleChild(node: Element, tag: string): Element | undefined {
  const kids = meaningful(node)
  return kids.length === 1 && isElement(kids[0], tag) ? kids[0] : undefined
}

function externalHref(href: unknown): boolean {
  if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return false
  try {
    return !OWN_HOSTS.has(new URL(href).hostname)
  } catch {
    return false
  }
}

function resolveSrc(src: string, slug: string): string {
  return src.startsWith("images/") ? `/writing/${slug}/${src.slice("images/".length)}` : src
}

function darkSrc(src: string): string | undefined {
  const match = /^(.*)(\.[A-Za-z0-9]+)$/.exec(src)
  return match ? `${match[1]}-dark${match[2]}` : undefined
}

function makeImg(src: string, alt: string, className?: string): Element {
  const properties: Element["properties"] = { src, alt, loading: "lazy", decoding: "async" }
  if (className) properties.className = [className]
  return { type: "element", tagName: "img", properties, children: [] }
}

function buildFigure(img: Element, caption: ElementContent[], hasFile: HasFile): Element {
  const src = String(img.properties?.src ?? "")
  const alt = String(img.properties?.alt ?? "")
  const dark = darkSrc(src)
  const paired = !!dark && hasFile(dark)
  const images = paired
    ? [makeImg(src, alt, "fig-light"), makeImg(dark, alt, "fig-dark")]
    : [makeImg(src, alt)]
  const figcaption: Element = { type: "element", tagName: "figcaption", properties: {}, children: caption }
  return {
    type: "element",
    tagName: "figure",
    properties: { className: paired ? ["post-figure"] : ["post-figure", "fig-card"] },
    children: [...images, figcaption],
  }
}

function transformBlocks(children: RootContent[], hasFile: HasFile): RootContent[] {
  const out: RootContent[] = []
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    const img = isElement(node, "p") ? soleChild(node, "img") : undefined
    if (!img) {
      out.push(wrapTable(node))
      continue
    }
    let j = i + 1
    while (j < children.length && isBlank(children[j])) j++
    const next = children[j]
    const em = isElement(next, "p") ? soleChild(next, "em") : undefined
    const caption: ElementContent[] = em
      ? em.children
      : [{ type: "text", value: String(img.properties?.alt ?? "") }]
    out.push(buildFigure(img, caption, hasFile))
    if (em) i = j
  }
  return out
}

function wrapTable(node: RootContent): RootContent {
  if (!isElement(node, "table")) return node
  return { type: "element", tagName: "div", properties: { className: ["post-table"] }, children: [node] }
}

function mapElements(node: Element, slug: string): Element {
  const children = node.children.map((c) => (isElement(c) ? mapElements(c, slug) : c))
  let properties = node.properties ?? {}
  if (node.tagName === "img") {
    properties = {
      ...properties,
      src: resolveSrc(String(properties.src ?? ""), slug),
      loading: "lazy",
      decoding: "async",
    }
  }
  if (node.tagName === "a" && externalHref(properties.href)) {
    properties = { ...properties, rel: ["noopener"] }
  }
  return { ...node, properties, children }
}

function rehypePost(slug: string, hasFile: HasFile) {
  return (tree: Root): Root => {
    const mapped = tree.children.map((c) => (isElement(c) ? mapElements(c, slug) : c))
    return { ...tree, children: transformBlocks(mapped, hasFile) }
  }
}

export async function renderMarkdown(
  markdown: string,
  slug: string,
  hasFile: HasFile = defaultHasFile,
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(() => rehypePost(slug, hasFile))
    .use(rehypeStringify)
    .process(markdown)
  return String(file)
}
