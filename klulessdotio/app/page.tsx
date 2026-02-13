"use client"

import { useState } from "react"
import { ArrowUpRight, Mail, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
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

const SubstackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
)

const experience = [
  {
    period: "2024 – Present",
    role: "Founder",
    company: "Trufonomics",
    description: "",
    link: "https://trufonomics.com",
    hasDropdown: true,
    dropdownImage: "/trufonomics.png"
  },
  {
    period: "2023 – 2024",
    role: "Co-Founder",
    company: "DeTrash",
    description: "Scaled recycler network from 300 to 51,000+ across India. Led partnerships, carbon credit procurement (6M+ credits), and operational strategy.",
  },
  {
    period: "2023 – 2025",
    role: "Co-Founder",
    company: "PurposeFi",
    description: "Built ESG intelligence engines from scratch. Reduced 4-5 month analyses to 48-hour automated diagnostics for ASX200 companies and super funds.",
  },
  {
    period: "2022 – 2023",
    role: "Marine Robotics Intern",
    company: "Flyingfish Tech",
    description: "Built FishTally — AI-driven biodiversity analysis tool using YOLOv8 + ByteTrack. Trained on DeepFish dataset for marine monitoring.",
    link: "https://fft.ai"
  },
  {
    period: "2022",
    role: "Research Analyst",
    company: "Blueshift Economy",
    description: "Environmental policy research supporting NEOM's blue-economy and climate strategy in the Red Sea.",
    link: "https://www.blueshiftconsulting.com.au"
  },
]

const education = [
  {
    period: "2022 – 2024",
    degree: "Masters in Marine Biology",
    institution: "James Cook University",
    location: "Queensland, Australia",
    note: "World's top-ranked program for marine biology"
  },
  {
    period: "2017 – 2020",
    degree: "B.Sc(H) Marine Science & Tech",
    institution: "Amity University",
    location: "Noida, India",
  },
]

const projects = [
  {
    name: "FishTally",
    description: "Automated fish detection and counting using YOLOv8 + ByteTrack for marine ecology research.",
    link: "https://github.com/kluless13/fishtally",
    tags: ["Python", "Computer Vision", "Marine Science"]
  },
  {
    name: "STRIKE",
    description: "Grant-winning smart transaction layer integrating dApps with social platforms.",
    link: "https://strike.oranj.co",
    tags: ["Web3", "Infrastructure"]
  },
  {
    name: "PM Data Analyses",
    description: "Research on prediction market trader behavior. Analyzed 242,640 traders across Polymarket.",
    link: "https://github.com/kluless13/pm-data-analyses",
    tags: ["Python", "Data Analysis", "Research"]
  },
]

export default function Home() {
  const [expandedExp, setExpandedExp] = useState<string | null>(null)

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
              className="px-2 sm:px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
        {/* Header Image */}
        <div className="mb-12 rounded-xl overflow-hidden">
          <img
            src="/substaxck.png"
            alt="Header"
            className="w-full h-auto"
          />
        </div>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-3xl font-bold mb-2">Angad Maniyambath</h1>
          <p className="text-lg text-muted-foreground italic mb-6">
            olives & grains
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed mb-8">
            Building tech to let humanity hedge reality.
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Previously: computational marine science,{" "}
            <a
              href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6019587"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              published research
            </a>
          </p>
          <div className="flex gap-3">
            <a
              href="https://t.me/onetrillionx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              Get in touch
            </a>
          </div>

          {/* GitHub Contribution Chart */}
          <div className="mt-8">
            <img
              src="https://ghchart.rshah.org/kluless13"
              alt="GitHub Contribution Chart"
              className="w-full h-auto opacity-70"
              style={{ filter: "var(--chart-filter, none)" }}
            />
          </div>
        </header>

        {/* Experience */}
        <section className="mb-16">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Experience
          </h2>
          <div className="space-y-8">
            {experience.map((exp, i) => {
              const isExpanded = expandedExp === exp.company
              const hasDropdown = 'hasDropdown' in exp && exp.hasDropdown

              return (
                <div key={i} className="group">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-2">
                    <span className="text-sm text-muted-foreground shrink-0 w-28">
                      {exp.period}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium inline-flex items-center gap-2">
                        {exp.role}
                        <span className="text-muted-foreground font-normal"> at </span>
                        {hasDropdown ? (
                          <button
                            onClick={() => setExpandedExp(isExpanded ? null : exp.company)}
                            className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-4"
                          >
                            {exp.company}
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </motion.span>
                          </button>
                        ) : exp.link ? (
                          <a
                            href={exp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline underline-offset-4"
                          >
                            {exp.company}
                            <ArrowUpRight className="inline h-3 w-3 ml-0.5" />
                          </a>
                        ) : (
                          <span>{exp.company}</span>
                        )}
                      </h3>

                      {/* Dropdown for Trufonomics */}
                      <AnimatePresence>
                        {hasDropdown && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4">
                              <a
                                href={exp.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={(exp as any).dropdownImage}
                                  alt={exp.company}
                                  className="w-full max-w-md rounded-lg"
                                />
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-muted-foreground sm:ml-32">
                      {exp.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Education */}
        <section className="mb-16">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Education
          </h2>
          <div className="space-y-6">
            {education.map((edu, i) => (
              <div key={i}>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
                  <span className="text-sm text-muted-foreground shrink-0 w-28">
                    {edu.period}
                  </span>
                  <div>
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}, {edu.location}
                      {edu.note && <span className="italic"> — {edu.note}</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-16">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Projects
          </h2>
          <div className="space-y-6">
            {projects.map((project, i) => (
              <div key={i} className="group">
                <div className="flex items-baseline gap-2 mb-1">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline underline-offset-4"
                    >
                      {project.name}
                      <ArrowUpRight className="inline h-3 w-3 ml-0.5" />
                    </a>
                  ) : (
                    <h3 className="font-medium">{project.name}</h3>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills - Compact */}
        <section className="mb-16">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium mb-2">Technical</h3>
              <p className="text-muted-foreground">
                Python, Rust, API integrations, dashboards, computer vision, data pipelines
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Domain</h3>
              <p className="text-muted-foreground">
                Prediction markets, ESG/carbon, marine science, web3, AI systems
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Strategic</h3>
              <p className="text-muted-foreground">
                Systems thinking, investor pitching, narrative development, stakeholder management
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Other</h3>
              <p className="text-muted-foreground">
                Powerlifting, MMA, baking (challah, babkas, bagels)
              </p>
            </div>
          </div>
        </section>

        {/* Portfolio CTA */}
        <section className="mb-16 p-6 border border-border rounded-xl bg-muted/30">
          <h2 className="font-medium mb-2">Portfolio</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Code and design work. Research tools, SDKs, and visual designs.
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
          >
            View portfolio
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Angad Maniyambath</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
