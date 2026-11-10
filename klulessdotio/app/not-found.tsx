import type { Metadata } from "next"
import { LostAtSea } from "@/components/LostAtSea"
import { ToneShell } from "@/components/ToneShell"
import "./writing/writing.css"
import "./lost.css"

export const metadata: Metadata = {
  title: "Lost at sea · Angad Maniyambath",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <ToneShell className="lost">
      <LostAtSea />
    </ToneShell>
  )
}
