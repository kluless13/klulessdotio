"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowUpRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import ReactMarkdown from "react-markdown"

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

const SubstackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
)

interface Article {
  id: string
  title: string
  date: string
  content: string
  excerpt: string
}

const articles: Article[] = [
  {
    id: "1",
    title: "Why We Predict",
    date: "Aug 18, 2025",
    excerpt: "Modern neuroscience frames the brain as a prediction machine. Exploring how prediction markets mirror the brain's native operating system.",
    content: `# the predictive brain

Modern neuroscience increasingly frames the brain as a **prediction machine**. At any moment, it generates top-down expectations about incoming sensory data and compares them with bottom-up input. This family of ideas is often called **predictive coding**: higher cortical areas send predictions; sensory areas send back **prediction errors** (mismatch signals) that update internal models (Clark, 2013)(1).

# the free-energy principle

Karl Friston's **free-energy principle** generalizes this: organisms resist disorder by minimizing a quantity ("variational free energy") that upper-bounds **surprise/uncertainty** about sensations (Friston, 2010)(2). Here "free energy" is **not calories**; it's a statistical bound tied to model mismatch.

A trading parallel can be helpful as a **metaphor**: think of free energy like a **spread** between your internal price and incoming data — wider spread ⇒ more uncertainty/mismatch; narrower ⇒ easier, cheaper action. This analogy is illustrative only; Friston does not define free energy as a market spread (2).

# the amygdala: salience and survival

The amygdala is not just a "fear center"; it helps flag **salience** under uncertainty and supports defensive learning (LeDoux, 2000)(3). Picture rustling in the bushes at night: before conscious appraisal ("wind or predator?"), the amygdala can trigger autonomic readiness — heart rate up, attention narrowed — a bias toward **false alarms** that's adaptive when costs of misses are high (3).

# the prefrontal cortex: training for certainty

If the amygdala is the alarm, the **prefrontal cortex (PFC)** is the strategist. It supports **cognitive control**: maintaining goals, evaluating options, suppressing prepotent impulses, and selecting actions (Miller & Cohen, 2001)(4). In life, PFC "trains" through repeated decisions under uncertainty — e.g., sticking to a plan or rule when emotions tug elsewhere. Each successful override that's rewarded helps stabilize control policies (4).

# prediction errors as the brain's PnL

Midbrain dopamine neurons encode **reward prediction errors** — the difference between expected and received outcomes. Better-than-expected outcomes yield phasic bursts; worse-than-expected, dips. These signals are **teaching signals**, retuning expectations and timing, not mere "pleasure" (Schultz, 1997)(5).

# the pricing parallel

Markets "price in" information; brains "price in" experience. In both, **prediction error** is the engine that updates value estimates. Traders arbitrage mispricings toward consensus; neurons adjust synapses to better fit environmental regularities. Neither system **knows** reality with certainty; both aim for a good enough approximation to act.

# training for certainty

The goal isn't to make the world certain — it's to make your **policy** reliable under uncertainty. You can't control an outcome, but you can control **how you respond** (rules, checklists, risk limits, journaling). Neurally, that's PFC channeling amygdala signals into strategy instead of panic. **Certainty** here means *consistent policy*, not omniscience.

# prediction as the human signature

Why do we predict? Because it's the operating system of consciousness. Much of culture is an **externalization of predictive machinery**: calendars, models, religions, markets, music, science — scaffolds that stabilize uncertainty.

That's why **prediction markets** matter: they're a clear, collective mirror of what brains already do — **minimize mismatch, update expectations, and act** — balancing structured prediction with lived acceptance in the service of survival.

---

## references

1. Clark, A. (2013). *Whatever next? Predictive brains, situated agents, and the future of cognitive science.* Behavioral and Brain Sciences.
2. Friston, K. (2010). *The free-energy principle: a unified brain theory?* Nature Reviews Neuroscience.
3. LeDoux, J.E. (2000). *Emotion circuits in the brain.* Annual Review of Neuroscience.
4. Miller, E.K., & Cohen, J.D. (2001). *An integrative theory of prefrontal cortex function.* Annual Review of Neuroscience.
5. Schultz, W., Dayan, P., & Montague, P.R. (1997). *A neural substrate of prediction and reward.* Science.`,
  },
  {
    id: "2",
    title: "How PMs Win (If They Win)",
    date: "Aug 21, 2025",
    excerpt: "Prediction markets don't beat futures in hedging or casinos in gambling. They win if they become infrastructure for truth.",
    content: `### prediction markets: not about the money

Prediction markets look like casinos at first glance. You put money down, you win or lose. But the real story is not about gambling or hedging — we already have futures, options, and swaps for that. Those instruments are deep, liquid, and regulatory-blessed (Hull, 2017)(1).

Prediction markets, by comparison, have historically struggled with liquidity and faced legal scrutiny. As *hedging tools*, they lose.

Where they *can* win is as **information systems**.

---

### markets as truth engines

Prediction markets aggregate dispersed beliefs into a single number: the price. That price is not just odds; it's a living probability estimate backed by skin in the game.

Robin Hanson, who pioneered much of this field, formalized market scoring rules and argued for markets as **truth-seeking mechanisms** that elicit and aggregate forecasts (Hanson, 2002; 2003)(2)(3). Markets don't just reflect known data — they *incentivize the discovery of unknown data*.

---

### polymarket: the proof of concept

Polymarket is a prominent live example. Its markets on elections, geopolitics, and culture have often tracked outcomes faster or more tightly than punditry and many polling averages; major press covered how prediction markets called key 2024 dynamics when poll models lagged (WSJ, 2024)(4). Today, Polymarket prices frequently serve as a **reference point** for "the crowd's odds."

The magic here isn't that people make money. It's that the market becomes an **informational baseline** — a source of truth in real time.

---

### how PMs win (if they win)

Prediction markets don't beat futures in hedging or beat casinos in gambling. They win if they become infrastructure for truth.

But truth alone isn't enough. They must overcome liquidity, regulation, manipulation, ambiguous resolutions, competition from experts/AI, and adoption hurdles. They must prove their information is not just *different* but **indispensable**.

The optimistic case: PMs evolve into the **Bloomberg of uncertainty** — a layer of real-time probabilities that guide decisions across society.

The skeptical case: they remain niche, fun, and sometimes accurate, but structurally sidelined.

Both outcomes are possible. That's the bet.`,
  },
  {
    id: "3",
    title: "Can PMs Save Science?",
    date: "Aug 25, 2025",
    excerpt: "Prediction markets won't fix science alone — but they price the thing science ultimately seeks: truth.",
    content: `## the reproducibility crisis

Modern science has a trust problem. Studies suggest that **many published findings do not replicate**. A foundational critique argued that structural incentives and low prior odds make most "positive" findings likely false (Ioannidis, 2005)(1). In psychology, the Open Science Collaboration (2015) tried to replicate 100 experiments and found only **36%** produced statistically significant results in the same direction (2). In cancer biology, Amgen scientists reported they could reproduce **6 of 53** "landmark" preclinical studies (Begley & Ellis, 2012)(3).

The economic cost is large: one estimate put **irreproducible U.S. preclinical biomedical research** at **~$28B per year** (Freedman, Cockburn & Simcoe, 2015)(4).

---

## the case for betting on truth

What if, instead of publishing into the void, we let **markets price the likelihood a claim will replicate**?

**Example 1: Psychology replication markets.** For 44 psychology studies, **prediction markets** forecasted replication outcomes **and outperformed individual survey forecasts** (Dreber et al., 2015)(5).

**Example 2: Economics replications.** In experimental economics, a replication project ran **both surveys and prediction markets**. **Both** tracked outcomes; **neither clearly beat the other**, and both **overestimated** true replication rates—useful signal, but imperfect (Camerer et al., 2016)(6).

---

## pricing truth

Prediction markets won't fix science alone—but they **price the thing science ultimately seeks**: truth.

Where journals reward prestige, **markets reward accuracy**; where narratives dominate, **prices discipline**; where hype misallocates resources, **probabilities redirect** them.

By **pricing truth**, we channel funding toward **robust** findings and away from fragile ones—saving money **and** accelerating discovery. When truth is priced, **breakthroughs compound faster**.`,
  },
  {
    id: "4",
    title: "Networks Needed for PMs",
    date: "Aug 25, 2025",
    excerpt: "A prediction market isn't just a pricing mechanism; it's a networked system. Value scales with users, complements, and adopters.",
    content: `### why networks matter

A prediction market isn't just a pricing mechanism; it's a **networked system**. Value scales with users (traders + forecasters), complements (data feeds, terminals, APIs), and adopters (funds, firms, policymakers). In econ terms, PMs are classic **network-effect** / **two-sided platform** businesses: more users → better prices → more complements → more users (Katz & Shapiro, 1985)(1); (Rochet & Tirole, 2003)(2).

---

### direct vs indirect network effects

- **Direct effects:** more participants → tighter spreads, faster incorporation of info, more robust prices (Wolfers & Zitzewitz, 2004)(3).
- **Indirect effects:** integrations (APIs, dashboards, terminals) attract institutions; institutional use attracts more liquidity; the **flywheel** turns (Rochet & Tirole, 2003)(2).

---

### who belongs in the network?

1. **Retail participants** (breadth, speed)
2. **Domain experts** (informed priors)
3. **Institutions** (scale, persistence)
4. **Platforms & meta-platforms** (exchanges + aggregators)
5. **Infrastructure** (identity/AML, market makers, oracles, APIs, analytics)

Think **participants × pipes × products**—all three layers must grow.

---

## bottom line

PMs don't become infrastructure by being a single site with a ticker. They become infrastructure when **networks**—participants, platforms, oracles, APIs, auditors, analysts, and adopters—**mesh**. That's when a price stops being trivia and starts steering **capital, policy, and science**.`,
  },
]

const timelineItems = [
  {
    year: "2024–now",
    title: "Founder of Kairos",
    company: "Kairos",
    description:
      "Gave up PhD to build out the future of prediction markets. Building infrastructure that lets us not only forecast the future but shape it.",
  },
  {
    year: "2023",
    title: "Master's in Marine Science",
    company: "James Cook University",
    description: "World's top-ranked program for marine biology. Built FishTally — AI-powered fish counting from underwater video.",
  },
  {
    year: "2021–22",
    title: "Home Baker & Crypto Explorer",
    company: "Independent",
    description:
      "8+ orders/day for 4.5 months with a busted oven. Baked challah, babkas, bagels. Explored the crypto space.",
  },
  {
    year: "2020",
    title: "Bachelor's in Marine Science",
    company: "AMITY University",
    description: "Where the journey into marine biology began.",
  },
  {
    year: "1999",
    title: "Born",
    company: "",
    description: "The universe started observing itself through new eyes.",
  },
]

// Poster data - add your poster filenames here
// orientation: 'portrait' for 842x1191 (A3), 'landscape' for 2382x1191
const posters = [
  { src: "/posters/kairos 1.png", alt: "Kairos 1", orientation: "portrait" as const },
  { src: "/posters/kairos 2.png", alt: "Kairos 2", orientation: "portrait" as const },
  { src: "/posters/kairos 3.png", alt: "Kairos 3", orientation: "portrait" as const },
  { src: "/posters/kairos 4.png", alt: "Kairos 4", orientation: "portrait" as const },
  { src: "/posters/kairos 5.png", alt: "Kairos 5", orientation: "landscape" as const },
  { src: "/posters/kairos 6.png", alt: "Kairos 6", orientation: "landscape" as const },
  { src: "/posters/kairos 7.png", alt: "Kairos 7", orientation: "landscape" as const },
  { src: "/posters/kairos 8.png", alt: "Kairos 8", orientation: "landscape" as const },
  { src: "/posters/polymarket RT-01A.png", alt: "Polymarket", orientation: "portrait" as const },
  { src: "/posters/polymarket RT-02A.png", alt: "Polymarket", orientation: "portrait" as const },
  { src: "/posters/kalshi RT-01.png", alt: "Kalshi", orientation: "portrait" as const },
  { src: "/posters/kalshi RT-02.png", alt: "Kalshi", orientation: "portrait" as const },
  { src: "/posters/dome RT-01.png", alt: "Dome", orientation: "portrait" as const },
  { src: "/posters/dome RT-02.png", alt: "Dome", orientation: "portrait" as const },
  { src: "/posters/limitless RT-01.png", alt: "Limitless", orientation: "portrait" as const },
  { src: "/posters/limitless RT-02.png", alt: "Limitless", orientation: "portrait" as const },
  { src: "/posters/melee RT-01.png", alt: "Melee", orientation: "portrait" as const },
  { src: "/posters/melee RT-02.png", alt: "Melee", orientation: "portrait" as const },
  { src: "/posters/myriad RT-01D - YES special.png", alt: "Myriad", orientation: "portrait" as const },
  { src: "/posters/myriad RT-01E - YES special.png", alt: "Myriad", orientation: "portrait" as const },
  { src: "/posters/myriad RT-01F - YES.png", alt: "Myriad", orientation: "portrait" as const },
  { src: "/posters/myriad RT-02A - YES.png", alt: "Myriad", orientation: "portrait" as const },
  { src: "/posters/truf network RT-01.png", alt: "Truf Network", orientation: "portrait" as const },
  { src: "/posters/truf network RT-02.png", alt: "Truf Network", orientation: "portrait" as const },
]

export default function Home() {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  
  // Carousel state
  const carouselRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
  const autoScrollRef = useRef<number | null>(null)
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const posterRefs = useRef<(HTMLDivElement | null)[]>([])
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll logic
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return
    
    const scroll = () => {
      if (carouselRef.current && !isAutoScrollPaused) {
        carouselRef.current.scrollLeft += 1
        
        // Reset to start when we've scrolled halfway (for seamless loop)
        const maxScroll = carouselRef.current.scrollWidth / 2
        if (carouselRef.current.scrollLeft >= maxScroll) {
          carouselRef.current.scrollLeft = 0
        }
      }
      autoScrollRef.current = requestAnimationFrame(scroll)
    }
    autoScrollRef.current = requestAnimationFrame(scroll)
  }, [isAutoScrollPaused])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current)
      autoScrollRef.current = null
    }
  }, [])

  // Initialize auto-scroll
  useEffect(() => {
    if (!isAutoScrollPaused) {
      startAutoScroll()
    } else {
      stopAutoScroll()
    }
    return () => stopAutoScroll()
  }, [isAutoScrollPaused, startAutoScroll, stopAutoScroll])

  // Resume auto-scroll after user interaction
  const scheduleResumeAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoScrollPaused(false)
    }, 3000) // Resume after 3 seconds of no interaction
  }, [])

  // Mouse events for desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setIsAutoScrollPaused(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
    carouselRef.current.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2 // Multiply for faster scroll
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab'
    }
    scheduleResumeAutoScroll()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      if (carouselRef.current) {
        carouselRef.current.style.cursor = 'grab'
      }
      scheduleResumeAutoScroll()
    }
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setIsAutoScrollPaused(true)
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
    if (isMobile) updateParallax()
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    scheduleResumeAutoScroll()
  }
  
  // Parallax effect for mobile
  const updateParallax = useCallback(() => {
    if (!carouselRef.current || !isMobile) return
    
    const carousel = carouselRef.current
    const carouselRect = carousel.getBoundingClientRect()
    const centerX = carouselRect.width / 2
    
    posterRefs.current.forEach((posterEl) => {
      if (!posterEl) return
      const img = posterEl.querySelector('.parallax-img') as HTMLElement
      if (!img) return
      
      const rect = posterEl.getBoundingClientRect()
      const posterCenterX = rect.left + rect.width / 2 - carouselRect.left
      const distanceFromCenter = (posterCenterX - centerX) / centerX
      
      // Apply parallax: image moves opposite to scroll direction
      const parallaxOffset = distanceFromCenter * -20 // max 20px offset
      img.style.transform = `scale(1.15) translateX(${parallaxOffset}px)`
    })
  }, [isMobile])
  
  // Update parallax on scroll
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return
    
    const carousel = carouselRef.current
    const handleScroll = () => updateParallax()
    
    carousel.addEventListener('scroll', handleScroll, { passive: true })
    updateParallax() // Initial call
    
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [isMobile, updateParallax])

  const openArticle = (articleId: string) => {
    setExpandedArticle(articleId)
    document.body.style.overflow = "hidden"
  }

  const closeArticle = () => {
    setExpandedArticle(null)
    document.body.style.overflow = "auto"
  }

  const selectedArticle = articles.find((a) => a.id === expandedArticle)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="grid-pattern" />
        
        {/* Light Rays */}
        <div className="light-rays" />
        
        {/* Animated Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        
        {/* Glow Orb */}
        <div className="glow-orb" style={{ top: '20%', right: '10%' }} />
        <div className="glow-orb" style={{ bottom: '30%', left: '5%', animationDelay: '-4s' }} />
      </div>

      {/* Navigation - Fully transparent */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-5 max-w-5xl flex justify-between items-center">
          <a href="/" className="font-serif text-xl font-bold italic">
            onetrillionx
          </a>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/kluless13"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <GitHubIcon />
            </a>
            <a
              href="https://twitter.com/kluless_"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <XIcon />
            </a>
            <a
              href="https://substack.com/@deltaconfidence"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <SubstackIcon />
            </a>
            <div className="w-px h-5 bg-border mx-1" />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 max-w-5xl pt-24 relative z-10">
        {/* Hero Section */}
        <section className="py-20 sm:py-32">
          <div className="fade-in-up">
            <h1 className="font-serif mb-6 text-[28px] sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block font-bold italic">1<span className="text-primary" style={{ paddingLeft: '3px', paddingRight: '3px', letterSpacing: '3.2px' }}>,000,000,000,000</span>x</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mb-8 font-medium">
              Founder of{" "}
              <a
                href="https://kairos.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4 font-medium"
              >
                Kairos
              </a>
              . Building prediction market infrastructure — tools that let us{" "}
              <em className="font-serif">forecast the future</em> and shape it.
            </p>
            <a
              href="https://calendly.com/kairos-kluless/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="group">
                Book a call
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </a>
          </div>
        </section>

        {/* About Section */}
        <section className="section">
          <p className="section-title fade-in stagger-1">About</p>
          <div className="grid md:grid-cols-2 gap-12 fade-in-up stagger-2">
            <div className="prose-elegant">
              <p>
                I like baking, data, lifting heavy, and <em className="font-serif">predicting the future</em>. My journey started in marine science — I earned my Master's at James Cook University, the world's top-ranked program for marine biology.
              </p>
              <p>
                My passion for biology, robotics, and AI led me to build <strong>FishTally</strong> — an AI-powered tool that automated fish counts and coral detection from underwater video, saving over 100 hours of manual work each week.
              </p>
            </div>
            <div className="prose-elegant">
              <p>
                Beyond marine robotics, I've built products across climate, AI, and emerging tech. At PurposeFi, I developed ESG intelligence engines. At DeTrash, I scaled operations from 300 to 51,000+ recyclers in India.
              </p>
              <p className="text-muted-foreground">
                <em className="font-serif" style={{ fontWeight: 600, fontSize: '22px', letterSpacing: '1.1px' }}>I thrive in ambiguity, move fast with structure, and bring a blend of analytical rigor, emerging-tech fluency, and real operational experience.</em>
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="section">
          <p className="section-title fade-in">Timeline</p>
          <div className="space-y-8 fade-in-up stagger-2">
            {timelineItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 sm:gap-8"
              >
                <div className="text-muted-foreground text-sm sm:text-base font-medium">
                  {item.year}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold mb-1">{item.title}</h3>
                  {item.company && (
                    <p className="text-primary text-sm mb-2 italic">{item.company}</p>
                  )}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Writing Section */}
        <section className="section">
          <p className="section-title fade-in">Writing</p>
          <div className="grid sm:grid-cols-2 gap-6 fade-in-up stagger-2">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => openArticle(article.id)}
                className="text-left p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 card-hover group"
              >
                <p className="text-sm text-muted-foreground mb-2">{article.date}</p>
                <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center text-sm text-primary mt-4 group-hover:underline underline-offset-4">
                  Read more
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Posters Carousel Section */}
        <section className="section">
          <p className="section-title fade-in">Posters</p>
          <p className="text-muted-foreground mb-8 fade-in-up">
            <em className="font-serif">A collection of visual work.</em>
          </p>
        </section>
      </main>

      {/* Full-width Poster Carousel - Outside container for edge-to-edge */}
      <div className="w-full py-8 relative z-10">
        <div 
          ref={carouselRef}
          className="poster-carousel-interactive"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div ref={trackRef} className="poster-track-interactive">
            {/* First set of posters */}
            {posters.map((poster, i) => (
              <div 
                key={`poster-a-${i}`} 
                ref={(el) => { posterRefs.current[i] = el }}
                className={poster.orientation === 'landscape' ? 'poster-item-wide' : 'poster-item'}
              >
                <div 
                  className={`${poster.orientation === 'landscape' ? 'aspect-[2/1]' : 'aspect-[842/1191]'} rounded-xl bg-muted/30 border border-border/50 overflow-hidden pointer-events-none`}
                >
                  {poster.src ? (
                    <img 
                      src={poster.src} 
                      alt={poster.alt || `Poster ${i + 1}`}
                      className="parallax-img w-full h-full object-cover object-center select-none"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                      <span className="font-serif text-lg">{poster.alt || `Poster ${i + 1}`}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {posters.map((poster, i) => (
              <div 
                key={`poster-b-${i}`} 
                ref={(el) => { posterRefs.current[posters.length + i] = el }}
                className={poster.orientation === 'landscape' ? 'poster-item-wide' : 'poster-item'}
              >
                <div 
                  className={`${poster.orientation === 'landscape' ? 'aspect-[2/1]' : 'aspect-[842/1191]'} rounded-xl bg-muted/30 border border-border/50 overflow-hidden pointer-events-none`}
                >
                  {poster.src ? (
                    <img 
                      src={poster.src} 
                      alt={poster.alt || `Poster ${i + 1}`}
                      className="parallax-img w-full h-full object-cover object-center select-none"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                      <span className="font-serif text-lg">{poster.alt || `Poster ${i + 1}`}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl relative z-10">
        {/* Substack Section */}
        <section className="section py-12 sm:py-16 md:py-24">
          <p className="section-title fade-in text-xs sm:text-sm">Newsletter</p>
          <div className="fade-in-up stagger-2 max-w-xl">
            <div className="rounded-xl sm:rounded-2xl bg-muted/50 border border-border/50 p-4 sm:p-6 md:p-8 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 text-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">Delta Confidence</h3>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                <em className="font-serif">Deep dives on prediction markets, AI, and building the future.</em>
              </p>
              <a
                href="https://deltaconfidence.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base">
                  Subscribe
                  <ArrowUpRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </a>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">
                Free weekly newsletter. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} onetrillionx
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            <em className="font-serif">fka kluless</em>
          </p>
        </footer>
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen">
            <div className="container mx-auto px-6 max-w-3xl py-8">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-background/95 backdrop-blur-sm py-4 -mx-6 px-6">
                <button
                  onClick={closeArticle}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  Close
                </button>
                <p className="text-muted-foreground text-sm">{selectedArticle.date}</p>
              </div>
              
              <article className="fade-in">
                <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-8">
                  {selectedArticle.title}
                </h1>
                <div className="prose-elegant">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-12 mb-4">{children}</h2>
                      ),
                      h2: ({ children }) => (
                        <h3 className="font-serif text-xl sm:text-2xl font-bold mt-10 mb-4">{children}</h3>
                      ),
                      h3: ({ children }) => (
                        <h4 className="font-serif text-lg font-bold italic mt-8 mb-3">{children}</h4>
                      ),
                      p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                      ul: ({ children }) => (
                        <ul className="list-disc list-outside ml-6 mb-4 space-y-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">{children}</ol>
                      ),
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => <em className="font-serif italic">{children}</em>,
                      hr: () => <hr className="my-8 border-border/50" />,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary pl-4 my-4 font-serif italic text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {selectedArticle.content}
                  </ReactMarkdown>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
