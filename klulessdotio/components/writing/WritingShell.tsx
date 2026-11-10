"use client"

import type { ReactNode } from "react"
import { ToneShell } from "@/components/ToneShell"

export function WritingShell({ current, children }: { current?: "Writing"; children: ReactNode }) {
  return (
    <ToneShell className="writing" current={current}>
      {children}
    </ToneShell>
  )
}
