"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Custom Icons
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

// GitHub repos data with curated details
const repos = [
  {
    name: "pm-data-analyses",
    description: "Prediction market research pipeline powering all my PM articles.",
    url: "https://github.com/kluless13/pm-data-analyses",
    tags: ["Python", "Research", "Data Analysis"],
    details: {
      stats: "242K traders • 3.55M positions (Polymarket) + 1.77M contracts • 686K trades (Kalshi)",
      articles: [
        { title: "Nothing Ever Happens", finding: "72% of contracts resolve NO" },
        { title: "The Whale Paradox", finding: "Large traders, counterintuitive returns" },
        { title: "The 124x Generalist Advantage", finding: "Generalists outperform specialists" },
        { title: "The 1% Problem", finding: "Gini coefficient 0.959" },
      ]
    }
  },
  {
    name: "FishTally",
    description: "AI-driven fish detection and counting for marine ecology.",
    url: "https://github.com/kluless13/fishtally",
    tags: ["Python", "Computer Vision", "YOLOv8"],
    details: {
      stats: "YOLOv8 + ByteTrack • DeepFish dataset • Published preprint",
      features: ["Automated species detection", "Multi-object tracking", "Biodiversity metrics", "Large-scale survey processing"]
    }
  },
  {
    name: "ethos-research",
    description: "Validating on-chain reputation against real social relationships.",
    url: "https://github.com/kluless13/ethos-research",
    tags: ["Research", "Web3", "Reputation"],
    details: {
      stats: "Cross-referenced vouches with Twitter engagement data",
      finding: "When someone stakes ETH to vouch for another person, do they actually have a real social relationship?"
    }
  },
  {
    name: "ethos-ts-sdk",
    description: "First TypeScript SDK for Ethos Network API.",
    url: "https://github.com/kluless13/ethos-ts-sdk",
    tags: ["TypeScript", "SDK", "npm"],
    details: {
      stats: "97.78% test coverage • Published on npm",
      features: ["Full API coverage", "Type-safe", "Async/await patterns"]
    }
  },
  {
    name: "ethos-py",
    description: "First Python SDK for Ethos Network API.",
    url: "https://github.com/kluless13/ethos-python-sdk",
    tags: ["Python", "SDK", "PyPI"],
    details: {
      stats: "Published on PyPI",
      features: ["Full API coverage", "Pythonic interface", "Async support"]
    }
  },
  {
    name: "Wuxian",
    description: "Creator intelligence for crypto ecosystems.",
    url: "https://github.com/kluless13/swarm",
    tags: ["Python", "AI", "Web3"],
    details: {
      stats: "X signal → creator-ecosystem matching",
      features: ["Social graph analysis", "Engagement scoring", "Ecosystem fit detection"]
    }
  },
  {
    name: "ESGwiki",
    description: "ESG intelligence engine for automated diagnostics.",
    url: "https://github.com/kluless13/esgWIKI",
    tags: ["Python", "ESG", "Automation"],
    details: {
      stats: "4-5 month analyses → 48-hour automated diagnostics",
      features: ["ASX200 coverage", "Super fund analysis", "Automated reporting"]
    }
  },
  {
    name: "Flowerpress",
    description: "Pinterest-style board for pressing flowers.",
    url: "https://github.com/kluless13/flowerpress",
    tags: ["Next.js", "React", "Firebase"],
    details: {
      features: ["Visual board layout", "Collection management", "Image uploads"]
    }
  },
  {
    name: "Terminal Players",
    description: "YouTube Music and Spotify terminal UI players.",
    url: "https://github.com/kluless13",
    tags: ["Terminal", "UI", "Music"],
    details: {
      features: ["TUI interface", "Playback controls", "Search and queue"]
    }
  },
]

// Poster descriptions based on filename
function getPosterDescription(filename: string, category: string): string {
  const name = filename.replace('.png', '').toLowerCase()

  if (category === "prediction-platforms") {
    if (name.includes("truf")) return "TRUF Network — Prediction market infrastructure"
    if (name.includes("polymarket")) return "Polymarket — The largest prediction market"
    if (name.includes("kalshi")) return "Kalshi — CFTC-regulated prediction exchange"
    if (name.includes("dome")) return "Dome — Prediction market analytics"
    if (name.includes("limitless")) return "Limitless — Decentralized prediction markets"
    if (name.includes("melee")) return "Melee — Gaming prediction markets"
    if (name.includes("myriad")) return "Myriad — YES/NO market designs"
  }

  if (category === "bobbin-study") {
    const num = name.match(/\d+/)?.[0] || ""
    return `Bobbin Study ${num} — Threads growth app branding`
  }

  if (category === "perplexity-inspiration") {
    const num = name.match(/\d+/)?.[0] || ""
    return `Inspiration ${num} — Surreal experience-focused design`
  }

  if (category === "quartr-design") {
    if (name.includes("crude")) return "Crude Oil — Commodity poster series"
    if (name.includes("gold")) return "Gold — Commodity poster series"
    if (name.includes("mcdonalds")) return "McDonald's Index — Economic indicator series"
    if (name.includes("trufonomics")) return "Trufonomics — Brand identity"
  }

  return filename.replace('.png', '')
}

// Poster categories with descriptions
const posterCategories = [
  {
    id: "prediction-platforms",
    name: "Prediction Platforms",
    folder: "prediction platforms or similar",
    description: "Posters made early on for platforms in the prediction space, building in or around the core incumbents.",
    posters: [
      "truf network RT-01.png",
      "truf network RT-02.png",
      "polymarket RT-01A.png",
      "polymarket RT-02A.png",
      "polymarket RT-01A-1.png",
      "polymarket RT-02A-1.png",
      "kalshi RT-01.png",
      "kalshi RT-02.png",
      "dome RT-01.png",
      "dome RT-02.png",
      "limitless RT-01.png",
      "limitless RT-02.png",
      "melee RT-01.png",
      "melee RT-02.png",
      "myriad RT-01D - YES special.png",
      "myriad RT-01E - YES special.png",
      "myriad RT-01F - YES.png",
      "myriad RT-02A - YES.png",
    ]
  },
  {
    id: "bobbin-study",
    name: "Bobbin Study",
    folder: "bobbin study",
    description: "Made for my friend Jeff who is the creator of Bobbin — bobbin.now — a Threads growth helper app. I use the app and have, in about 30 days amassed close to 200k views. He loved the designs I made for him.",
    posters: Array.from({ length: 25 }, (_, i) => `bobbin study ${i + 1}.png`)
  },
  {
    id: "perplexity-inspiration",
    name: "Perplexity Inspiration",
    folder: "perplexity inspiration",
    description: "Inspired by Perplexity's design where you convey the message with surreal backgrounds, without talking about the product. All experiences only.",
    posters: Array.from({ length: 9 }, (_, i) => `insp ${i + 1}.png`)
  },
  {
    id: "quartr-design",
    name: "Quartr Design",
    folder: "quartr design inspiration",
    description: "Quartr app does a great job of making an unsexy sector, sexy, with its designs that capture attention. Posters that make each earnings call seem museum or frame worthy.",
    posters: [
      "crude oil 1.png",
      "crude oil 2.png",
      "crude oil 3.png",
      "crude oil 4.png",
      "gold 1.png",
      "gold 2.png",
      "gold 3.png",
      "gold 4.png",
      "mcdonalds index 1.png",
      "mcdonalds index 2.png",
      "mcdonalds index 3.png",
      "mcdonalds index 4.png",
      "mcdonalds index 5.png",
      "mcdonalds index 6.png",
      "trufonomics.png",
      "trufonomics B.png",
    ]
  },
]

export default function PortfolioPage() {
  const [activeSection, setActiveSection] = useState<"code" | "design">("code")
  const [selectedCategory, setSelectedCategory] = useState(posterCategories[0])
  const [selectedPoster, setSelectedPoster] = useState<{ src: string; name: string } | null>(null)
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null)

  // Close modal on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPoster(null)
        setExpandedRepo(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/trufonomics logo111 - light mode.png"
              alt="Logo"
              className="h-6 w-6"
            />
            <span className="font-semibold text-lg hidden sm:inline">1tx.dev</span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/portfolio"
              className="px-2 sm:px-3 py-1.5 text-sm text-foreground font-medium"
            >
              Portfolio
            </Link>
            <Link
              href="/writing"
              className="px-2 sm:px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Writing
            </Link>
            <div className="w-px h-4 bg-border mx-1 sm:mx-2" />
            <a
              href="https://github.com/kluless13"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitHubIcon />
            </a>
            <a
              href="https://twitter.com/onetrillionx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Portfolio</h1>
          <p className="text-muted-foreground">
            Code and design work.
          </p>
        </header>

        {/* Section Toggle */}
        <div className="flex gap-1 mb-8 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveSection("code")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveSection("design")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === "design"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Design
          </button>
        </div>

        {/* Code Section */}
        {activeSection === "code" && (
          <section>
            <div className="space-y-3">
              {repos.map((repo, i) => {
                const isExpanded = expandedRepo === repo.name
                return (
                  <div
                    key={i}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    {/* Header - always visible */}
                    <button
                      onClick={() => setExpandedRepo(isExpanded ? null : repo.name)}
                      className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{repo.name}</h3>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <GitHubIcon />
                          </a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {repo.description}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 mt-1"
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </button>

                    {/* Expandable content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
                            <div className="pt-4 space-y-3">
                              {/* Stats */}
                              {repo.details.stats && (
                                <p className="text-sm font-medium text-foreground/90">
                                  {repo.details.stats}
                                </p>
                              )}

                              {/* Finding (for research repos) */}
                              {repo.details.finding && (
                                <p className="text-sm text-muted-foreground italic">
                                  "{repo.details.finding}"
                                </p>
                              )}

                              {/* Articles (for pm-data-analyses) */}
                              {repo.details.articles && (
                                <div className="space-y-2">
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Research</p>
                                  <div className="grid gap-2">
                                    {repo.details.articles.map((article, j) => (
                                      <div key={j} className="text-sm">
                                        <span className="text-foreground font-medium">{article.title}</span>
                                        <span className="text-muted-foreground block sm:inline sm:ml-2">— {article.finding}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Features */}
                              {repo.details.features && (
                                <div className="flex flex-wrap gap-2">
                                  {repo.details.features.map((feature, j) => (
                                    <span
                                      key={j}
                                      className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {repo.tags.map((tag, j) => (
                                  <span
                                    key={j}
                                    className="text-xs px-2 py-0.5 bg-foreground/10 rounded-full text-foreground/70"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Design Section */}
        {activeSection === "design" && (
          <section>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {posterCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedCategory.id === category.id
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Category Description */}
            <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm text-foreground/80">
                {selectedCategory.description}
              </p>
            </div>

            {/* Poster Grid - Full images, no zoom */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {selectedCategory.posters.map((poster, i) => (
                <motion.button
                  key={i}
                  onClick={() => setSelectedPoster({
                    src: `/posters/${selectedCategory.folder}/${poster}`,
                    name: poster
                  })}
                  className="relative bg-muted rounded-lg overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <img
                    src={`/posters/${selectedCategory.folder}/${poster}`}
                    alt={poster.replace('.png', '')}
                    className="w-full h-auto"
                  />
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Poster Lightbox */}
      <AnimatePresence>
        {selectedPoster && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedPoster(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Content */}
            <motion.div
              className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-12 max-w-5xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3
              }}
            >
              {/* Poster - slightly left */}
              <motion.div
                className="flex-shrink-0 w-full max-w-[280px] sm:max-w-md md:max-w-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <img
                  src={selectedPoster.src}
                  alt={selectedPoster.name}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </motion.div>

              {/* Description - on the right */}
              <motion.div
                className="text-center md:text-left max-w-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <p className="text-lg font-medium mb-2">
                  {getPosterDescription(selectedPoster.name, selectedCategory.id)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.name}
                </p>
              </motion.div>

              {/* Close button */}
              <motion.button
                onClick={() => setSelectedPoster(null)}
                className="absolute top-0 right-0 md:-top-4 md:-right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
