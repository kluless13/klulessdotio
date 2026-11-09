import type { Series } from "@/lib/writing/types"

export const SERIES: readonly Series[] = [
  {
    id: "prediction-markets",
    title: "Prediction market research",
    description:
      "Seven posts from 686,272 Kalshi trades and about 248,000 Polymarket traders, all from December 2025 data.",
    slugs: [
      "are-prediction-markets-accurate",
      "why-prediction-markets-resolve-no",
      "how-prediction-market-prices-move",
      "which-prediction-markets-work-best",
      "specialists-vs-generalists-in-prediction-markets",
      "do-winning-traders-keep-winning",
      "are-top-prediction-market-traders-lucky",
    ],
    featured: true,
  },
  {
    id: "claude-code-field-guide",
    title: "Claude Code field guide",
    description: "How I set up and use Claude Code every day, one part at a time.",
    slugs: [],
    featured: false,
  },
]
