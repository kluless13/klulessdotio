import type Matter from "matter-js"
import { type Book, fitBook } from "@/lib/books"

const LEDGE = 12
const BOOKEND_W = 12
const CLICK_MOVE = 5
const BODY_OPTIONS = { friction: 0.85, frictionStatic: 1.4, frictionAir: 0.018, restitution: 0.02, density: 0.0022, slop: 0.02, sleepThreshold: 45 }

interface Item {
  base: Book
  book: Book
  element: HTMLButtonElement
  body: Matter.Body
  nudged: boolean
}

interface Drag {
  item: Item
  constraint: Matter.Constraint
  startX: number
  startY: number
  moved: boolean
  id: number
}

export interface Shelf {
  tidy: () => void
  destroy: () => void
}

function makeSpine(book: Book): HTMLButtonElement {
  const element = document.createElement("button")
  element.type = "button"
  element.className = "book"
  element.setAttribute("aria-label", `${book.title} by ${book.author}. Open book.`)
  element.dataset.slug = book.slug
  const css = element.style
  css.setProperty("--spine", book.bg)
  css.setProperty("--spine-ink", book.ink)
  css.setProperty("--accent", book.accent)
  css.setProperty("--type", book.type)
  css.setProperty("--author-size", `${Math.min(9, book.w * 0.34)}px`)
  if (book.weight) css.setProperty("--weight", String(book.weight))
  if (book.case) css.setProperty("--case", book.case)
  if (book.track) css.setProperty("--track", book.track)
  if (book.authorInk) css.setProperty("--author-ink", book.authorInk)
  const top = document.createElement("i")
  top.className = "band"
  const label = document.createElement("span")
  label.textContent = book.title
  const author = document.createElement("small")
  author.textContent = book.short
  const low = document.createElement("i")
  low.className = "band low"
  element.append(top, label, author, low)
  return element
}

function applySize({ book, element }: Pick<Item, "book" | "element">): void {
  const css = element.style
  css.width = `${book.w}px`
  css.height = `${book.h}px`
  css.setProperty("--size", `${book.size}px`)
  css.setProperty("--band-h", `${book.band}px`)
  css.setProperty("--band-low", `${book.low}px`)
}

/** Shrinks each title until it fits its spine. If space is still tight, the author's name makes way. */
function fitTitle({ book, element }: Pick<Item, "book" | "element">): void {
  const label = element.querySelector("span")
  const author = element.querySelector("small")
  if (!label || !author) return
  const overflows = () => label.scrollHeight > label.clientHeight + 1 || label.scrollWidth > book.w
  const shrink = () => {
    let size = book.size
    element.style.setProperty("--size", `${size}px`)
    while (overflows() && size > 9.5) {
      size -= 0.5
      element.style.setProperty("--size", `${size}px`)
    }
  }
  author.hidden = false
  shrink()
  if (overflows()) {
    author.hidden = true
    shrink()
  }
}

function drawShelf(svg: SVGSVGElement, width: number, bookendHeight: number): void {
  const h = bookendHeight + LEDGE
  const t = BOOKEND_W
  const l = LEDGE
  svg.setAttribute("width", String(width))
  svg.setAttribute("height", String(h))
  svg.setAttribute("viewBox", `0 0 ${width} ${h}`)
  svg.innerHTML = `<defs><linearGradient id="shelfFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--b-top)"/><stop offset="1" style="stop-color:var(--b-bot)"/></linearGradient></defs><path d="M0 3 a3 3 0 0 1 3-3 h${t - 6} a3 3 0 0 1 3 3 V${h - l - 6} a6 6 0 0 0 6 6 H${width - t - 6} a6 6 0 0 0 6-6 V3 a3 3 0 0 1 3-3 h${t - 6} a3 3 0 0 1 3 3 V${h - 3} a3 3 0 0 1-3 3 H3 a3 3 0 0 1-3-3 Z" fill="url(#shelfFill)" stroke="var(--b-ring)"/>`
}

export function createShelf(M: typeof Matter, stage: HTMLElement, svg: SVGSVGElement, tip: HTMLElement, books: readonly Book[], onOpen: (book: Book, element: HTMLElement) => void): Shelf {
  const { Engine, Bodies, Body, Composite, Constraint, Query, Sleeping } = M
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let engine: Matter.Engine = Engine.create()
  let stageW = 0
  let stageH = 0
  let items: Item[] = []
  let drag: Drag | null = null
  let running = false
  let destroyed = false

  const elements = books.map(makeSpine)
  elements.forEach((element) => stage.appendChild(element))

  const walls = () => Composite.allBodies(engine.world).filter((body) => body.label === "wall")

  const surroundings = (item: Item) => {
    const b = item.body.bounds
    const top = b.min.y + 6
    const bottom = b.max.y - 6
    const blockers = [...items.filter((entry) => entry !== item).map((entry) => entry.body), ...walls()]
    const touching = (side: number) =>
      Query.region(blockers, side < 0 ? { min: { x: b.min.x - 3, y: top }, max: { x: b.min.x + 1, y: bottom } } : { min: { x: b.max.x - 1, y: top }, max: { x: b.max.x + 3, y: bottom } }).length > 0
    const gap = (side: number) =>
      blockers.reduce((nearest, other) => {
        if (other.bounds.max.y < top || other.bounds.min.y > bottom) return nearest
        const distance = side < 0 ? b.min.x - other.bounds.max.x : other.bounds.min.x - b.max.x
        return distance >= -2 && distance < nearest ? distance : nearest
      }, Infinity)
    return { left: touching(-1), right: touching(1), gapLeft: gap(-1), gapRight: gap(1) }
  }

  /** A real thin book can balance, but a shelf book should slump, so upright books with room to move get a gentle push. */
  const applySlump = (item: Item) => {
    const body = item.body
    const upright = Math.abs(Math.sin(body.angle)) < 0.06
    const onLedge = body.bounds.max.y > stageH - LEDGE - 4
    if (!upright || !onLedge || drag?.item === item) {
      item.nudged = false
      return
    }
    const around = surroundings(item)
    if (around.left && around.right) {
      item.nudged = false
      return
    }
    if (item.nudged) return
    const height = item.book.h
    let direction = 0
    if (!around.left && !around.right) {
      direction = around.gapLeft === Infinity && around.gapRight === Infinity ? (Math.random() < 0.5 ? -1 : 1) : around.gapLeft <= around.gapRight ? -1 : 1
    } else if (!around.left && around.gapLeft < height * 0.68) direction = -1
    else if (!around.right && around.gapRight < height * 0.68) direction = 1
    if (direction) {
      Sleeping.set(body, false)
      Body.setAngularVelocity(body, direction * 0.016)
      item.nudged = true
    }
  }

  const step = (withSlump: boolean) => {
    if (withSlump && !reduced) items.forEach(applySlump)
    for (const item of items) {
      // A book that goes over the end of the shelf falls back in from above
      if (item.body.position.y > stageH + 420) {
        Body.setPosition(item.body, { x: stageW * (0.3 + Math.random() * 0.4), y: item.book.h / 2 + 4 })
        Body.setAngle(item.body, 0)
        Body.setVelocity(item.body, { x: 0, y: 0 })
        Body.setAngularVelocity(item.body, 0)
      }
      const v = item.body.velocity
      const speed = Math.hypot(v.x, v.y)
      if (speed > 26) Body.setVelocity(item.body, { x: (v.x * 26) / speed, y: (v.y * 26) / speed })
    }
    Engine.update(engine, 1000 / 60)
  }

  const render = () => {
    for (const item of items) {
      const { x, y } = item.body.position
      item.element.style.transform = `translate(${x - item.book.w / 2}px, ${y - item.book.h / 2}px) rotate(${item.body.angle}rad)`
    }
  }

  const loop = () => {
    if (destroyed) return
    step(true)
    render()
    if (!drag && items.every((item) => item.body.isSleeping)) {
      running = false
      return
    }
    window.requestAnimationFrame(loop)
  }
  const start = () => {
    if (!running) {
      running = true
      window.requestAnimationFrame(loop)
    }
  }
  const wakeAll = () => {
    items.forEach((item) => Sleeping.set(item.body, false))
    start()
  }

  const build = () => {
    stageW = stage.clientWidth
    stageH = stage.clientHeight
    const wide = stageW >= 600
    const bookendHeight = wide ? 130 : 96
    drawShelf(svg, stageW, bookendHeight)
    const floorY = stageH - LEDGE
    engine = Engine.create({ enableSleeping: true, positionIterations: 12, velocityIterations: 10, constraintIterations: 4 })
    engine.gravity.y = 1.15
    Composite.add(engine.world, [
      Bodies.rectangle(stageW / 2, floorY + 40, stageW, 80, { isStatic: true, friction: 1, label: "ledge" }),
      // The ceiling keeps books inside their own area, so they never pass over the words above
      Bodies.rectangle(stageW / 2, -40, stageW + 400, 80, { isStatic: true, friction: 0.3, label: "ceiling" }),
      Bodies.rectangle(BOOKEND_W / 2, floorY - bookendHeight / 2, BOOKEND_W, bookendHeight, { isStatic: true, friction: 0.5, label: "wall" }),
      Bodies.rectangle(stageW - BOOKEND_W / 2, floorY - bookendHeight / 2, BOOKEND_W, bookendHeight, { isStatic: true, friction: 0.5, label: "wall" }),
    ])
    let x = BOOKEND_W + 3
    items = books.map((base, index) => {
      const book = fitBook(base, wide)
      const element = elements[index]
      applySize({ book, element })
      fitTitle({ book, element })
      const narrow = x + book.w > stageW - 6
      if (narrow) x = BOOKEND_W + 3 + (index % 3) * 8
      const body = Bodies.rectangle(x + book.w / 2, floorY - book.h / 2 - (narrow ? 330 : 0), book.w, book.h, BODY_OPTIONS)
      Composite.add(engine.world, body)
      x += book.w + 1.5
      return { base, book, element, body, nudged: false }
    })
    // Start already settled, so the shelf doesn't jiggle on load
    for (let i = 0; i < 240; i++) step(false)
    render()
  }

  const pointerPosition = (event: PointerEvent) => {
    const rect = stage.getBoundingClientRect()
    return { x: Math.max(-60, Math.min(stageW + 60, event.clientX - rect.left)), y: Math.max(0, Math.min(stageH - LEDGE - 2, event.clientY - rect.top)) }
  }
  const hideTip = () => tip.classList.remove("on")
  const showTip = (item: Item) => {
    if (drag) return
    tip.textContent = `${item.book.title} · ${item.book.author}`
    const half = Math.min(160, tip.offsetWidth / 2)
    tip.style.left = `${Math.max(half, Math.min(stageW - half, item.body.position.x))}px`
    tip.style.top = `${Math.max(14, item.body.bounds.min.y - 10)}px`
    tip.classList.add("on")
  }
  const itemFor = (element: Element | null) => items.find((item) => item.element === element?.closest(".book"))

  const onDown = (event: PointerEvent) => {
    const item = itemFor(event.target as Element)
    if (!item) return
    event.preventDefault()
    const point = pointerPosition(event)
    const body = item.body
    wakeAll()
    const dx = point.x - body.position.x
    const dy = point.y - body.position.y
    const cos = Math.cos(-body.angle)
    const sin = Math.sin(-body.angle)
    const constraint = Constraint.create({ pointA: { ...point }, bodyB: body, pointB: { x: dx * cos - dy * sin, y: dx * sin + dy * cos }, length: 0, stiffness: 0.1, damping: 0.25 })
    Composite.add(engine.world, constraint)
    body.frictionAir = 0.09
    drag = { item, constraint, startX: event.clientX, startY: event.clientY, moved: false, id: event.pointerId }
    item.element.setPointerCapture(event.pointerId)
    item.element.classList.add("dragging")
    item.element.style.zIndex = "30"
    item.element.focus({ preventScroll: true })
    hideTip()
  }
  const onMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > CLICK_MOVE) drag.moved = true
    const point = pointerPosition(event)
    drag.constraint.pointA.x = point.x
    drag.constraint.pointA.y = point.y
    Sleeping.set(drag.item.body, false)
  }
  const onUp = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return
    const { item, constraint, moved } = drag
    Composite.remove(engine.world, constraint)
    item.body.frictionAir = BODY_OPTIONS.frictionAir
    item.element.classList.remove("dragging")
    item.element.style.zIndex = ""
    drag = null
    wakeAll()
    if (!moved) onOpen(item.base, item.element)
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return
    const item = itemFor(event.target as Element)
    if (!item) return
    event.preventDefault()
    onOpen(item.base, item.element)
  }
  const onOver = (event: PointerEvent) => {
    const item = itemFor(event.target as Element)
    if (item) showTip(item)
    else hideTip()
  }

  stage.addEventListener("pointerdown", onDown)
  stage.addEventListener("pointermove", onMove)
  stage.addEventListener("pointerup", onUp)
  stage.addEventListener("pointercancel", onUp)
  stage.addEventListener("keydown", onKey)
  stage.addEventListener("pointerover", onOver)
  stage.addEventListener("pointerleave", hideTip)

  const tidy = () => {
    items.forEach((item) => {
      item.element.style.zIndex = ""
    })
    drag = null
    build()
  }
  const onResize = () => {
    if (Math.abs(stage.clientWidth - stageW) > 20) tidy()
  }
  window.addEventListener("resize", onResize)
  build()
  void document.fonts?.ready.then(() => {
    if (!destroyed) items.forEach(fitTitle)
  })

  return {
    tidy,
    destroy: () => {
      destroyed = true
      window.removeEventListener("resize", onResize)
      stage.removeEventListener("pointerdown", onDown)
      stage.removeEventListener("pointermove", onMove)
      stage.removeEventListener("pointerup", onUp)
      stage.removeEventListener("pointercancel", onUp)
      stage.removeEventListener("keydown", onKey)
      stage.removeEventListener("pointerover", onOver)
      stage.removeEventListener("pointerleave", hideTip)
      elements.forEach((element) => element.remove())
    },
  }
}
