import { GeistSans } from "geist/font/sans"
import { Averia_Serif_Libre, EB_Garamond, Fraunces, Inter, Newsreader } from "next/font/google"

// next/font needs literal options, so the weights below are written out.
// They mirror the weights declared in content/library.ts.
// Browsers fetch a face only when it is used: the tile loads one weight, the sheet the rest.
const inter = Inter({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], display: "swap", preload: false })
const averia = Averia_Serif_Libre({ subsets: ["latin"], weight: ["300", "400", "700"], display: "swap", preload: false })
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
})
const garamond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap", preload: false })
const fraunces = Fraunces({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], display: "swap", preload: false })

// Fontshare's ITF Free Font License does not allow the files in a public repository,
// so these three load from Fontshare's own stylesheet. The Library layout renders it.
export const FONTSHARE_STYLESHEET =
  "https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&f[]=switzer@100,200,300,400,500,600,700,800,900&f[]=general-sans@200,300,400,500,600,700&display=swap"

const FAMILIES: Readonly<Record<string, string>> = {
  geist: GeistSans.style.fontFamily,
  inter: inter.style.fontFamily,
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  satoshi: "Satoshi, sans-serif",
  switzer: "Switzer, sans-serif",
  "general-sans": '"General Sans", sans-serif',
  "averia-serif-libre": averia.style.fontFamily,
  newsreader: newsreader.style.fontFamily,
  "eb-garamond": garamond.style.fontFamily,
  fraunces: fraunces.style.fontFamily,
}

export function fontFamily(slug: string): string {
  const family = Object.hasOwn(FAMILIES, slug) ? FAMILIES[slug] : undefined
  if (!family) throw new Error(`Unknown library font: ${slug}`)
  return family
}
