import "./globals.css"
import { Work_Sans, Poppins } from "next/font/google"
import { ThemeProvider } from "./contexts/ThemeContext"
import { TracingBeam } from "../components/TracingBeam"

// Load Poppins for body text
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"],
  variable: '--font-poppins',
})

// Load Work Sans for headings
const workSans = Work_Sans({ 
  weight: ['400', '500', '600', '700', '900'],
  subsets: ["latin"],
  variable: '--font-worksans',
})

export const metadata = {
  title: "kluless",
  description: "Interactive portfolio with folder navigation",
  icons: {
    icon: [
      {
        url: '/icons/tradrAI-removebg-preview.png',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/icons/tradrAI-removebg-preview.png',
        type: 'image/png',
      }
    ]
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${poppins.variable} ${workSans.variable}`}>
      <body className={`${poppins.className} min-h-screen bg-black dark-theme`}>
        <ThemeProvider>
          <TracingBeam>
            {children}
          </TracingBeam>
        </ThemeProvider>
      </body>
    </html>
  )
}
