import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { GeistSans } from "geist/font/sans"
import "./styles/base.css"
import "./styles/top.css"
import "./styles/sections.css"
import "./styles/slider.css"
import "./styles/people.css"
import "./styles/overlays.css"

const TITLE = "KalibreTrades: get funded, get paid on time"
const DESCRIPTION = "A concept site for KalibreTrades, a prop firm evaluation with a static drawdown and every rule published up front."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  // A demo of someone else's brand: shareable by link, kept out of search
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://1tx.dev/kalibre", siteName: "KalibreTrades concept", type: "website", images: [{ url: "/kalibre/hero-bank.webp", width: 1600, height: 1120, alt: "London's Bank junction, dithered in navy" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/kalibre/hero-bank.webp"] },
}

export const viewport: Viewport = { themeColor: "#2a3848" }

/** The KalibreTrades concept, kept apart from 1tx.dev's own look: its own font, tokens and page colour */
export default function KalibreLayout({ children }: { children: ReactNode }) {
  return <div className={`kt ${GeistSans.variable}`}>{children}</div>
}
