import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Archivo_Black, Instrument_Sans, Newsreader, Oswald } from "next/font/google"
import type { ReactNode } from "react"
import "./globals.css"

const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-instrument", display: "swap" })
// These only style the book spines, so they aren't loaded up front
const newsreader = Newsreader({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-newsreader", display: "swap", preload: false, adjustFontFallback: false })
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-oswald", display: "swap", preload: false })
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black", display: "swap", preload: false })

const TITLE = "Angad Maniyambath"
const DESCRIPTION = "Hi, I'm Angad. Head of AI at Truflation, building Truman, an agent built for macro."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://1tx.dev"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://1tx.dev", siteName: "1tx.dev", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hi, I'm Angad." }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, creator: "@onetrillionx", images: ["/og.png"] },
}

export const viewport: Viewport = { themeColor: "#10162a" }

// Picks the tone before the first paint, so night visitors don't get a flash of the daytime colours
const TONE_SCRIPT = `try{var h=+new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",hour12:false}).format(new Date());if(h>=6&&h<18)document.documentElement.classList.add("day")}catch(e){}`

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
