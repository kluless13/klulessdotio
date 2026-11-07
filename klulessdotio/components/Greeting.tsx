"use client"

import { useEffect, useState } from "react"
import { GREETINGS } from "@/lib/content"

const ROTATE_MS = 5000
const FADE_MS = 500

/** Screen readers get one stable greeting while the visible one rotates through languages. */
export function Greeting({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let swap = 0
    const timer = window.setInterval(() => {
      setVisible(false)
      swap = window.setTimeout(() => {
        setIndex((current) => (current + 1) % GREETINGS.length)
        setVisible(true)
      }, FADE_MS)
    }, ROTATE_MS)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(swap)
    }
  }, [])

  const greeting = GREETINGS[index]
  return (
    <h1 className={`greeting ${className ?? ""}`} aria-label={GREETINGS[0].text}>
      <span aria-hidden="true" lang={greeting.lang} dir={greeting.dir} style={{ opacity: visible ? 1 : 0 }}>
        {greeting.text}
      </span>
    </h1>
  )
}
