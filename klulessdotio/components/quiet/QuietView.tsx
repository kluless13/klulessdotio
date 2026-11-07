"use client"

import dynamic from "next/dynamic"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { Greeting } from "@/components/Greeting"
import { Dock } from "@/components/posters/Dock"
import { PosterStage } from "@/components/posters/PosterStage"
import { usePosterKeys } from "@/components/posters/usePosterKeys"
import { Music } from "@/components/quiet/Music"
import { ShelfBoundary } from "@/components/quiet/ShelfBoundary"
import { useSky } from "@/components/sky/SkyProvider"
import { POSTERS, groupOf, posterOfTheDay } from "@/lib/posters"

// Physics only loads for people who open the shelf
const Bookshelf = dynamic(() => import("@/components/books/Bookshelf").then((module) => module.Bookshelf), { ssr: false })

export function QuietView({ onNoise }: { onNoise: () => void }) {
  const { statusLine } = useSky()
  const reduced = useReducedMotion()
  const [today, setToday] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [books, setBooks] = useState(false)
  useEffect(() => setToday(posterOfTheDay(new Date())), [])
  const index = picked ?? today ?? 0
  usePosterKeys(index, setPicked, !books)
  const group = groupOf(POSTERS[index].group)

  return (
    <motion.div className={`quiet ${books ? "quiet-books" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.45 }}>
      <div className="quiet-top">
        <div className="quiet-hello">
          {books ? null : (
            <>
              <Greeting className="greeting-quiet" />
              <p className="status">{statusLine}</p>
            </>
          )}
        </div>
        <div className="quiet-controls">
          <Music />
          <button type="button" className="btn" aria-pressed={books} onClick={() => setBooks((value) => !value)}>
            {books ? "Hide books" : "Books"}
          </button>
          <button type="button" className="btn" onClick={onNoise}>
            Noise
          </button>
        </div>
      </div>
      {books ? (
        <ShelfBoundary>
          <Bookshelf />
        </ShelfBoundary>
      ) : (
        <>
          <div className="quiet-stage">
            {today === null ? null : <PosterStage index={index} onIndex={setPicked} />}
            <div className="quiet-caption">
              <p className="caption-title" data-testid="quiet-caption">{picked === null ? "Poster of the day" : group.name}</p>
              <p className="caption-text">{picked === null ? `${group.name}. ${group.text}` : group.text}</p>
              {group.note ? <p className="caption-note">{group.note}</p> : null}
            </div>
          </div>
          <Dock index={index} onIndex={setPicked} />
        </>
      )}
    </motion.div>
  )
}
