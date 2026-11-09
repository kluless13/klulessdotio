import type { Metadata, Viewport } from "next"
import { SITE_DESCRIPTION } from "@/lib/content"
import { Analytics } from "@vercel/analytics/next"
import { Archivo_Black, Instrument_Sans, Newsreader, Oswald } from "next/font/google"
import type { ReactNode } from "react"
import "./globals.css"

const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-instrument", display: "swap" })
// Book spines use 500 and 600, posts read in 400 and 400 italic. None of it is loaded up front
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
})
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-oswald", display: "swap", preload: false })
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black", display: "swap", preload: false })

const TITLE = "Angad Maniyambath"
const DESCRIPTION = SITE_DESCRIPTION

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://1tx.dev"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://1tx.dev", siteName: "1tx.dev", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hi, I'm Angad." }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, creator: "@onetrillionx", images: ["/og.png"] },
}

export const viewport: Viewport = { themeColor: "#10162a" }

// Picks the tone and mode before the first paint, so nobody gets a flash of the wrong colours or the wrong view
const TONE_SCRIPT = `try{var h=+new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",hour12:false}).format(new Date());if(h>=6&&h<18)document.documentElement.classList.add("day")}catch(e){}try{if(localStorage.getItem("1tx-mode")==="quiet")document.documentElement.classList.add("start-quiet")}catch(e){}`

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${newsreader.variable} ${oswald.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TONE_SCRIPT }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
