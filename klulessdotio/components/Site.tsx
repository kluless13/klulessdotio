"use client"

import { AnimatePresence } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { KitBar } from "@/components/KitBar"
import { NoiseView } from "@/components/noise/NoiseView"
import { PosterViewer } from "@/components/posters/PosterViewer"
import { QuietView } from "@/components/quiet/QuietView"
import { SkyCanvas } from "@/components/sky/SkyCanvas"
import { SkyProvider } from "@/components/sky/SkyProvider"
import { type Mode, readMode, writeMode } from "@/lib/mode"

function browserStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function Site() {
  const [mode, setMode] = useState<Mode>("noise")
  const [posters, setPosters] = useState(false)
  const noiseRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const closePosters = useCallback(() => setPosters(false), [])
  const openPosters = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null
    setPosters(true)
  }, [])

  useEffect(() => {
    setMode(readMode(browserStorage()))
    // From here React decides what's hidden, so the head script's early hint can go
    window.requestAnimationFrame(() => document.documentElement.classList.remove("start-quiet"))
  }, [])

  const hideNoise = mode === "quiet" || posters
  useEffect(() => {
    if (noiseRef.current) noiseRef.current.inert = hideNoise
    document.documentElement.classList.toggle("no-scroll", hideNoise)
    // Keyboard users go back to the button that opened the posters
    if (!hideNoise && openerRef.current) {
      openerRef.current.focus({ preventScroll: true })
      openerRef.current = null
    }
  }, [hideNoise])

  const change = useCallback((next: Mode) => {
    setMode(next)
    writeMode(browserStorage(), next)
  }, [])

  return (
    <SkyProvider>
      <SkyCanvas />
      <div ref={noiseRef} className={`layer ${hideNoise ? "layer-hidden" : ""}`} data-testid="noise">
        {/* Inside the Noise layer, so Quiet and the posters hide it too */}
        <KitBar />
        <NoiseView onPosters={openPosters} onQuiet={() => change("quiet")} />
      </div>
      <AnimatePresence>
        {mode === "quiet" ? <QuietView key="quiet" onNoise={() => change("noise")} /> : null}
        {posters ? <PosterViewer key="posters" onClose={closePosters} /> : null}
      </AnimatePresence>
    </SkyProvider>
  )
}
