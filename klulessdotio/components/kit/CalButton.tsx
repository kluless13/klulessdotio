"use client"

import { Calendar } from "lucide-react"
import { useEffect, type MouseEvent } from "react"
import { calLinkOf } from "@/lib/kit/cal"

export const CAL_EMBED = "https://app.cal.com/embed/embed.js"
const CAL_ORIGIN = "https://cal.com"

type CalQueue = ((...args: unknown[]) => void) & { q?: unknown[][]; ns?: Record<string, unknown>; loaded?: boolean }
type CalWindow = Window & { Cal?: CalQueue }

const embedScript = () => document.querySelector<HTMLScriptElement>(`script[src="${CAL_EMBED}"]`)

/**
 * Load Cal's embed script once per page. Calls made before it arrives wait in Cal's own queue,
 * the same way the official snippet sets it up. The script element records whether it loaded.
 */
function loadCal(): void {
  if (embedScript()) return
  const win = window as CalWindow
  if (!win.Cal) {
    const queue: CalQueue = (...args: unknown[]) => {
      queue.q?.push(args)
    }
    win.Cal = Object.assign(queue, { q: [] as unknown[][], ns: {}, loaded: true })
  }
  win.Cal("init", { origin: CAL_ORIGIN })
  const script = document.createElement("script")
  script.src = CAL_EMBED
  script.async = true
  script.addEventListener("load", () => script.setAttribute("data-state", "ready"))
  script.addEventListener("error", () => script.setAttribute("data-state", "failed"))
  document.head.append(script)
}

/** The popup follows the page's tone: the sky's data-tone, or the head script's day class before the sky is ready. */
function themeFor(el: HTMLElement): "light" | "dark" {
  const tone = el.closest("[data-tone]")?.getAttribute("data-tone")
  const day = tone ? tone === "day" : document.documentElement.classList.contains("day")
  return day ? "light" : "dark"
}

/**
 * "Book a free call": a real link to the booking page that opens Cal's popup instead once the embed has loaded.
 * If the script is slow or blocked, the link simply navigates.
 */
export function CalButton({ label, href }: { label: string; href: string }) {
  useEffect(loadCal, [])

  function open(event: MouseEvent<HTMLAnchorElement>) {
    const cal = (window as CalWindow).Cal
    if (embedScript()?.getAttribute("data-state") !== "ready" || typeof cal !== "function") return
    const theme = themeFor(event.currentTarget)
    try {
      cal("ui", { theme, hideEventTypeDetails: false })
      cal("modal", { calLink: calLinkOf(href), config: { theme } })
      event.preventDefault()
    } catch {
      // The popup failed to open, so let the link take them to the booking page
    }
  }

  return (
    <a className="btn kit-cal" href={href} onClick={open}>
      {label}
      <Calendar size={15} aria-hidden="true" />
    </a>
  )
}
