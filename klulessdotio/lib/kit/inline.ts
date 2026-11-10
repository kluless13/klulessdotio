import type { PhrasingContent, Text } from "mdast"
import type { Note } from "./types"

// Custom inline nodes produced by the kit plugins; never reach the output as-is.
export interface HighlightNode {
  type: "highlight"
  children: PhrasingContent[]
}
export interface NoteOnNode {
  type: "noteOn"
  n: number
  children: PhrasingContent[]
}
export type KitInline = PhrasingContent | HighlightNode | NoteOnNode
type Parent = { children: KitInline[] }

const hasChildren = (n: KitInline): n is KitInline & Parent => "children" in n

export function hashSeed(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Site-relative or https only. No control characters, whitespace or backslashes (browsers read `/\x` and `/<tab>/` as `//`). */
export function safeHref(url: string): string | null {
  if (/[\x00-\x20\\]/.test(url)) return null
  return /^\/(?![/\\])/.test(url) || /^https:\/\//i.test(url) ? url : null
}

export function toText(nodes: readonly KitInline[]): string {
  return nodes
    .map((n) => {
      if (n.type === "text" || n.type === "inlineCode") return n.value
      if (n.type === "break") return " "
      if (n.type === "textDirective" && n.name === "note") return ""
      return hasChildren(n) ? toText(n.children) : ""
    })
    .join("")
}

function renderNode(n: KitInline): string {
  const inner = () => (hasChildren(n) ? renderInline(n.children) : "")
  switch (n.type) {
    case "text":
    case "inlineCode":
      return escapeHtml(n.value)
    case "strong":
      return `<strong>${inner()}</strong>`
    case "emphasis":
      return `<em>${inner()}</em>`
    case "break":
      return "<br>"
    case "link": {
      const href = safeHref(n.url)
      return href ? `<a href="${escapeHtml(href)}">${inner()}</a>` : inner()
    }
    case "highlight":
      return `<mark class="hl" data-seed="${hashSeed(toText(n.children))}">${inner()}</mark>`
    case "noteOn":
      return `<span class="note-on" data-note="${n.n}">${inner()}</span>`
    case "textDirective":
      if (n.name === "fill") return `<span class="fill">${inner()}</span>`
      return n.name === "note" ? "" : inner()
    default:
      return n.type === "delete" ? inner() : "" // raw html, images, refs: dropped
  }
}

export function renderInline(nodes: readonly KitInline[]): string {
  return nodes.map(renderNode).join("")
}

/** Split `==text==` into highlight nodes inside every text node. */
export function highlightTexts(nodes: readonly KitInline[]): KitInline[] {
  return nodes.flatMap((n): KitInline[] => {
    if (n.type === "text") return splitHighlights(n)
    return hasChildren(n) ? [{ ...n, children: highlightTexts(n.children) } as KitInline] : [n]
  })
}

function splitHighlights(node: Text): KitInline[] {
  const out: KitInline[] = []
  const re = /==([^=\n]+?)==/g
  let last = 0
  for (let m = re.exec(node.value); m; m = re.exec(node.value)) {
    if (m.index > last) out.push({ type: "text", value: node.value.slice(last, m.index) })
    out.push({ type: "highlight", children: [{ type: "text", value: m[1] }] })
    last = m.index + m[0].length
  }
  if (!out.length) return [node]
  if (last < node.value.length) out.push({ type: "text", value: node.value.slice(last) })
  return out
}

/** Known limitation: note words must sit inside one text node (not across bold or link edges). */
export function containsWords(nodes: readonly KitInline[], on: string): boolean {
  return nodes.some((n) =>
    n.type === "text" ? n.value.includes(on) : hasChildren(n) && n.type !== "textDirective" && containsWords(n.children, on),
  )
}

// Same limitation as containsWords: the words are found within one text node only.
function wrapOnce(nodes: readonly KitInline[], on: string, n: number): { nodes: KitInline[]; done: boolean } {
  const out: KitInline[] = []
  let done = false
  for (const node of nodes) {
    if (done) {
      out.push(node)
    } else if (node.type === "text" && node.value.includes(on)) {
      const i = node.value.indexOf(on)
      const [pre, post] = [node.value.slice(0, i), node.value.slice(i + on.length)]
      if (pre) out.push({ type: "text", value: pre })
      out.push({ type: "noteOn", n, children: [{ type: "text", value: on }] })
      if (post) out.push({ type: "text", value: post })
      done = true
    } else if (hasChildren(node) && node.type !== "textDirective" && node.type !== "noteOn") {
      const inner = wrapOnce(node.children, on, n)
      out.push({ ...node, children: inner.nodes } as KitInline)
      done = inner.done
    } else {
      out.push(node)
    }
  }
  return { nodes: out, done }
}

function trimEnd(nodes: KitInline[]): KitInline[] {
  const last = nodes[nodes.length - 1]
  if (last?.type !== "text") return nodes
  const value = last.value.replace(/\s+$/, "")
  return [...nodes.slice(0, -1), ...(value ? [{ ...last, value }] : [])]
}

export class NoteError extends Error {
  constructor(readonly on: string) {
    super(`Note words not found in their paragraph: "${on}"`)
  }
}

/** Pull `:note` directives out of a paragraph and wrap their words. Throws if words are missing. */
export function applyNotes(
  children: readonly KitInline[],
  startAt = 0,
): { children: KitInline[]; notes: Note[] } {
  const notes: Note[] = []
  let rest: KitInline[] = []
  for (const c of children) {
    if (c.type === "textDirective" && c.name === "note") {
      notes.push({ on: String(c.attributes?.on ?? ""), text: toText(c.children) })
    } else {
      rest.push(c)
    }
  }
  if (notes.length) rest = trimEnd(rest)
  notes.forEach((note, i) => {
    const res = wrapOnce(rest, note.on, startAt + i + 1)
    if (!note.on || !res.done) throw new NoteError(note.on)
    rest = res.nodes
  })
  return { children: rest, notes }
}
