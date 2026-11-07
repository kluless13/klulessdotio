"use client"

import { useEffect, useRef } from "react"
import { type Sky, useSky } from "@/components/sky/SkyProvider"
import { type SkyView, type Weather, fallbackGradient, glowPosition, skyView } from "@/lib/sky/model"
import { FRAG, UNIFORMS, VERT } from "@/lib/sky/shader"

type Uniforms = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>

const FRAME_MS = 1000 / 30
const TONE_RATE = 3.7
const MIN_LIGHT_LUMINANCE = 0.27
const MAX_DARK_LUMINANCE = 0.15

function createProgram(gl: WebGLRenderingContext): Uniforms {
  const compile = (type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type)
    if (!shader) throw new Error("Could not create shader")
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed")
    return shader
  }
  const program = gl.createProgram()
  if (!program) throw new Error("Could not create program")
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Link failed")
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, "p")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  return Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Uniforms
}

interface Lightning {
  next: number
  x: number
  y: number
  pulses: ReadonlyArray<{ at: number; size: number }>
}

/** Short bursts of two or three pulses, at least seven seconds apart. */
function planLightning(seconds: number): Lightning {
  const count = Math.random() < 0.35 ? 3 : 2
  const pulses = Array.from({ length: count }, (_, index) => ({
    at: seconds + index * (0.2 + Math.random() * 0.12),
    size: index === 0 ? 0.55 + Math.random() * 0.2 : 0.75 + Math.random() * 0.25,
  }))
  return { next: seconds + 7 + Math.random() * 14, x: 0.12 + Math.random() * 0.76, y: 0.45 + Math.random() * 0.45, pulses }
}

function flashAmount(lightning: Lightning, seconds: number): number {
  const total = lightning.pulses.reduce((sum, pulse) => {
    const age = seconds - pulse.at
    return age < 0 ? sum : sum + pulse.size * Math.exp(-age * 9)
  }, 0)
  return Math.min(1, total)
}

interface Frame {
  view: SkyView
  cover: number | null
  weather: Weather
  seconds: number
  tone: number
  flash: number
  flashX: number
  flashY: number
}

function drawFrame(gl: WebGLRenderingContext, uniforms: Uniforms, width: number, height: number, frame: Frame): void {
  const { view, cover, weather, seconds, tone, flash, flashX, flashY } = frame
  const [top, mid, hor, lit, shade, sun] = view.colours
  const [sunX, sunY] = glowPosition(view)
  const liveCover = cover === null ? view.base.cover : Math.max(cover, weather === "clear" ? 0 : view.base.cover * 0.6)
  gl.uniform2f(uniforms.uRes, width, height)
  gl.uniform1f(uniforms.uT, seconds)
  gl.uniform1f(uniforms.uCover, liveCover)
  gl.uniform1f(uniforms.uRain, view.base.rain)
  gl.uniform1f(uniforms.uFog, view.base.fog)
  gl.uniform1f(uniforms.uGray, view.base.gray)
  gl.uniform1f(uniforms.uDark, view.base.dark)
  gl.uniform1f(uniforms.uNight, view.night)
  gl.uniform1f(uniforms.uFlash, flash)
  gl.uniform2f(uniforms.uFlashPos, flashX, flashY)
  gl.uniform1f(uniforms.uMinL, MIN_LIGHT_LUMINANCE * tone)
  gl.uniform1f(uniforms.uMaxL, MAX_DARK_LUMINANCE + (1 - MAX_DARK_LUMINANCE) * tone)
  gl.uniform2f(uniforms.uSun, sunX, sunY)
  gl.uniform3fv(uniforms.uTop, top)
  gl.uniform3fv(uniforms.uMid, mid)
  gl.uniform3fv(uniforms.uHor, hor)
  gl.uniform3fv(uniforms.uLit, lit)
  gl.uniform3fv(uniforms.uShade, shade)
  gl.uniform3fv(uniforms.uSunCol, sun)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

/** Lets the contrast test draw any state and read the pixels back. Only present in test builds. */
function installAudit(gl: WebGLRenderingContext, uniforms: Uniforms, canvas: HTMLCanvasElement): () => void {
  const hook = (hour: number, weather: Weather, xs: readonly [number, number], ys: readonly [number, number], n: number, flash = 0): number[][] => {
    const view = skyView({ hour, weather, date: new Date() })
    drawFrame(gl, uniforms, canvas.width, canvas.height, { view, cover: null, weather, seconds: 5, tone: view.light ? 1 : 0, flash, flashX: 0.5, flashY: 0.5 })
    const pixel = new Uint8Array(4)
    const out: number[][] = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = Math.floor((xs[0] + ((xs[1] - xs[0]) * i) / (n - 1)) * (canvas.width - 1))
        const y = Math.floor((1 - (ys[0] + ((ys[1] - ys[0]) * j) / (n - 1))) * (canvas.height - 1))
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
        out.push([pixel[0] / 255, pixel[1] / 255, pixel[2] / 255])
      }
    }
    return out
  }
  ;(window as unknown as { __skyAudit?: typeof hook }).__skyAudit = hook
  return () => {
    delete (window as unknown as { __skyAudit?: typeof hook }).__skyAudit
  }
}

function installLoop(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, uniforms: Uniforms, latest: { current: Sky }, reduced: boolean) {
  let tone: number | null = null
  let lightning: Lightning = { next: 0, x: 0.5, y: 0.7, pulses: [] }
  let raf = 0
  let previous = 0
  let drawn = 0

  const render = (ms: number) => {
    const { view, weather, cover, ready } = latest.current
    if (!ready) return
    const seconds = reduced ? 12 : ms / 1000
    if (weather === "storm" && !reduced && seconds >= lightning.next) lightning = planLightning(seconds)
    const goal = view.light ? 1 : 0
    const elapsed = Math.min(0.2, (ms - previous) / 1000)
    // The first frame starts on the right tone. After that, changes ease in.
    tone = tone === null || reduced ? goal : tone + (goal - tone) * (1 - Math.exp(-elapsed * TONE_RATE))
    previous = ms
    const flash = weather === "storm" && !reduced ? flashAmount(lightning, seconds) : 0
    drawFrame(gl, uniforms, canvas.width, canvas.height, { view, weather, cover, seconds, tone, flash, flashX: lightning.x, flashY: lightning.y })
  }
  const frame = (ms: number) => {
    raf = window.requestAnimationFrame(frame)
    if (ms - drawn < FRAME_MS) return
    drawn = ms
    render(ms)
  }
  const start = () => {
    window.cancelAnimationFrame(raf)
    if (!reduced && !document.hidden) raf = window.requestAnimationFrame(frame)
  }
  const stop = () => window.cancelAnimationFrame(raf)
  return { render, start, stop }
}

export function SkyCanvas() {
  const sky = useSky()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const latest = useRef(sky)
  const redraw = useRef<(() => void) | null>(null)

  useEffect(() => {
    latest.current = sky
    if (sky.ready) canvasRef.current?.classList.add("sky-ready")
    redraw.current?.()
  }, [sky])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false })
    if (!gl) {
      canvas.style.display = "none"
      return
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let loop: ReturnType<typeof installLoop> | null = null
    let removeAudit = () => undefined as void

    const resize = () => {
      // Half resolution keeps the shader cheap, and the sky has no fine detail to lose
      const w = Math.max(1, Math.round(window.innerWidth / 2))
      const h = Math.max(1, Math.round(window.innerHeight / 2))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
    }
    const begin = () => {
      try {
        const uniforms = createProgram(gl)
        resize()
        canvas.style.display = ""
        loop = installLoop(canvas, gl, uniforms, latest, reduced)
        redraw.current = reduced ? () => loop?.render(0) : null
        if (reduced) loop.render(0)
        else loop.start()
        removeAudit()
        removeAudit = process.env.NEXT_PUBLIC_SKY_AUDIT === "1" ? installAudit(gl, uniforms, canvas) : () => undefined
      } catch (error) {
        console.error("Could not start the sky", error)
        canvas.style.display = "none"
      }
    }
    // A sleeping laptop can take the graphics context away. The gradient shows until it comes back.
    const onLost = (event: Event) => {
      event.preventDefault()
      loop?.stop()
      loop = null
      redraw.current = null
      canvas.style.display = "none"
    }
    const onVisibility = () => {
      if (document.hidden) loop?.stop()
      else loop?.start()
    }
    const onResize = () => {
      resize()
      if (reduced) loop?.render(0)
    }
    begin()
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", begin)
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("resize", onResize)
    return () => {
      loop?.stop()
      redraw.current = null
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", begin)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", onResize)
      removeAudit()
    }
  }, [])

  // The wash starts from CSS, matched to the time of day by the script in the page head, then follows the sky
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-wash" style={sky.ready ? { backgroundImage: fallbackGradient(sky.view) } : undefined} />
      <canvas ref={canvasRef} className="sky-canvas" data-testid="sky-canvas" />
    </div>
  )
}
