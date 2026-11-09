"use client"

import type { ReactNode } from "react"
import { SkyCanvas } from "@/components/sky/SkyCanvas"
import { SkyProvider, useSky } from "@/components/sky/SkyProvider"
import { Footer } from "@/components/writing/Footer"
import { TopBar } from "@/components/writing/TopBar"

/** Tiles and soft text follow the sky's tone. Until the sky is ready, the head script's day class decides. */
function Tone({ children }: { children: ReactNode }) {
  const sky = useSky()
  const tone = sky.ready ? (sky.view.light ? "day" : "night") : undefined
  return (
    <div className="writing" data-tone={tone}>
      {children}
    </div>
  )
}

export function WritingShell({ current, children }: { current?: "Writing"; children: ReactNode }) {
  return (
    <SkyProvider>
      <SkyCanvas />
      <Tone>
        <TopBar current={current} />
        {children}
        <Footer />
      </Tone>
    </SkyProvider>
  )
}
