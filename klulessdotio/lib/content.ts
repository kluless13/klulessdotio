// Translations are drafts. Any language not confirmed by a native speaker before launch should be removed from this list.
export const GREETINGS = [
  { lang: "en", text: "Hi, I'm Angad.", dir: "ltr" },
  { lang: "ta", text: "வணக்கம், நான் அங்கத்.", dir: "ltr" },
  { lang: "es", text: "Hola, soy Angad.", dir: "ltr" },
  { lang: "zh", text: "你好，我是 Angad。", dir: "ltr" },
  { lang: "ja", text: "こんにちは、Angad です。", dir: "ltr" },
  { lang: "hi", text: "नमस्ते, मैं अंगद हूँ।", dir: "ltr" },
  { lang: "fr", text: "Salut, je suis Angad.", dir: "ltr" },
  { lang: "ko", text: "안녕하세요, Angad입니다.", dir: "ltr" },
  { lang: "pt", text: "Olá, eu sou o Angad.", dir: "ltr" },
  { lang: "ar", text: "مرحبًا، أنا Angad.", dir: "rtl" },
  { lang: "de", text: "Hallo, ich bin Angad.", dir: "ltr" },
] as const

export const BELIEFS = [
  "Most fields aren't short of ideas. They're short of tools.",
  "I follow my gut first, then go find the data.",
  "You don't learn and then do. You do, and then you learn.",
] as const

export const ORIGIN =
  "I started out counting fish with a pencil, floating off the Queensland coast. Every time I looked down at my slate, the current dragged me 30 feet off the line. That problem is what taught me to code."

export const MY_DAYS =
  "Whatever the day calls for: hardcore engineering, GTM strategy, creative design, sales calls, index development, and modelling (the forecasting kind, not runway)."

export const COPYRIGHT = "© 2026 Angad Maniyambath"

export const HISTORY_LINE = "Marine science, bread, prediction markets, AI. Each one gave me a tool."

export const REACH = [
  { name: "Telegram", href: "https://t.me/onetrillionx" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/angad-maniyambath-b019293a7/" },
  { name: "X", href: "https://twitter.com/onetrillionx" },
  { name: "GitHub", href: "https://github.com/kluless13" },
] as const

export const BUILD = [
  { name: "Forecasting models", text: "Macro and other forecasting models, from the data pipeline through to the prediction." },
  { name: "AI engineering", text: "Agent harnesses, agent automation and end-to-end deployment." },
  { name: "Web and product", text: "Frontend and backend, built and shipped as one working product." },
] as const

export interface Project {
  name: string
  href: string
  text: string
  badge?: { text: string; href: string }
}

export const PROJECTS: readonly Project[] = [
  { name: "STRIKE", href: "https://strike.oranj.co", text: "Grant-winning smart transaction layer integrating dApps with social platforms." },
  {
    name: "FishTally",
    href: "https://github.com/kluless13/fishtally",
    text: "Automated fish detection and counting tool using YOLOv8 + ByteTrack.",
    badge: { text: "Published in SoftwareX, 2026", href: "https://www.sciencedirect.com/science/article/pii/S2352711026001366" },
  },
  { name: "PM Data Analyses", href: "https://github.com/kluless13/pm-data-analyses", text: "Research on prediction market trader behaviour. Analysed 242,640 traders across Polymarket." },
]

export interface TimelineEntry {
  when: string
  what: string
  text?: string
  logo?: "truflation" | "trufonomics"
}

export const TIMELINE: readonly TimelineEntry[] = [
  { when: "Apr 2026 to present", what: "Head of AI, Truflation", logo: "truflation", text: "Joined after Truflation acquired Trufonomics. Building Truman, a purpose-built macro agent, plus AI systems for inflation intelligence, data products, and forecasting workflows." },
  { when: "Dec 2025 to Apr 2026", what: "Founder, Trufonomics", logo: "trufonomics", text: "Founded solo. A prediction-market and macro intelligence project, acquired by Truflation in April 2026." },
  { when: "2024 to 2025", what: "Founder, BetBTC.win", text: "Built a Bitcoin-denominated prediction market, focusing on market creation, position accounting, settlement flows, and BTC-native pricing." },
  { when: "2023 to 2025", what: "Co-Founder, PurposeFi", text: "Built ESG intelligence engines from scratch. Reduced 4-5 month analyses to 48-hour automated diagnostics for ASX200 companies and super funds." },
  { when: "2023 to 2024", what: "Co-Founder, DeTrash", text: "Scaled recycler network from 300 to 51,000+ across India. Led partnerships, carbon credit procurement (6M+ credits), and operational strategy." },
  { when: "2022 to 2024", what: "Masters in Marine Biology, James Cook University" },
  { when: "2022 to 2023", what: "Marine Robotics Intern, Flyingfish Tech", text: "Built FishTally, an automated fish detection and counting tool using YOLOv8 + ByteTrack, now published in SoftwareX." },
  { when: "2022", what: "Research Analyst, Blueshift Economy", text: "Environmental policy research supporting NEOM's blue-economy and climate strategy in the Red Sea." },
  { when: "2020 to 2022", what: "Founder, Baked", text: "A home bakery during the pandemic: one oven, 25 to 30 orders a week, and strangers asking if I was the bread guy. It's also when I got into web3, blockchain and ReFi." },
  { when: "2017 to 2020", what: "B.Sc(H) Marine Science & Tech, Amity University" },
]

export const PLAYLIST_URL = "https://open.spotify.com/embed/playlist/1HhwGBbAHTamfntjxtLPTa?utm_source=generator&theme=0"
