"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Minus, Plus } from "lucide-react"
import { type ReactNode, useId, useState } from "react"

/** A row that stays closed until someone opens it. */
export function Row({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const reduced = useReducedMotion()
  return (
    <div className="row">
      <button type="button" className="row-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        {open ? <Minus size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      </button>
      {subtitle ? <p className="row-text">{subtitle}</p> : null}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            className="row-body"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
