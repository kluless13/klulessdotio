"use client"

import { useEffect, useRef } from "react"
import { useSky } from "@/components/sky/SkyProvider"
import { sceneFor } from "@/lib/sky/model"

const WORD = "Angad"

/** Draws the word as a mask for the glass and as its thin bright edge, so the two line up exactly. */
function drawWord(scene: HTMLElement, glass: HTMLElement, edge: HTMLCanvasElement): void {
  const ratio = Math.min(2, window.devicePixelRatio || 1)
  const width = scene.clientWidth
  const size = width * (width < 640 ? 0.31 : 0.25)
  const height = Math.round(size * 0.95)
  const family = getComputedStyle(document.body).fontFamily
  const paint = (canvas: HTMLCanvasElement, outlined: boolean): void => {
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    const context = canvas.getContext("2d")
    if (!context) return
    context.scale(ratio, ratio)
    context.font = `500 ${size}px ${family}`
    if ("letterSpacing" in context) context.letterSpacing = `${-size * 0.05}px`
    context.textAlign = "right"
    context.textBaseline = "alphabetic"
    // Sits in the bottom right, with the g dipping below the edge
    const x = width * 0.975
    const y = size * 0.84
    if (!outlined) {
      context.fillStyle = "#000"
      context.fillText(WORD, x, y)
      return
    }
    context.lineWidth = Math.max(2, size * 0.007)
    context.strokeStyle = "rgba(255,255,255,.62)"
    context.lineJoin = "round"
    context.strokeText(WORD, x, y)
    // Cutting the letter shapes out of the stroke leaves only a clean outer edge
    context.globalCompositeOperation = "destination-out"
    context.fillStyle = "#000"
    context.fillText(WORD, x, y)
    context.globalCompositeOperation = "source-over"
    context.fillStyle = "rgba(255,255,255,.07)"
    context.fillText(WORD, x, y)
  }
  const mask = document.createElement("canvas")
  paint(mask, false)
  paint(edge, true)
  edge.style.width = `${width}px`
  edge.style.height = `${height}px`
  const url = `url(${mask.toDataURL("image/png")})`
  glass.style.height = `${height}px`
  glass.style.setProperty("-webkit-mask-image", url)
  glass.style.setProperty("mask-image", url)
}

export function PageBottom() {
  const { weather, view } = useSky()
  const sceneRef = useRef<HTMLElement>(null)
  const glassRef = useRef<HTMLDivElement>(null)
  const edgeRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    const glass = glassRef.current
    const edge = edgeRef.current
    if (!scene || !glass || !edge) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let queued = 0
    // The word's position is tied directly to scrolling, so it rises slowly and sinks back when you scroll away
    const reveal = () => {
      queued = 0
      const rect = scene.getBoundingClientRect()
      const travel = Math.max(1, Math.min(window.innerHeight * 0.62, rect.height * 0.78))
      const t = Math.max(0, Math.min(1, (window.innerHeight - rect.top - rect.height * 0.22) / travel))
      const eased = t * t * (3 - 2 * t)
      for (const element of [glass, edge]) {
        element.style.opacity = String(eased)
        element.style.transform = reduced ? "none" : `translateY(${(1 - eased) * 58}%)`
      }
    }
    const onScroll = () => {
      if (!queued) queued = window.requestAnimationFrame(reveal)
    }
    const redraw = () => {
      drawWord(scene, glass, edge)
      reveal()
    }
    const observer = new ResizeObserver(redraw)
    observer.observe(scene)
    window.addEventListener("scroll", onScroll, { passive: true })
    void document.fonts.ready.then(redraw)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.cancelAnimationFrame(queued)
    }
  }, [])

  return (
    <section className="scene" ref={sceneRef} aria-hidden="true" data-testid="scene">
      <img className="scene-photo" src={sceneFor(weather, view.afterSunset)} alt="" loading="lazy" decoding="async" />
      <div className="veil v1" />
      <div className="veil v2" />
      <div className="veil v3" />
      <div className="veil v4" />
      <div className="veil v5" />
      <div className="scene-glass" ref={glassRef} />
      <canvas className="scene-edge" ref={edgeRef} />
    </section>
  )
}
