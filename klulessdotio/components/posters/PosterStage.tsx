"use client"

import { AnimatePresence, type PanInfo, motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef } from "react"
import { POSTERS, fullSrc, nextIndex } from "@/lib/posters"

const SWIPE_DISTANCE = 60

/** One large poster at a time. Used by the poster view and by Quiet. */
export function PosterStage({ index, onIndex }: { index: number; onIndex: (next: number) => void }) {
  const reduced = useReducedMotion()
  const previous = useRef(index)
  const direction = index === nextIndex(previous.current, 1, POSTERS.length) ? 1 : index === previous.current ? 0 : -1
  useEffect(() => {
    previous.current = index
    // Loading the neighbours ahead of time keeps the next poster from popping in
    for (const delta of [1, -1]) {
      const image = new Image()
      image.src = fullSrc(POSTERS[nextIndex(index, delta, POSTERS.length)])
    }
  }, [index])
  const poster = POSTERS[index]
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE) onIndex(nextIndex(index, 1, POSTERS.length))
    else if (info.offset.x > SWIPE_DISTANCE) onIndex(nextIndex(index, -1, POSTERS.length))
  }
  const shift = reduced ? 0 : 36
  return (
    <div className="stage">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.img
          key={poster.slug}
          className="stage-poster"
          src={fullSrc(poster)}
          alt={poster.title}
          width={poster.w}
          height={poster.h}
          draggable={false}
          drag={reduced ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.35}
          onDragEnd={onDragEnd}
          initial={{ opacity: 0, x: direction * shift, scale: reduced ? 1 : 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: direction * -shift, scale: reduced ? 1 : 0.985 }}
          transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </AnimatePresence>
    </div>
  )
}
