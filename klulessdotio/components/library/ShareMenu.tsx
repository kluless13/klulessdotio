"use client"

import { Link2, Share2 } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type RefObject } from "react"
import { itemUrl } from "@/lib/library/history"

const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function"

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError"

/** The lowest point the menu can reach before something scrolls or clips it. */
function clipBottom(menu: HTMLElement): number {
  for (let el = menu.parentElement; el; el = el.parentElement) {
    if (getComputedStyle(el).overflowY !== "visible") return el.getBoundingClientRect().bottom
  }
  return window.innerHeight
}

interface ShareMenuProps {
  slug: string
  title: string
  onClose: () => void
  onCopied: () => void
  /** The button that opened the menu. Pressing it again toggles the menu instead of counting as a click outside. */
  anchorRef?: RefObject<HTMLElement>
}

/** Share's small menu: copy the item's link, or hand it to the device's share sheet where there is one. */
export function ShareMenu({ slug, title, onClose, onCopied, anchorRef }: ShareMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [above, setAbove] = useState(false)
  const url = itemUrl(slug)
  const display = url.replace(/^https:\/\//, "")

  // Opens below Share, or above it when the sheet would cut it off.
  useLayoutEffect(() => {
    const menu = menuRef.current
    if (menu && menu.getBoundingClientRect().bottom > clipBottom(menu)) setAbove(true)
  }, [])

  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target || menuRef.current?.contains(target) || anchorRef?.current?.contains(target)) return
      onClose()
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [onClose, anchorRef])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      onCopied()
    } catch {
      // Clipboard refused (permissions or an insecure page): nothing was copied, so say nothing.
    }
    onClose()
  }

  const share = async () => {
    try {
      await navigator.share({ title, url })
    } catch (error) {
      // A share sheet that fails for any reason but the person cancelling falls back to copying.
      if (!isAbort(error)) return copy()
    }
    onClose()
  }

  // The menu owns these keys while it has focus: Escape closes it, not the sheet, and arrows move between items.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation()
      onClose()
      anchorRef?.current?.focus()
      return
    }
    if (!event.key.startsWith("Arrow")) return
    event.stopPropagation()
    event.preventDefault()
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])]
    const at = items.indexOf(document.activeElement as HTMLElement)
    const delta = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1
    items[(at + delta + items.length) % items.length]?.focus()
  }

  // Tabbing out of the menu closes it.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null
    if (next && !menuRef.current?.contains(next) && !anchorRef?.current?.contains(next)) onClose()
  }

  return (
    <div className="lib-share-menu" data-above={above || undefined} role="menu" aria-label="Share" ref={menuRef} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button type="button" role="menuitem" className="lib-share-item" onClick={copy}>
        <Link2 size={16} aria-hidden="true" />
        <span className="lib-share-words">
          <span className="lib-share-label">Copy link</span>
          <span className="lib-share-detail">{display}</span>
        </span>
      </button>
      {canShare() ? (
        <button type="button" role="menuitem" className="lib-share-item" onClick={share}>
          <Share2 size={16} aria-hidden="true" />
          <span className="lib-share-words">
            <span className="lib-share-label">More options</span>
            <span className="lib-share-detail">Your device&apos;s share sheet</span>
          </span>
        </button>
      ) : null}
    </div>
  )
}
