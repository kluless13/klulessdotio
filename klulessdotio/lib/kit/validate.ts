import type { Paragraph, Root, RootContent } from "mdast"
import type { ContainerDirective, TextDirective } from "mdast-util-directive"
import { applyNotes, highlightTexts, NoteError, safeHref, toText, type KitInline } from "./inline"
import { hasLabel, parseTree } from "./parse"

export interface KitIssue {
  line: number
  message: string
}

const DIRECTIVES = new Set(["steps", "paths", "path", "timeline", "before-after", "prompt", "job", "ending", "card", "note", "fill", "phrases"])

type AnyNode = Root | RootContent

function textIssues(markdown: string): KitIssue[] {
  const issues: KitIssue[] = []
  let fence: string | null = null
  markdown.split("\n").forEach((text, i) => {
    const line = i + 1
    if (text.includes("—")) issues.push({ line, message: "Em dash found. Rewrite the sentence without one." })
    const marker = /^\s*(```|~~~)/.exec(text)?.[1]
    if (marker && (fence === null || fence === marker)) fence = fence === null ? marker : null
    else if (fence === null && /^\s*\[/.test(text)) issues.push({ line, message: "Line starts with a bracket. Remove the leftover bracketed note." })
  })
  return issues
}

const isPlain = (c: RootContent) => c.type === "paragraph" && !hasLabel(c, "Before") && !hasLabel(c, "Connect")

/** A job's own text is Before:, the quoted request and Connect:, then at most one closing paragraph. */
function jobOrderIssues(node: ContainerDirective, add: (message: string) => void): void {
  const connectAt = node.children.findIndex((c) => hasLabel(c, "Connect"))
  if (connectAt < 0) return
  if (node.children.slice(0, connectAt).some(isPlain)) {
    add("Move this job's extra paragraph after Connect:, or start it with Before: or Connect:.")
  }
  if (node.children.slice(connectAt + 1).filter(isPlain).length > 1) add("A job takes at most one paragraph after Connect.")
}

/** Phrases hold one list, and each item opens with the phrase in bold. */
function phrasesIssues(node: ContainerDirective, line: number, out: KitIssue[]): void {
  const list = node.children.find((c) => c.type === "list")
  if (!list || list.type !== "list") {
    out.push({ line, message: "Phrases needs a list of bold phrases." })
    return
  }
  for (const item of list.children) {
    const first = item.children[0]
    if (first?.type !== "paragraph" || first.children[0]?.type !== "strong") {
      out.push({ line: item.position?.start.line ?? line, message: "Each phrase must start with bold text." })
    }
  }
}

function directiveIssues(node: ContainerDirective, line: number, out: KitIssue[]): void {
  const attrs = node.attributes ?? {}
  const add = (message: string) => out.push({ line, message })
  if (node.name === "prompt") {
    const codes = node.children.filter((c) => c.type === "code").length
    if (codes !== 1) add(`A prompt needs exactly one code block, found ${codes}.`)
  } else if (node.name === "timeline") {
    for (const key of ["find", "decide", "fix"]) {
      const v = attrs[key]
      if (v == null || v === "" || !Number.isFinite(Number(v))) add(`Timeline needs a numeric "${key}".`)
    }
  } else if (node.name === "job") {
    if (!node.children.some((c) => hasLabel(c, "Before"))) add("Job is missing a Before: paragraph.")
    if (!node.children.some((c) => c.type === "blockquote")) add("Job is missing its quoted request.")
    if (!node.children.some((c) => hasLabel(c, "Connect"))) add("Job is missing a Connect: paragraph.")
    jobOrderIssues(node, add)
  } else if (node.name === "phrases") {
    phrasesIssues(node, line, out)
  } else if (node.name === "card") {
    if (!attrs.title) add("Ending card needs a title.")
    if (!attrs.cta !== !attrs.href) add("A card cta needs both a label (cta) and an href.")
    else if (attrs.href && !safeHref(attrs.href)) add("Card href must start with / or https://.")
  }
}

interface Ctx {
  line: number
  parent: string // name of the enclosing container directive, or "" at the top level
  direct?: boolean // the node sits directly in that container, not in a list or quote inside it
}

function noteIssues(p: Paragraph, ctx: Ctx, out: KitIssue[]): void {
  const kids = p.children as KitInline[]
  const notes = kids.filter((k): k is TextDirective => k.type === "textDirective" && k.name === "note")
  if (!notes.length) return
  const lineOf = (on?: string) =>
    (notes.find((k) => String(k.attributes?.on ?? "") === on) ?? notes[0]).position?.start.line ??
    ctx.line
  // A path's own paragraphs can carry notes; anything else inside a directive can't
  if (ctx.parent && !(ctx.parent === "paths" && ctx.direct)) {
    out.push({ line: lineOf(), message: "Notes are only allowed in paragraphs and list items." })
    return
  }
  try {
    applyNotes(highlightTexts(kids))
  } catch (e) {
    if (!(e instanceof NoteError)) throw e
    out.push({ line: lineOf(e.on), message: e.message + "." })
  }
}

const OWNERS: Record<string, string> = { card: "ending", path: "paths" }

function nodeIssues(node: AnyNode, out: KitIssue[], ctx: Ctx): void {
  const line = node.position?.start.line ?? ctx.line
  if (node.type === "html") {
    out.push({ line, message: "Raw HTML is not allowed." })
  } else if (node.type === "containerDirective" || node.type === "leafDirective" || node.type === "textDirective") {
    if (!DIRECTIVES.has(node.name)) out.push({ line, message: `Unknown directive "${node.name}".` })
    const owner = OWNERS[node.name]
    if (owner && node.type !== "textDirective" && ctx.parent !== owner) {
      out.push({ line, message: `A ${node.name} must sit inside ${owner}.` })
    }
    if (node.type === "containerDirective") directiveIssues(node, line, out)
  } else if (node.type === "paragraph") {
    if (/^:+$/.test(toPlain(node).trim())) out.push({ line, message: "Stray directive fence." })
    noteIssues(node, { line, parent: ctx.parent, direct: ctx.direct }, out)
  } else if (node.type === "heading") {
    noteIssues({ ...node, type: "paragraph" }, { line, parent: "heading" }, out)
  }
  const parent = node.type === "containerDirective" ? node.name : ctx.parent
  const direct = node.type === "containerDirective"
  if ("children" in node) for (const c of node.children as RootContent[]) nodeIssues(c, out, { line, parent, direct })
}

const toPlain = (p: Paragraph) => toText(p.children as KitInline[])

export function validateKit(markdown: string): readonly KitIssue[] {
  const issues = textIssues(markdown)
  const tree = parseTree(markdown)
  if (!tree.children.some((c) => c.type === "heading" && c.depth === 1)) {
    issues.push({ line: 1, message: "The kit needs a # title." })
  }
  nodeIssues(tree, issues, { line: 1, parent: "" })
  return issues.sort((a, b) => a.line - b.line)
}
