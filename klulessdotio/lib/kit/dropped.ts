import type { List, RootContent } from "mdast"
import type { ContainerDirective } from "mdast-util-directive"
import { safeHref } from "./inline"
import type { KitIssue } from "./validate"

type Block = RootContent

// Directive names the parser turns into blocks at the top level. Unknown names, and a card or
// path outside its owner, are reported by the validator already, so they are skipped here.
const TOP_LEVEL = new Set(["steps", "paths", "timeline", "before-after", "prompt", "job", "phrases", "ending"])
const KNOWN = new Set([...TOP_LEVEL, "card", "path", "note", "fill"])

const lineOf = (n: Block, fallback: number) => n.position?.start.line ?? fallback

function describe(n: Block): string {
  switch (n.type) {
    case "table":
      return "A table"
    case "blockquote":
      return "A quote"
    case "thematicBreak":
      return "A divider (---)"
    case "code":
      return "A code block"
    case "heading":
      return `A level ${n.depth} heading`
    case "list":
      return "A list"
    case "paragraph":
      return "A paragraph"
    case "definition":
    case "footnoteDefinition":
      return "A link or footnote definition"
    case "containerDirective":
    case "leafDirective":
      return `A ${n.name} directive`
    default:
      return `A ${n.type} block`
  }
}

class Reporter {
  constructor(private readonly out: KitIssue[]) {}

  drop(n: Block, fallback: number): void {
    // Raw HTML has its own message, and unknown directives are reported by the validator
    if (n.type === "html") return
    if ((n.type === "containerDirective" || n.type === "leafDirective") && !KNOWN.has(n.name)) return
    this.out.push({
      line: lineOf(n, fallback),
      message: `${describe(n)} is not supported here and would be dropped.`,
    })
  }

  /** Text-only blocks: paragraphs, lists and quotes, nested as deep as they go. */
  flat(children: readonly Block[], fallback: number): void {
    for (const c of children) {
      if (c.type === "paragraph") continue
      if (c.type === "list") for (const item of c.children) this.flat(item.children, lineOf(item, fallback))
      else if (c.type === "blockquote") this.flat(c.children, lineOf(c, fallback))
      else this.drop(c, fallback)
    }
  }

  /** List items that keep only their paragraphs. */
  paragraphItems(list: List, fallback: number): void {
    for (const item of list.children) {
      for (const c of item.children) if (c.type !== "paragraph") this.drop(c, lineOf(item, fallback))
    }
  }

  /** Children that must be exactly one list (the first one counts), flat or paragraphs-only inside. */
  onlyFirstList(d: ContainerDirective, line: number, items: "paragraphs" | "flat"): void {
    const first = d.children.find((c) => c.type === "list")
    for (const c of d.children) {
      if (c === first && c.type === "list") {
        if (items === "flat") this.flat([c], line)
        else this.paragraphItems(c, line)
      } else this.drop(c, line)
    }
  }
}

function containerIssues(r: Reporter, d: ContainerDirective, line: number, out: KitIssue[]): void {
  switch (d.name) {
    case "steps":
      if (!d.children.some((c) => c.type === "list")) out.push({ line, message: "Steps needs a list." })
      else r.onlyFirstList(d, line, "paragraphs")
      break
    case "phrases":
      // A missing list is reported by the phrases check
      if (d.children.some((c) => c.type === "list")) r.onlyFirstList(d, line, "paragraphs")
      break
    case "timeline":
    case "card":
      r.flat(d.children, line)
      break
    case "before-after": {
      const first = d.children.find((c) => c.type === "list")
      for (const c of d.children) {
        if (c === first && c.type === "list") r.paragraphItems(c, line)
        else if (c.type === "list") r.drop(c, line)
        else r.flat([c], line)
      }
      break
    }
    case "prompt":
      // A wrong number of code blocks is reported by the prompt check
      if (d.children.filter((c) => c.type === "code").length === 1) {
        for (const c of d.children) if (c.type !== "code") r.drop(c, line)
      }
      break
    case "ending": {
      const first = d.children.find((c) => c.type === "list")
      for (const c of d.children) {
        if (c.type === "paragraph" || (c.type === "containerDirective" && c.name === "card")) continue
        if (c === first && c.type === "list") r.flat([c], line)
        else r.drop(c, line)
      }
      break
    }
    case "paths": {
      // Text before the first ::path is reported by the paths check
      const at = d.children.findIndex((c) => c.type === "leafDirective" && c.name === "path")
      if (at >= 0) r.flat(d.children.slice(at + 1).filter((c) => !(c.type === "leafDirective" && c.name === "path")), line)
      break
    }
    case "job":
      // Order and extras are reported by the job check; only the quote's own content is checked here
      for (const c of d.children) {
        if (c.type === "blockquote") for (const q of c.children) if (q.type !== "paragraph") r.drop(q, lineOf(c, line))
      }
      break
    default:
      break
  }
}

/** Everything the parser would silently lose: unsupported blocks, and inline markup it can't render. */
export function droppedBlockIssues(top: readonly Block[], out: KitIssue[]): void {
  const r = new Reporter(out)
  let titleSeen = false
  const walkContainers = (children: readonly Block[], line: number) => {
    for (const c of children) {
      if (c.type === "containerDirective") {
        const at = lineOf(c, line)
        containerIssues(r, c, at, out)
        walkContainers(c.children, at)
      }
    }
  }

  for (const c of top) {
    if (c.type === "heading") {
      if (c.depth === 1) {
        // The first # is the title; a second one would vanish
        if (titleSeen) r.drop(c, 1)
        titleSeen = true
      } else if (c.depth > 3) {
        r.drop(c, 1)
      }
    } else if (c.type === "paragraph" || (c.type === "leafDirective" && c.name === "path")) {
      continue
    } else if (c.type === "list") {
      r.paragraphItems(c, lineOf(c, 1))
    } else if (c.type === "containerDirective") {
      if (KNOWN.has(c.name) && !TOP_LEVEL.has(c.name) && c.name !== "card" && c.name !== "path") r.drop(c, 1)
    } else {
      r.drop(c, 1)
    }
  }
  walkContainers(top, 1)
}

/** Inline markup the parser can't render faithfully. */
export function inlineIssue(node: { type: string; url?: string }): string | null {
  switch (node.type) {
    case "image":
    case "imageReference":
      return "An image is not supported and would be dropped."
    case "linkReference":
    case "footnoteReference":
      return "A reference link or footnote is not supported and would be dropped."
    case "inlineCode":
      return "Inline code (backticks) would show as plain text. Remove the backticks."
    case "link":
      return node.url && safeHref(node.url) ? null : "Link must start with / or https://, otherwise it would lose its link."
    default:
      return null
  }
}
