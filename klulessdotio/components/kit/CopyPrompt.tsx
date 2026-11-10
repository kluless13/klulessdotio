"use client"

import { GeistMono } from "geist/font/mono"
import { Copy } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

const COPIED_MS = 2000

/** Select the prompt's text so it can be copied by hand when the clipboard is out of reach. */
function selectText(el: HTMLElement | null): void {
  const selection = window.getSelection()
  if (!el || !selection) return
  const range = document.createRange()
  range.selectNodeContents(el)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * The starting prompt: the only mono text on the page, with a button that copies it exactly.
 * Each line is its own block so blank lines can be shorter than text lines; the text content stays exact.
 */
export function CopyPrompt({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLPreElement>(null)
  const titleId = useId()
  const lines = text.split("\n")

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      selectText(codeRef.current)
    }
  }

  return (
    <section className="kit-prompt kit-wide" aria-labelledby={titleId}>
      <div className="kit-prompt-head">
        <h3 className="kit-prompt-title" id={titleId}>
          The starting prompt
        </h3>
        <button type="button" className="btn kit-prompt-copy" onClick={copy}>
          <span aria-live="polite">{copied ? "Copied" : "Copy prompt"}</span>
          <Copy size={15} aria-hidden="true" />
        </button>
      </div>
      <pre ref={codeRef} className={`kit-prompt-code ${GeistMono.className}`}>
        {lines.map((line, i) => (
          <span key={i} className={line ? "kit-prompt-line" : "kit-prompt-gap"}>
            {line}
            {i < lines.length - 1 ? "\n" : null}
          </span>
        ))}
      </pre>
    </section>
  )
}
