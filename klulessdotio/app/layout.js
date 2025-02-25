import "./globals.css"
import { Work_Sans, Poppins } from "next/font/google"
import { ThemeProvider } from "./contexts/ThemeContext"
import ThemeToggle from "./components/ThemeToggle"

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
        url: '/icons/tradrAI.png',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/icons/tradrAI.png',
        type: 'image/png',
      }
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${workSans.variable}`}>
      <body className={`${poppins.className} min-h-screen`}>
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}
