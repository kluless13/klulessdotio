"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useEffect, useRef } from "react"
import { POSTERS, nextIndex, thumbSrc } from "@/lib/posters"

export function Dock({ index, onIndex, arrows = false }: { index: number; onIndex: (next: number) => void; arrows?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const strip = scroller.current
    const current = strip?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!strip || !current) return
    const left = current.offsetLeft - strip.clientWidth / 2 + current.clientWidth / 2
    strip.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [index])

  return (
    <nav className="dock" aria-label="Posters">
      {arrows ? (
        <button type="button" className="btn btn-icon" aria-label="Previous poster" onClick={() => onIndex(nextIndex(index, -1, POSTERS.length))}>
          <ArrowLeft size={15} aria-hidden="true" />
        </button>
      ) : null}
      <div className="dock-strip" ref={scroller}>
        {POSTERS.map((poster, i) => (
          <button type="button" key={poster.slug} className="dock-thumb" aria-label={poster.title} aria-current={i === index ? "true" : undefined} onClick={() => onIndex(i)}>
            <img src={thumbSrc(poster)} alt="" loading="lazy" decoding="async" width={Math.round((poster.w / poster.h) * 180)} height={180} />
          </button>
        ))}
      </div>
      {arrows ? (
        <button type="button" className="btn btn-icon" aria-label="Next poster" onClick={() => onIndex(nextIndex(index, 1, POSTERS.length))}>
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      ) : null}
    </nav>
  )
}
