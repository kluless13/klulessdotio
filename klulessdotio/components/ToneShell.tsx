"use client"

import type { ReactNode } from "react"
import { SkyCanvas } from "@/components/sky/SkyCanvas"
import { SkyProvider, useSky } from "@/components/sky/SkyProvider"
import { Footer } from "@/components/writing/Footer"
import { TopBar } from "@/components/writing/TopBar"

type ShellClass = "writing" | "library" | "lost"

/** Tiles and soft text follow the sky's tone. Until the sky is ready, the head script's day class decides. */
function Tone({ className, children }: { className: ShellClass; children: ReactNode }) {
  const sky = useSky()
  const tone = sky.ready ? (sky.view.light ? "day" : "night") : undefined
  return (
    <div className={className} data-tone={tone}>
      {children}
    </div>
  )
}

export function ToneShell({
  className,
  current,
  children,
}: {
  className: ShellClass
  current?: "Writing" | "Library"
  children: ReactNode
}) {
  return (
    <SkyProvider>
      <SkyCanvas />
      <Tone className={className}>
        <TopBar current={current} />
        {children}
        <Footer />
      </Tone>
    </SkyProvider>
  )
}
