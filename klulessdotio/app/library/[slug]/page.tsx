import { notFound } from "next/navigation"
import { LibraryView } from "@/components/library/LibraryView"
import { ToneShell } from "@/components/ToneShell"
import { allItems, itemBySlug } from "@/lib/library/catalogue"

type Props = { params: { slug: string } }

export const dynamicParams = false

export function generateStaticParams() {
  return allItems().map((item) => ({ slug: item.slug }))
}

/** The same page as /library, with the item's sheet open. */
export default function LibraryItemPage({ params }: Props) {
  const item = itemBySlug(params.slug)
  if (!item) notFound()
  return (
    <ToneShell className="library" current="Library">
      <LibraryView initialSlug={item.slug} />
    </ToneShell>
  )
}
