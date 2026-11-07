"use client"

import { motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Dock } from "@/components/posters/Dock"
import { PosterStage } from "@/components/posters/PosterStage"
import { usePosterKeys } from "@/components/posters/usePosterKeys"
import { GROUPS, POSTERS, firstIndexOfGroup, groupOf } from "@/lib/posters"

export function PosterViewer({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  usePosterKeys(index, setIndex)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  const poster = POSTERS[index]
  const group = groupOf(poster.group)
  return (
    <motion.div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Posters"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
    >
      <button type="button" className="btn btn-icon viewer-close" ref={closeRef} aria-label="Close posters" onClick={onClose}>
        <X size={16} aria-hidden="true" />
      </button>
      <aside className="viewer-caption">
        <h2 className="caption-title">{group.name}</h2>
        <p className="caption-text">{group.text}</p>
        {group.note ? <p className="caption-note">{group.note}</p> : null}
        <p className="caption-count" aria-live="polite">{index + 1} of {POSTERS.length}</p>
        <div className="viewer-groups">
          {GROUPS.map((item) => (
            <button type="button" key={item.id} className="group-link" aria-current={item.id === group.id ? "true" : undefined} onClick={() => setIndex(firstIndexOfGroup(item.id))}>
              {item.name}
            </button>
          ))}
        </div>
      </aside>
      <PosterStage index={index} onIndex={setIndex} />
      <Dock index={index} onIndex={setIndex} arrows />
    </motion.div>
  )
}
