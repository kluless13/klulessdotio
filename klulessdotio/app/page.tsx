import type { Metadata } from "next"
import { Site } from "@/components/Site"
import { JsonLd } from "@/components/writing/JsonLd"
import { personJsonLd, websiteJsonLd } from "@/lib/writing/seo"

export const metadata: Metadata = { alternates: { canonical: "https://1tx.dev" } }

export default function Home() {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Site />
    </>
  )
}
