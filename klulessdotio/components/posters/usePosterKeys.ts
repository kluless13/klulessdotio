"use client"

import { useEffect } from "react"
import { POSTERS, nextIndex } from "@/lib/posters"

/** Left and right arrow keys move between posters while `active`. */
export function usePosterKeys(index: number, onIndex: (next: number) => void, active = true): void {
  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onIndex(nextIndex(index, 1, POSTERS.length))
      if (event.key === "ArrowLeft") onIndex(nextIndex(index, -1, POSTERS.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, onIndex, active])
}
