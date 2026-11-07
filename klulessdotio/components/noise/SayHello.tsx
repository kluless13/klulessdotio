"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { REACH } from "@/lib/content"

const ICONS: Record<string, string> = {
  Telegram: "M22.05 3.5 2.9 10.9c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.6.2 1.8-.9l3.3-15.4c.3-1.4-.5-2-1.75-1.3ZM8.8 13.7l11-6.9c.5-.3 1-.1.6.2l-9.2 8.3-.4 3.8-2-5.4Z",
  LinkedIn: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z",
  X: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  GitHub: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
}

const CLOSED = { width: 0, paddingLeft: 0, paddingRight: 0, marginLeft: 0, opacity: 0, scale: 0.6 }
const OPEN = { width: 37, paddingLeft: 11, paddingRight: 11, marginLeft: 8, opacity: 1, scale: 1 }
const STEP_SECONDS = 0.05
const EASE = [0.2, 0.8, 0.2, 1] as const

export function SayHello() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const timing = (delay: number) => ({ duration: reduced ? 0 : 0.28, ease: EASE, delay: reduced ? 0 : delay })
  return (
    <div className="say-hello">
      <button type="button" className="btn" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Say hello {open ? <Minus size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
      </button>
      <AnimatePresence initial={false}>
        {open
          ? REACH.map((link, index) => (
              <motion.a
                key={link.name}
                className="btn reach-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                initial={CLOSED}
                animate={{ ...OPEN, transition: timing(index * STEP_SECONDS) }}
                // Closing runs the opening in reverse: the last link to arrive is the first to leave
                exit={{ ...CLOSED, transition: timing((REACH.length - 1 - index) * STEP_SECONDS) }}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                  <path d={ICONS[link.name]} />
                </svg>
              </motion.a>
            ))
          : null}
      </AnimatePresence>
    </div>
  )
}
