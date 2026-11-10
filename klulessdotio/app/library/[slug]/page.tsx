import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LibraryView } from "@/components/library/LibraryView"
import { ToneShell } from "@/components/ToneShell"
import { JsonLd } from "@/components/writing/JsonLd"
import { allItems, itemBySlug } from "@/lib/library/catalogue"
import { itemJsonLd, itemMetadata } from "@/lib/library/seo"

type Props = { params: { slug: string } }

export const dynamicParams = false

export function generateStaticParams() {
  return allItems().map((item) => ({ slug: item.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const item = itemBySlug(params.slug)
  return item ? itemMetadata(item) : {}
}

/** The same page as /library, with the item's sheet open. */
export default function LibraryItemPage({ params }: Props) {
  const item = itemBySlug(params.slug)
  if (!item) notFound()
  return (
    <ToneShell className="library" current="Library">
      <JsonLd data={itemJsonLd(item)} />
      <LibraryView initialSlug={item.slug} />
    </ToneShell>
  )
}
