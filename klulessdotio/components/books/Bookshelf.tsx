"use client"

import { X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { type Shelf, createShelf } from "@/components/books/shelf-engine"
import { SHELF_ERROR } from "@/components/quiet/ShelfBoundary"
import { BOOKS, type Book } from "@/lib/books"

export function Bookshelf() {
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const shelfRef = useRef<Shelf | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<Book | null>(null)
  const [failed, setFailed] = useState(false)

  const close = useCallback(() => {
    setOpen(null)
    openerRef.current?.focus()
  }, [])

  useEffect(() => {
    let cancelled = false
    import("matter-js")
      .then((module) => {
        const stage = stageRef.current
        const svg = svgRef.current
        const tip = tipRef.current
        if (cancelled || !stage || !svg || !tip) return
        const onOpen = (book: Book, element: HTMLElement) => {
          openerRef.current = element
          setOpen(book)
        }
        shelfRef.current = createShelf(module.default, stage, svg, tip, BOOKS, onOpen)
      })
      .catch((error: unknown) => {
        console.error("Bookshelf physics failed to load", error)
        setFailed(true)
      })
    return () => {
      cancelled = true
      shelfRef.current?.destroy()
      shelfRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
      // Close is the only control in the card, so Tab stays on it
      if (event.key === "Tab") {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  if (failed) return <p className="shelf-error" role="alert">{SHELF_ERROR}</p>

  return (
    <section className="shelf" aria-labelledby="reading">
      <h2 className="shelf-title" id="reading">What I'm reading</h2>
      <p className="shelf-sub">Drag the books around. Tap or click one to see its cover.</p>
      <button type="button" className="btn" onClick={() => shelfRef.current?.tidy()}>
        Tidy the shelf
      </button>
      <div className="shelf-stage" ref={stageRef} data-testid="shelf-stage">
        <div className="shelf-tip" ref={tipRef} />
        <svg className="shelf-unit" ref={svgRef} aria-hidden="true" />
      </div>
      {open ? (
        <div
          className="book-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <div className="book-card">
            <img src={`/covers/${open.slug}.jpg`} alt={`Cover of ${open.title}`} />
            <div>
              <h3 id="book-title">{open.title}</h3>
              <p>{open.author}</p>
            </div>
            <button type="button" className="btn btn-icon book-close" ref={closeRef} aria-label="Close book" onClick={close}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
