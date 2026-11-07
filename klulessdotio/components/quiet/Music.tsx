"use client"

import { useEffect, useRef, useState } from "react"
import { PLAYLIST_URL } from "@/lib/content"

/** Loads only when first opened. Hiding keeps the music going, and leaving Quiet removes the player, which stops it. */
export function Music() {
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const [hot, setHot] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Spotify's frame swallows mouse events, so an invisible strip around it catches the pointer on the way in
    const onMove = (event: PointerEvent) => setHot(Boolean(playerRef.current?.contains(event.target as Node)))
    const onLeave = (event: PointerEvent) => {
      const inside = event.clientX > 0 && event.clientY > 0 && event.clientX < window.innerWidth && event.clientY < window.innerHeight
      if (!inside) setHot(false)
    }
    document.addEventListener("pointermove", onMove)
    document.documentElement.addEventListener("pointerleave", onLeave)
    return () => {
      document.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div className="music">
      <button
        type="button"
        className="btn"
        aria-expanded={open}
        aria-controls="player"
        onClick={() => {
          setLoaded(true)
          setOpen((value) => !value)
        }}
      >
        <span className="bars" aria-hidden="true"><i /><i /><i /></span>
        {open ? "Hide player" : "Music"}
      </button>
      <div id="player" ref={playerRef} className={`player ${open ? "open" : ""} ${hot ? "hot" : ""}`}>
        {loaded ? <iframe src={PLAYLIST_URL} title="Angad's Spotify playlist" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /> : null}
      </div>
    </div>
  )
}
