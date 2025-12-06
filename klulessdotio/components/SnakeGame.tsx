"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface Position {
  x: number
  y: number
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }])
  const directionRef = useRef<Position>({ x: 0, y: 0 })
  const foodRef = useRef<Position>({ x: 15, y: 15 })
  const gameLoopRef = useRef<number>()

  const gridSize = 20
  const cellSize = 20

  const setDirection = (next: Position) => {
    const current = directionRef.current
    // Prevent 180-degree turns
    if (next.x === -current.x && next.y === -current.y) return
    directionRef.current = next
  }

  const generateFood = useCallback(() => {
    const maxX = Math.floor(400 / cellSize)
    const maxY = Math.floor(400 / cellSize)

    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
      }
    } while (snakeRef.current.some((segment) => segment.x === newFood.x && segment.y === newFood.y))

    foodRef.current = newFood
  }, [cellSize])

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }]
    directionRef.current = { x: 0, y: 0 }
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    generateFood()
  }, [generateFood])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "rgba(212, 165, 116, 0.1)"
    ctx.lineWidth = 1
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvas.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(canvas.width, i * cellSize)
      ctx.stroke()
    }

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      const alpha = 1 - (index / snakeRef.current.length) * 0.5
      ctx.fillStyle = `rgba(212, 165, 116, ${alpha})`
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
      )
    })

    // Draw food
    const food = foodRef.current
    ctx.fillStyle = "#D4A574"
    ctx.beginPath()
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2 - 2,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }, [cellSize])

  const updateGame = useCallback(() => {
    if (gameOver || isPaused) return

    const snake = snakeRef.current
    const direction = directionRef.current
    const food = foodRef.current

    if (direction.x === 0 && direction.y === 0) return

    const head = { ...snake[0] }
    head.x += direction.x
    head.y += direction.y

    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      setGameOver(true)
      return
    }

    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true)
      return
    }

    snake.unshift(head)

    if (head.x === food.x && head.y === food.y) {
      setScore((s) => s + 10)
      generateFood()
    } else {
      snake.pop()
    }

    drawGame()
  }, [drawGame, generateFood, gameOver, isPaused])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection({ x: 0, y: -1 })
          break
        case "ArrowDown":
          setDirection({ x: 0, y: 1 })
          break
        case "ArrowLeft":
          setDirection({ x: -1, y: 0 })
          break
        case "ArrowRight":
          setDirection({ x: 1, y: 0 })
          break
        case " ":
          setIsPaused((p) => !p)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const touchStartRef = useRef<Position>({ x: 0, y: 0 })

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        setDirection({ x: 1, y: 0 })
      } else if (deltaX < 0) {
        setDirection({ x: -1, y: 0 })
      }
    } else {
      if (deltaY > 0) {
        setDirection({ x: 0, y: 1 })
      } else if (deltaY < 0) {
        setDirection({ x: 0, y: -1 })
      }
    }
  }

  useEffect(() => {
    drawGame()

    const interval = setInterval(() => {
      updateGame()
    }, 150)

    gameLoopRef.current = interval as unknown as number

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [drawGame, updateGame])

  return (
    <div className="w-full max-w-md bg-background border border-primary/20 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-primary">SNAKE.EXE</h2>
          <p className="text-sm text-muted-foreground">Score: {score}</p>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border border-primary/20 w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold text-primary mb-2">GAME OVER</h3>
            <p className="text-muted-foreground mb-4">Final Score: {score}</p>
            <Button
              onClick={resetGame}
              variant="outline"
              className="border-primary/20 hover:border-primary"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <p className="text-xl text-primary">PAUSED</p>
          </div>
        )}
      </div>

      {/* Gameboy-style control pad for phones */}
      <div className="mt-4 flex flex-col items-center gap-2 sm:hidden">
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-primary/40 bg-background/80"
            onClick={() => setDirection({ x: 0, y: -1 })}
          >
            ▲
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-primary/40 bg-background/80"
            onClick={() => setDirection({ x: -1, y: 0 })}
          >
            ◀
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-primary/40 bg-background/80"
            onClick={() => setDirection({ x: 0, y: 1 })}
          >
            ▼
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-primary/40 bg-background/80"
            onClick={() => setDirection({ x: 1, y: 0 })}
          >
            ▶
          </Button>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>• Desktop: Arrow keys to move, SPACE to pause</p>
        <p>• Mobile: Swipe or use the control pad to change direction</p>
      </div>
    </div>
  )
}

export function SnakeGameTrigger({ label }: { label: string }) {
  return (
    <Link
      href="/snake"
      className="text-primary hover:text-primary/80 underline underline-offset-2"
    >
      {label}
    </Link>
  )
}


