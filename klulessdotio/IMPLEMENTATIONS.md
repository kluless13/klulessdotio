# Website Implementation Guide for kluless.io

## Overview
This document outlines the implementation plan for enhancing the personal website with improved UI/UX, collapsible sections, interactive effects, and a playable Snake game.

## Current Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI (including Accordion, Dialog, etc.)
- **Icons**: lucide-react
- **Typography**: JetBrains Mono (monospace)
- **Theme**: Dark terminal aesthetic with yellow-orange (#D4A574) text on black background

---

## 1. Unify Background Design

### Problem
Currently, content sections use `Card` components that create visual separation with background colors (`bg-card`), which creates a distinction between the pure black background and slightly lighter boxes.

### Solution
Remove all `Card` component wrappers from content sections to achieve a unified black background throughout.

### Implementation Steps

**File: `app/page.tsx`**

1. **Remove Card wrappers** from:
   - About section
   - Timeline items
   - Thoughts/articles section

2. **Replace with plain divs** styled directly:
```tsx
// Before (About Section):
<Card className="p-6 bg-card">
  <p className="leading-relaxed">...</p>
</Card>

// After:
<div className="py-4">
  <p className="leading-relaxed text-foreground/90">...</p>
</div>
```

3. **Timeline items** - remove Card, keep structure:
```tsx
// Before:
<Card key={index} className="p-4 bg-card">
  <div className="flex items-start gap-4">...</div>
</Card>

// After:
<div key={index} className="py-3 border-l-2 border-primary/20 pl-4">
  <div className="flex items-start gap-4">...</div>
</div>
```

4. **Thoughts section** - keep Card only for the interactive button area:
```tsx
// Keep minimal border/separator instead of full card background
<div className="border-b border-primary/10 pb-3">
  <button className="w-full py-3 text-left hover:text-primary transition-colors">
    ...
  </button>
</div>
```

---

## 2. Responsive Text Sizing for Mobile

### Problem
Text sizes are currently fixed and don't scale down appropriately for mobile devices.

### Solution
Implement responsive typography using Tailwind's responsive variants and `clamp()` for fluid scaling.

### Implementation Steps

**File: `app/globals.css`**

Add responsive text size utilities:

```css
@layer base {
  html {
    /* Base font size scales from 14px (mobile) to 16px (desktop) */
    font-size: clamp(14px, 2vw, 16px);
  }
  
  h1 {
    /* Main heading: 28px mobile → 36px desktop */
    font-size: clamp(1.75rem, 4vw, 2.25rem);
  }
  
  h2 {
    /* Section headings: 20px mobile → 24px desktop */
    font-size: clamp(1.25rem, 3vw, 1.5rem);
  }
  
  h3 {
    /* Subheadings: 16px mobile → 18px desktop */
    font-size: clamp(1rem, 2.5vw, 1.125rem);
  }
  
  p, .body-text {
    /* Body text: 14px mobile → 16px desktop */
    font-size: clamp(0.875rem, 2vw, 1rem);
  }
  
  .text-sm {
    /* Small text: 12px mobile → 14px desktop */
    font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  }
}

/* Mobile-specific adjustments */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Tighter spacing on mobile */
  section {
    @apply mb-8;
  }
}
```

**File: `app/page.tsx`**

Update component classes:
```tsx
// Header
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 terminal-text">

// Section headings
<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-primary">

// Timeline year text
<div className="text-primary font-bold text-sm sm:text-base min-w-[60px]">

// Timeline description
<p className="text-muted-foreground text-xs sm:text-sm mt-1">
```

---

## 3. Collapsible Sections with Radix Accordion

### Problem
About, Timeline, and Thoughts sections are always expanded. Need to make them collapsible with ">" changing to "v" indicator.

### Solution
Wrap each section in Radix UI's Accordion component with custom styling.

### Implementation Steps

**File: `app/page.tsx`**

1. Import Accordion:
```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
```

2. Create custom AccordionTrigger component:
```tsx
const SectionAccordion = ({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <Accordion 
      type="single" 
      collapsible 
      defaultValue={defaultOpen ? "item-1" : undefined}
      onValueChange={(value) => setIsOpen(value === "item-1")}
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors py-2">
          <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <span className="text-primary transition-transform duration-200">
              {isOpen ? "v" : ">"}
            </span>
            {title}
          </h2>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

3. Wrap sections:
```tsx
{/* About Section */}
<SectionAccordion title="about" defaultOpen={true}>
  <div className="py-4">
    <p className="leading-relaxed text-foreground/90">
      {/* About content */}
    </p>
  </div>
</SectionAccordion>

{/* Timeline Section */}
<SectionAccordion title="timeline" defaultOpen={true}>
  <div className="space-y-4">
    {timelineItems.map((item, index) => (
      {/* Timeline content */}
    ))}
  </div>
</SectionAccordion>

{/* Thoughts Section */}
<SectionAccordion title="thoughts" defaultOpen={true}>
  <div className="space-y-3">
    {/* Thoughts content */}
  </div>
</SectionAccordion>
```

---

## 4. Matrix Code Rain Effect

### Problem
Need an interactive Matrix-style code rain effect that can be triggered by a button click.

### Solution
Create a custom Matrix rain component using Canvas API with Japanese katakana, numbers, and Chinese characters.

### Implementation Steps

**Create new file: `components/MatrixRain.tsx`**

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Terminal, X } from "lucide-react"

interface MatrixRainProps {
  onClose?: () => void
}

export function MatrixRain({ onClose }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Matrix characters - Japanese Katakana, numbers, and some Chinese
    const matrixChars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789一二三四五六七八九十"
    const fontSize = 16
    const columns = Math.floor(canvas.width / fontSize)
    
    // Array of drop positions
    const drops: number[] = Array(columns).fill(1)
    
    // Colors matching site theme
    const primaryColor = "rgba(212, 165, 116, 0.9)" // Yellow-orange
    const fadedColor = "rgba(212, 165, 116, 0.05)"
    
    function draw() {
      if (!ctx || !canvas) return
      
      // Create trailing effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = primaryColor
      ctx.font = `${fontSize}px JetBrains Mono, monospace`
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize
        
        ctx.fillText(char, x, y)
        
        // Reset drop randomly or when it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        
        drops[i]++
      }
    }

    // Animation loop
    function animate() {
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

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

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Close button */}
      <Button
        onClick={onClose}
        className="fixed top-4 right-4 rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg z-50"
        size="icon"
      >
        <X className="h-5 w-5" />
      </Button>
      
      {/* Optional: Add centered text overlay */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-primary mb-2 terminal-text">
            FOLLOW THE WHITE RABBIT
          </h2>
          <p className="text-muted-foreground">Press ESC or click X to exit</p>
        </div>
      </div>
    </div>
  )
}

// Export trigger button component
export function MatrixRainTrigger() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsActive(false)
    }
    
    if (isActive) {
      window.addEventListener("keydown", handleEscape)
    }
    
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isActive])

  return (
    <>
      <Button
        onClick={() => setIsActive(true)}
        variant="outline"
        size="sm"
        className="border-primary/20 hover:border-primary hover:bg-primary/10"
      >
        <Terminal className="h-4 w-4 mr-2" />
        enter the matrix
      </Button>
      
      {isActive && <MatrixRain onClose={() => setIsActive(false)} />}
    </>
  )
}
```

**Add to page.tsx:**
```tsx
import { MatrixRainTrigger } from "@/components/MatrixRain"

// Add to header section near GitHub/Twitter icons:
<div className="flex items-center gap-4">
  <MatrixRainTrigger />
  {/* existing GitHub and Twitter buttons */}
</div>
```

---

## 5. Snake Game Component

### Problem
Need a playable Snake game accessible via an icon in the header, playable on both desktop and mobile.

### Solution
Create a Snake game component using Canvas API with touch and keyboard controls.

### Implementation Steps

**Create new file: `components/SnakeGame.tsx`**

```tsx
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, RotateCcw } from "lucide-react"

interface Position {
  x: number
  y: number
}

export function SnakeGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  // Game state refs
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }])
  const directionRef = useRef<Position>({ x: 0, y: 0 })
  const foodRef = useRef<Position>({ x: 15, y: 15 })
  const gameLoopRef = useRef<number>()
  
  const gridSize = 20
  const cellSize = 20

  const generateFood = useCallback(() => {
    const maxX = Math.floor(400 / cellSize)
    const maxY = Math.floor(400 / cellSize)
    
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
      }
    } while (
      snakeRef.current.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    )
    
    foodRef.current = newFood
  }, [])

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
    ctx.fillStyle = "#D4A574" // Primary color
    snakeRef.current.forEach((segment, index) => {
      const alpha = 1 - (index / snakeRef.current.length) * 0.5
      ctx.fillStyle = `rgba(212, 165, 116, ${alpha})`
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      )
    })

    // Draw food
    ctx.fillStyle = "#D4A574"
    ctx.beginPath()
    ctx.arc(
      foodRef.current.x * cellSize + cellSize / 2,
      foodRef.current.y * cellSize + cellSize / 2,
      cellSize / 2 - 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }, [])

  const updateGame = useCallback(() => {
    if (gameOver || isPaused) return

    const snake = snakeRef.current
    const direction = directionRef.current
    const food = foodRef.current

    // Don't move if no direction set
    if (direction.x === 0 && direction.y === 0) return

    // Calculate new head position
    const head = { ...snake[0] }
    head.x += direction.x
    head.y += direction.y

    // Check wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      setGameOver(true)
      return
    }

    // Check self collision
    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true)
      return
    }

    // Add new head
    snake.unshift(head)

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      setScore((s) => s + 10)
      generateFood()
    } else {
      snake.pop()
    }

    drawGame()
  }, [gameOver, isPaused, generateFood, drawGame])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const direction = directionRef.current
      
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) directionRef.current = { x: 0, y: -1 }
          break
        case "ArrowDown":
          if (direction.y === 0) directionRef.current = { x: 0, y: 1 }
          break
        case "ArrowLeft":
          if (direction.x === 0) directionRef.current = { x: -1, y: 0 }
          break
        case "ArrowRight":
          if (direction.x === 0) directionRef.current = { x: 1, y: 0 }
          break
        case " ":
          setIsPaused((p) => !p)
          break
        case "Escape":
          onClose()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [onClose])

  // Touch controls for mobile
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
    const direction = directionRef.current
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0 && direction.x === 0) {
        directionRef.current = { x: 1, y: 0 }
      } else if (deltaX < 0 && direction.x === 0) {
        directionRef.current = { x: -1, y: 0 }
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && direction.y === 0) {
        directionRef.current = { x: 0, y: 1 }
      } else if (deltaY < 0 && direction.y === 0) {
        directionRef.current = { x: 0, y: -1 }
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
  }, [updateGame, drawGame])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <div className="relative bg-background border border-primary/20 p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-primary">SNAKE.EXE</h2>
            <p className="text-sm text-muted-foreground">Score: {score}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Game Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-primary/20 w-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
          
          {/* Game Over Overlay */}
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
          
          {/* Pause Overlay */}
          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <p className="text-xl text-primary">PAUSED</p>
            </div>
          )}
        </div>

        {/* Controls Info */}
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• Desktop: Arrow keys to move, SPACE to pause</p>
          <p>• Mobile: Swipe to change direction</p>
          <p>• ESC to exit</p>
        </div>
      </div>
    </div>
  )
}

// Snake Icon Component (using a custom SVG)
const SnakeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 12 L10 8 L14 12 L18 8 L18 16 L14 12 L10 16 L6 12" />
    <circle cx="18" cy="8" r="1" fill="currentColor" />
  </svg>
)

export function SnakeGameTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="hover:bg-accent"
        title="Play Snake"
      >
        <SnakeIcon />
      </Button>
      {isOpen && <SnakeGame onClose={() => setIsOpen(false)} />}
    </>
  )
}
```

**Add to page.tsx:**
```tsx
import { SnakeGameTrigger } from "@/components/SnakeGame"

// In header, add alongside other icons:
<div className="flex items-center gap-4">
  <MatrixRainTrigger />
  <SnakeGameTrigger />
  <a href="https://github.com/kluless13" target="_blank" rel="noopener noreferrer">
    <Button variant="ghost" size="icon" className="hover:bg-accent">
      <Github className="h-5 w-5" />
    </Button>
  </a>
  <a href="https://twitter.com/kluless_" target="_blank" rel="noopener noreferrer">
    <Button variant="ghost" size="icon" className="hover:bg-accent">
      <Twitter className="h-5 w-5" />
    </Button>
  </a>
</div>
```

---

## 6. Improved Bio Section

### Problem
Current bio is generic and doesn't showcase the depth of experience shown in the CV.

### Solution
Rewrite the About section content using information from the CV to be more compelling and specific.

### Implementation

**File: `app/page.tsx`**

Replace the about section content with:

```tsx
<p className="leading-relaxed text-foreground/90 space-y-4">
  <span className="block">
    I like baking, data, lifting heavy, and predicting the future. I'm the founder of{" "}
    <a 
      href="https://kairos.io" 
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Kairos
    </a>, where we're advancing prediction market infrastructure—building tools that let us not only forecast the future but shape it.
  </span>
  
  <span className="block">
    My journey started in marine science. I earned my Master's at{" "}
    <span className="text-primary">James Cook University</span>, the world's top-ranked program for marine biology. 
    My passion for biology, robotics, and AI led me to{" "}
    <span className="text-primary">Flyingfish Technologies</span>, where I built{" "}
    <span className="text-primary font-semibold">FishTally</span>—an AI-powered tool that automated fish counts and coral detection 
    from underwater video, saving <span className="text-primary font-semibold">{">"}100 hours</span> of manual work each week and delivering real-time ecological insights.
  </span>
  
  <span className="block">
    Beyond marine robotics, I've built products across climate, AI, and emerging tech. At{" "}
    <span className="text-primary">PurposeFi</span>, I developed ESG intelligence engines that transformed{" "}
    <span className="text-primary font-semibold">4-5 month analyses into automated 48-hour diagnostics</span>. 
    I scraped and analyzed data across all ASX-listed companies to identify those needing carbon and renewable credits—work that saved months of research and directly informed strategy for renewable energy companies and super funds.
  </span>
  
  <span className="block">
    At <span className="text-primary">DeTrash</span>, I scaled operations from{" "}
    <span className="text-primary font-semibold">{">"}300 to 51,000+ recyclers</span> in India through strategic partnerships, 
    and led carbon credit due diligence for <span className="text-primary font-semibold">6M+ credits</span> in bulk procurement discussions.
  </span>
  
  <span className="block">
    My work consistently merges systems thinking, analytical depth, and narrative clarity to solve ambiguous, cross-disciplinary problems. 
    At Kairos, I designed end-to-end prediction market infrastructure on Bitcoin, built AI-enabled transaction layers, and created{" "}
    <span className="text-primary font-semibold">STRIKE</span> (Smart Transaction Route Integration Kit)—a grant-winning platform 
    integrating dApps with social platforms.
  </span>
  
  <span className="block text-muted-foreground italic">
    I thrive in ambiguity, move fast with structure, and bring a blend of analytical rigor, emerging-tech fluency, and real operational experience.
  </span>
</p>
```

---

## Implementation Checklist

- [ ] **Background Unification**
  - [ ] Remove all `Card` components from About section
  - [ ] Remove `Card` from Timeline items
  - [ ] Update Thoughts section styling
  - [ ] Test visual consistency across all sections

- [ ] **Responsive Typography**
  - [ ] Add clamp-based font sizes to globals.css
  - [ ] Update all heading classes in page.tsx
  - [ ] Test on mobile (375px), tablet (768px), and desktop (1440px)
  - [ ] Verify readability at all breakpoints

- [ ] **Collapsible Sections**
  - [ ] Import Accordion from Radix UI
  - [ ] Create SectionAccordion component
  - [ ] Wrap About, Timeline, and Thoughts sections
  - [ ] Implement ">" to "v" toggle indicator
  - [ ] Test expand/collapse functionality
  - [ ] Verify smooth animations

- [ ] **Matrix Rain Effect**
  - [ ] Create MatrixRain component
  - [ ] Implement canvas-based animation
  - [ ] Add keyboard (ESC) and button close handlers
  - [ ] Create MatrixRainTrigger button
  - [ ] Add to header section
  - [ ] Test performance on mobile devices
  - [ ] Verify correct colors match theme

- [ ] **Snake Game**
  - [ ] Create SnakeGame component
  - [ ] Implement game logic (snake movement, collision detection, scoring)
  - [ ] Add keyboard controls (arrow keys, space, ESC)
  - [ ] Add touch controls for mobile (swipe gestures)
  - [ ] Create custom Snake icon SVG
  - [ ] Create SnakeGameTrigger button
  - [ ] Add to header section
  - [ ] Test gameplay on desktop and mobile
  - [ ] Verify pause/resume functionality

- [ ] **Improved Bio**
  - [ ] Update About section with CV-based content
  - [ ] Add inline links (Kairos, etc.)
  - [ ] Format with proper spacing and emphasis
  - [ ] Highlight key achievements with primary color
  - [ ] Verify all statistics and numbers are accurate

- [ ] **Final Testing**
  - [ ] Cross-browser testing (Chrome, Firefox, Safari)
  - [ ] Mobile responsiveness (iOS Safari, Chrome Android)
  - [ ] Performance check (Lighthouse scores)
  - [ ] Accessibility audit (keyboard navigation, screen readers)
  - [ ] Visual regression testing

---

## Notes for Code Agent

1. **Component Organization**: All new components should be created in the `/components` directory. UI primitives should remain in `/components/ui`.

2. **Styling Consistency**: Always use Tailwind CSS classes. The theme is defined in `globals.css` with CSS variables for easy customization.

3. **Animation Performance**: Both Matrix Rain and Snake Game use `requestAnimationFrame` for smooth 60fps animations. Canvas is cleared and redrawn each frame.

4. **Mobile Considerations**: 
   - Touch events are handled separately from mouse events
   - Swipe gestures use touch start/end coordinates
   - All interactive elements have minimum 44x44px touch targets
   - Text remains readable at small sizes

5. **Accessibility**:
   - All interactive elements should be keyboard accessible
   - ESC key should close modals/overlays
   - ARIA labels should be added where appropriate
   - Focus states should be visible

6. **Color Palette**:
   - Primary: `#D4A574` (oklch(0.85 0.15 65)) - Yellow-orange
   - Background: `#000000` (pure black)
   - Muted text: Same hue with reduced opacity
   - All colors defined in CSS variables for consistency

7. **Typography**:
   - Font: JetBrains Mono (monospace)
   - Maintain terminal aesthetic throughout
   - Use `terminal-text` class for glow effect on headings

8. **State Management**:
   - Use React hooks (useState, useRef) for local component state
   - No global state management needed for these features
   - Clean up intervals and event listeners in useEffect cleanup

---

## Success Criteria

The implementation will be considered successful when:

1. ✅ All sections have unified black background with no visible card borders
2. ✅ Text scales smoothly from mobile to desktop without breaking layout
3. ✅ All main sections (About, Timeline, Thoughts) can be collapsed/expanded with proper indicators
4. ✅ Matrix rain effect runs smoothly at 60fps with proper characters and colors
5. ✅ Snake game is playable with both keyboard and touch controls
6. ✅ Bio section contains all relevant CV information in an engaging format
7. ✅ Site maintains terminal aesthetic throughout all new features
8. ✅ All features work on mobile Safari, Chrome Android, and desktop browsers
9. ✅ Page load time remains under 2 seconds
10. ✅ No console errors or warnings

---

## Future Enhancements (Optional)

- Add high score persistence for Snake game (localStorage)
- Matrix rain with multiple color schemes
- Additional retro games (Tetris, Pong)
- Blog post markdown renderer with syntax highlighting
- RSS feed for thoughts/articles
- Dark/light mode toggle (while maintaining terminal aesthetic)
- Keyboard shortcuts cheat sheet modal
- Easter eggs triggered by konami code
