import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkDirective from "remark-directive"
import type { Heading, List, ListItem, Paragraph, Root, RootContent } from "mdast"
import type { ContainerDirective } from "mdast-util-directive"
import type { EndingCard, Inline, KitBlock, KitDoc, Note } from "./types"
import { applyNotes, highlightTexts, renderInline, safeHref, toText, type KitInline } from "./inline"

type Node = RootContent | Root

/** Markdown to mdast with directives, synchronously (shared with the validator). */
export function parseTree(markdown: string): Root {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective)
  return processor.parse(markdown)
}

const phrasing = (p: Paragraph | Heading) => highlightTexts(p.children as KitInline[])

function paragraphHtml(p: Paragraph): { html: Inline; notes: Note[] } {
  const { children, notes } = applyNotes(phrasing(p))
  return { html: renderInline(children), notes }
}

function itemParagraphs(item: ListItem): Paragraph[] {
  return item.children.filter((c): c is Paragraph => c.type === "paragraph")
}

function listBlock(list: List): KitBlock {
  const notes: Note[] = []
  const items = list.children.map((item) =>
    itemParagraphs(item)
      .map((p) => {
        const r = applyNotes(phrasing(p), notes.length)
        notes.push(...r.notes)
        return renderInline(r.children)
      })
      .join("<br>"),
  )
  return { type: "list", ordered: !!list.ordered, items, notes }
}

/** Paragraphs, list items and quotes flattened into one inline string, joined with <br>. */
function flatInline(children: readonly Node[]): Inline {
  const parts: string[] = []
  for (const c of children) {
    if (c.type === "paragraph") {
      if (!(c.data as { directiveLabel?: boolean } | undefined)?.directiveLabel) parts.push(renderInline(phrasing(c)))
    } else if (c.type === "list") {
      for (const item of c.children) parts.push(flatInline(item.children))
    } else if (c.type === "blockquote") {
      parts.push(flatInline(c.children))
    }
  }
  return parts.filter(Boolean).join("<br>")
}

function plainList(node: Node | undefined): string[] {
  return node?.type === "list" ? node.children.map((i) => toText(itemParagraphs(i).flatMap((p) => p.children as KitInline[]))) : []
}

/** Does the paragraph start with this label (e.g. "Before:")? */
export const hasLabel = (n: Node, label: string): n is Paragraph =>
  n.type === "paragraph" && n.children[0]?.type === "text" && n.children[0].value.startsWith(`${label}:`)

function stripLabel(p: Paragraph, label: string): Inline {
  const [first, ...rest] = phrasing(p)
  const text = first.type === "text" ? first.value.slice(label.length + 1).trimStart() : ""
  return renderInline([...(text ? [{ type: "text" as const, value: text }] : []), ...rest])
}

function jobBlock(d: ContainerDirective): KitBlock {
  const before = d.children.find((c) => hasLabel(c, "Before")) as Paragraph | undefined
  const connect = d.children.find((c) => hasLabel(c, "Connect")) as Paragraph | undefined
  const quote = d.children.find((c) => c.type === "blockquote")
  if (!before || !connect || !quote || quote.type !== "blockquote") {
    throw new Error("A job needs a Before: paragraph, a quoted request and a Connect: paragraph")
  }
  const request = quote.children
    .map((c) => (c.type === "paragraph" ? toText(c.children as KitInline[]) : ""))
    .filter(Boolean)
    .join("\n")
  return {
    type: "job",
    title: String(d.attributes?.title ?? ""),
    who: String(d.attributes?.who ?? ""),
    before: stripLabel(before, "Before"),
    request,
    connect: stripLabel(connect, "Connect"),
  }
}

function cardOf(d: ContainerDirective): EndingCard {
  const title = String(d.attributes?.title ?? "")
  const label = d.attributes?.cta
  const href = d.attributes?.href
  if (!title) throw new Error("An ending card needs a title")
  const base = { title, html: flatInline(d.children) }
  if (!label && !href) return base
  const safe = href ? safeHref(href) : null
  if (!label || !safe) throw new Error("A card cta needs a label and a safe href")
  return { ...base, cta: { label, href: safe } }
}

function endingBlock(d: ContainerDirective): KitBlock {
  const intro: Inline[] = []
  const outro: Inline[] = []
  const cards: EndingCard[] = []
  let timeline: Inline[] | null = null
  for (const c of d.children) {
    if (c.type === "list" && !timeline) {
      timeline = c.children.map((i) => flatInline(i.children))
    } else if (c.type === "paragraph") {
      ;(timeline ? outro : intro).push(renderInline(phrasing(c)))
    } else if (c.type === "containerDirective" && c.name === "card") {
      cards.push(cardOf(c))
    }
  }
  return { type: "ending", intro, timeline: timeline ?? [], cards, outro }
}

function number(d: ContainerDirective, key: string): number {
  const v = Number(d.attributes?.[key])
  if (d.attributes?.[key] == null || d.attributes[key] === "" || !Number.isFinite(v)) {
    throw new Error(`timeline needs a numeric "${key}"`)
  }
  return v
}

function pathsBlock(d: ContainerDirective): KitBlock {
  const paths: { name: string; pick: boolean; body: Node[] }[] = []
  for (const c of d.children) {
    if (c.type === "leafDirective" && c.name === "path") {
      paths.push({ name: toText(c.children as KitInline[]), pick: !!c.attributes && "pick" in c.attributes, body: [] })
    } else if (paths.length) {
      paths[paths.length - 1].body.push(c)
    }
  }
  return { type: "paths", paths: paths.map((p) => ({ name: p.name, pick: p.pick, html: flatInline(p.body) })) }
}

function beforeAfterBlock(d: ContainerDirective): KitBlock {
  const list = d.children.find((c): c is List => c.type === "list")
  const after = (list?.children ?? []).map((item) => {
    const kids = itemParagraphs(item).flatMap((p) => p.children as KitInline[])
    const [first, ...rest] = kids
    const strong = first?.type === "strong"
    return {
      label: strong ? toText(first.children) : "",
      quote: toText(strong ? rest : kids).trim(),
    }
  })
  return { type: "beforeAfter", before: flatInline(d.children.filter((c) => c.type !== "list")), after }
}

function containerBlock(d: ContainerDirective): KitBlock | null {
  switch (d.name) {
    case "steps":
      return { type: "steps", items: plainList(d.children.find((c) => c.type === "list")) }
    case "paths":
      return pathsBlock(d)
    case "timeline":
      return { type: "timeline", find: number(d, "find"), decide: number(d, "decide"), fix: number(d, "fix"), html: flatInline(d.children) }
    case "before-after":
      return beforeAfterBlock(d)
    case "prompt": {
      const codes = d.children.filter((c) => c.type === "code")
      if (codes.length !== 1 || codes[0].type !== "code") throw new Error("A prompt needs exactly one code block")
      return { type: "prompt", text: codes[0].value }
    }
    case "job":
      return jobBlock(d)
    case "ending":
      return endingBlock(d)
    default:
      return null
  }
}

function headingBlock(h: Heading): KitBlock {
  const text = toText(h.children as KitInline[]).trim()
  const m = /^(\d+)\s+(.+)$/.exec(text)
  const level = h.depth === 2 ? 2 : 3
  return m && level === 2
    ? { type: "heading", level, text: m[2], step: Number(m[1]) }
    : { type: "heading", level, text }
}

function blockFor(node: RootContent): KitBlock | null {
  switch (node.type) {
    case "heading":
      return node.depth === 2 || node.depth === 3 ? headingBlock(node) : null
    case "paragraph":
      return { type: "paragraph", ...paragraphHtml(node) }
    case "list":
      return listBlock(node)
    case "containerDirective":
      return containerBlock(node)
    default:
      return null
  }
}

export async function parseKit(markdown: string): Promise<KitDoc> {
  const tree = parseTree(markdown)
  const h1 = tree.children.find((c): c is Heading => c.type === "heading" && c.depth === 1)
  if (!h1) throw new Error("The kit needs a # title")
  const blocks = tree.children
    .filter((c) => c !== h1)
    .map(blockFor)
    .filter((b): b is KitBlock => b !== null)
  return { title: toText(h1.children as KitInline[]).trim(), blocks }
}
