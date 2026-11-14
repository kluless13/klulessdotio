"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react"

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener("change", update)
    return () => list.removeEventListener("change", update)
  }, [query])
  return matches
}

/** Phones and tablets: no hover, so effects play on scroll and dropdowns use the native picker */
export function useCoarsePointer(): boolean {
  return useMediaQuery("(hover: none) and (pointer: coarse)")
}

/** Read at the moment of scrolling, so a jump is instant for anyone who asked for less motion */
export function scrollBehaviour(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
}

/** Stops the page scrolling behind an open window or menu, and restores it after */
export function useScrollLock(): void {
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = previous
    }
  }, [])
}

/** Keeps Tab and Shift+Tab inside a container while it's open */
export function trapFocus(event: KeyboardEvent<HTMLElement>, container: HTMLElement | null): void {
  if (event.key !== "Tab" || !container) return
  const focusable = container.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

/** True once the element has scrolled into view. Stays true, so motion plays only once. */
export function useSeenOnce<T extends Element>(threshold = 0.45): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || seen) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [seen, threshold])
  return [ref, seen]
}
