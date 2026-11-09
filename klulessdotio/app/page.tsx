import { Site } from "@/components/Site"
import { JsonLd } from "@/components/writing/JsonLd"
import { personJsonLd, websiteJsonLd } from "@/lib/writing/seo"

export default function Home() {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Site />
    </>
  )
}
