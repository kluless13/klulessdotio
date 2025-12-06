"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"

interface MatrixRainProps {
  onClose?: () => void
}

export function MatrixRain({ onClose }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef(0)
  const rabbitRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Matrix characters - Japanese Katakana, numbers, and some Chinese
    const matrixChars =
      "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789一二三四五六七八九十"
    const fontSize = 20
    // Tighter columns and more frequent resets for ~40% denser rain
    const columnWidth = fontSize * 0.8
    const columns = Math.floor(canvas.width / columnWidth)

    // Array of drop positions
    const drops: number[] = Array(columns).fill(1)

    // Pick a few columns whose leading glyph will be bright white
    const highlightColumns = new Set<number>()
    const numHighlights = Math.max(3, Math.floor(columns * 0.05))
    while (highlightColumns.size < numHighlights) {
      highlightColumns.add(Math.floor(Math.random() * columns))
    }

    // Colors matching site theme
    const primaryColor = "rgba(212, 165, 116, 0.9)" // Yellow-orange
    const headColor = "rgba(255, 255, 255, 0.95)" // Bright white for some leading glyphs

    // Initialise rabbit position (stationary, near middle-bottom of the screen)
    rabbitRef.current = {
      x: canvas.width * 0.5,
      y: canvas.height * 0.7,
    }

    function draw() {
      if (!ctx || !canvas) return

      // Create trailing effect (slightly stronger for slower rain)
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px JetBrains Mono, monospace`

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)]
        const x = i * columnWidth
        const y = drops[i] * fontSize

        const isHighlight = highlightColumns.has(i)
        ctx.fillStyle = isHighlight ? headColor : primaryColor

        ctx.fillText(char, x, y)

        // Reset drop randomly or when it reaches bottom
        if (y > canvas.height && Math.random() > 0.94) {
          drops[i] = 0
        }

        // Move a bit faster for more visible streams
        drops[i] += 1.4
      }

      // Draw the white rabbit (stationary, no trail, with a clear halo for visibility on mobile)
      if (rabbitRef.current) {
        const rabbit = rabbitRef.current
        const baseSize = Math.max(32, canvas.width * 0.08)
        const radius = baseSize * 0.9

        ctx.save()
        // Dark circular halo behind the rabbit so it stands out from the rain
        ctx.beginPath()
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
        ctx.arc(rabbit.x, rabbit.y - radius * 0.15, radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw the emoji itself, centered in the halo
        ctx.font = `${baseSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("🐇", rabbit.x, rabbit.y - radius * 0.15)
        ctx.restore()
      }
    }

    // Animation loop (slow, spaced-out effect inspired by TMatrix:
    // https://github.com/M4444/TMatrix and its preview
    // https://raw.githubusercontent.com/M4444/TMatrix/master/assets/img/TMatrix.gif)
    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time
      }
      const delta = time - lastTimeRef.current

      // Only draw about ~12fps for slower motion
      if (delta > 80) {
        draw()
        lastTimeRef.current = time
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !rabbitRef.current || !onClose) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const dx = x - rabbitRef.current.x
    const dy = y - rabbitRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If user "catches" the rabbit, escape the rain
    if (distance < 30) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black" onClick={handleClick}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

export function MatrixRainTrigger({ label }: { label: string }) {
  const [isActive, setIsActive] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsActive(true)}
        variant="outline"
        size="sm"
        className="border-primary/20 hover:border-primary hover:bg-primary/10"
      >
        <Terminal className="h-4 w-4 mr-2" />
        {label}
      </Button>

      {isActive && <MatrixRain onClose={() => setIsActive(false)} />}
    </>
  )
}

