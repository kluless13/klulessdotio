import type React from "react"
import type { Metadata } from "next"
import { Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Angad Maniyambath — 1tx.dev",
  description: "Angad's personal site.",
  metadataBase: new URL("https://1tx.dev"),
  icons: {
    icon: "/trufonomics logo11 - dark mode.png",
    apple: "/trufonomics logo11 - dark mode.png",
  },
  openGraph: {
    title: "Angad Maniyambath — 1tx.dev",
    description: "Angad's personal site.",
    url: "https://1tx.dev",
    siteName: "1tx.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Angad Maniyambath — 1tx.dev",
    description: "Angad's personal site.",
    creator: "@onetrillionx",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Satoshi font from Fontshare CDN */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans antialiased ${instrumentSerif.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
