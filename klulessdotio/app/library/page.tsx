import { LibraryView } from "@/components/library/LibraryView"
import { ToneShell } from "@/components/ToneShell"

export default function LibraryPage() {
  return (
    <ToneShell className="library" current="Library">
      <LibraryView />
    </ToneShell>
  )
}
