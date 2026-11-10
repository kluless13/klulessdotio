import { LibraryView } from "@/components/library/LibraryView"
import { ToneShell } from "@/components/ToneShell"
import { JsonLd } from "@/components/writing/JsonLd"
import { libraryBreadcrumbs, libraryMetadata } from "@/lib/library/seo"
import { collectionPageJsonLd } from "@/lib/writing/seo"

export const metadata = libraryMetadata()

export default function LibraryPage() {
  return (
    <ToneShell className="library" current="Library">
      <JsonLd data={collectionPageJsonLd()} />
      <JsonLd data={libraryBreadcrumbs()} />
      <LibraryView />
    </ToneShell>
  )
}
