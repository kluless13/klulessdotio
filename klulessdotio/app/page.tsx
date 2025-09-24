"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Twitter, X } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Article {
  id: string
  title: string
  date: string
  content: string
}

// Sample articles - in a real implementation, these would come from your git repo
const sampleArticles: Article[] = [
  {
    id: "1",
    title: "why we predict (brain's native business model)",
    date: "2025-08-18",
    content: `# the predictive brain

Modern neuroscience increasingly frames the brain as a **prediction machine**. At any moment, it generates top-down expectations about incoming sensory data and compares them with bottom-up input. This family of ideas is often called **predictive coding**: higher cortical areas send predictions; sensory areas send back **prediction errors** (mismatch signals) that update internal models (Clark, 2013)(1).

# the free-energy principle

Karl Friston’s **free-energy principle** generalizes this: organisms resist disorder by minimizing a quantity (“variational free energy”) that upper-bounds **surprise/uncertainty** about sensations (Friston, 2010)(2). Here “free energy” is **not calories**; it’s a statistical bound tied to model mismatch.

A trading parallel can be helpful as a **metaphor**: think of free energy like a **spread** between your internal price and incoming data — wider spread ⇒ more uncertainty/mismatch; narrower ⇒ easier, cheaper action. This analogy is illustrative only; Friston does not define free energy as a market spread (2).

# the amygdala: salience and survival

The amygdala is not just a “fear center”; it helps flag **salience** under uncertainty and supports defensive learning (LeDoux, 2000)(3). Picture rustling in the bushes at night: before conscious appraisal (“wind or predator?”), the amygdala can trigger autonomic readiness — heart rate up, attention narrowed — a bias toward **false alarms** that’s adaptive when costs of misses are high (3).

# the prefrontal cortex: training for certainty

If the amygdala is the alarm, the **prefrontal cortex (PFC)** is the strategist. It supports **cognitive control**: maintaining goals, evaluating options, suppressing prepotent impulses, and selecting actions (Miller & Cohen, 2001)(4). In life, PFC “trains” through repeated decisions under uncertainty — e.g., sticking to a plan or rule when emotions tug elsewhere. Each successful override that’s rewarded helps stabilize control policies (4).

# prediction errors as the brain’s PnL

Midbrain dopamine neurons encode **reward prediction errors** — the difference between expected and received outcomes. Better-than-expected outcomes yield phasic bursts; worse-than-expected, dips. These signals are **teaching signals**, retuning expectations and timing, not mere “pleasure” (Schultz, 1997)(5).

# the pricing parallel

Markets “price in” information; brains “price in” experience. In both, **prediction error** is the engine that updates value estimates. Traders arbitrage mispricings toward consensus; neurons adjust synapses to better fit environmental regularities. Neither system **knows** reality with certainty; both aim for a good enough approximation to act.

# training for certainty

The goal isn’t to make the world certain — it’s to make your **policy** reliable under uncertainty. You can’t control an outcome, but you can control **how you respond** (rules, checklists, risk limits, journaling). Neurally, that’s PFC channeling amygdala signals into strategy instead of panic. **Certainty** here means *consistent policy*, not omniscience.

# prediction as the human signature

Why do we predict? Because it’s the operating system of consciousness. Much of culture is an **externalization of predictive machinery**: calendars, models, religions, markets, music, science — scaffolds that stabilize uncertainty.

But prediction doesn’t unify us by *form*. Monks may not care about markets; musicians about 0DTEs; traders will trade; artists will make art. What unifies us is deeper: the drive to **survive, persevere, and thrive**.

Prediction is inevitable. Even when we “surrender” prediction, we lean into **providence** — trusting that outcomes can unfold without control. As metaphors, prediction evokes structure and explicit modeling; providence evokes integration, creativity, and acceptance. Importantly, modern neuroscience cautions against the pop **left-brain/right-brain** split (e.g., “logic lives on the left, creativity on the right”). While some functions are lateralized, people are **not** globally left- or right-brained; both hemispheres cooperate in most tasks (Nielsen et al., 2013)(6). So take “left = prediction / right = providence” as poetic imagery, not biology.

That’s why **prediction markets** matter: they’re a clear, collective mirror of what brains already do — **minimize mismatch, update expectations, and act** — balancing structured prediction with lived acceptance in the service of survival.

---

## references

1. Clark, A. (2013). *Whatever next? Predictive brains, situated agents, and the future of cognitive science.* Behavioral and Brain Sciences.
    
    https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/whatever-next-predictive-brains-situated-agents-and-the-future-of-cognitive-science/33542C736E17E3D1D44E8D03BE5F4CD9
    

(alt open PDF) https://www.fil.ion.ucl.ac.uk/~karl/Whatever%20next.pdf

2. Friston, K. (2010). *The free-energy principle: a unified brain theory?* Nature Reviews Neuroscience.
    
    https://www.nature.com/articles/nrn2787
    

(alt open PDF) https://www.uab.edu/medicine/cinl/images/KFriston_FreeEnergy_BrainTheory.pdf

3. LeDoux, J.E. (2000). *Emotion circuits in the brain.* Annual Review of Neuroscience, 23:155–184.
    
    https://pubmed.ncbi.nlm.nih.gov/10845062/
    
    (alt PDF) https://stanford.edu/~knutson/ans/ledoux00.pdf
    
4. Miller, E.K., & Cohen, J.D. (2001). *An integrative theory of prefrontal cortex function.* Annual Review of Neuroscience, 24:167–202.
    
    https://www.annualreviews.org/content/journals/10.1146/annurev.neuro.24.1.167
    
    (alt PDF) https://web.math.princeton.edu/~sswang/literature_general_unsorted/miller_cohen01_annu_rev_neurosci_prefrontal-theory.pdf
    
5. Schultz, W., Dayan, P., & Montague, P.R. (1997). *A neural substrate of prediction and reward.* Science, 275:1593–1599.
    
    https://www.science.org/doi/10.1126/science.275.5306.1593
    
    (alt PDF) https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.pdf
    
6. Nielsen, J.A., et al. (2013). *An evaluation of the left-brain vs right-brain hypothesis with resting state functional connectivity MRI.* PLOS ONE.
    
    https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0071275`,
  },
  {
    id: "2",
    title: "how PMs win (if they win)",
    date: "2025-08-21",
    content: `### prediction markets: not about the money

Prediction markets look like casinos at first glance. You put money down, you win or lose. But the real story is not about gambling or hedging — we already have futures, options, and swaps for that. Those instruments are deep, liquid, and regulatory-blessed (Hull, 2017)(1).

Prediction markets, by comparison, have historically struggled with liquidity and faced legal scrutiny. As *hedging tools*, they lose.

Where they *can* win is as **information systems**.

---

### markets as truth engines

Prediction markets aggregate dispersed beliefs into a single number: the price. That price is not just odds; it’s a living probability estimate backed by skin in the game.

Robin Hanson, who pioneered much of this field, formalized market scoring rules and argued for markets as **truth-seeking mechanisms** that elicit and aggregate forecasts (Hanson, 2002; 2003)(2)(3). Markets don’t just reflect known data — they *incentivize the discovery of unknown data*.

---

### polymarket: the proof of concept

Polymarket is a prominent live example. Its markets on elections, geopolitics, and culture have often tracked outcomes faster or more tightly than punditry and many polling averages; major press covered how prediction markets called key 2024 dynamics when poll models lagged (WSJ, 2024)(4). Today, Polymarket prices frequently serve as a **reference point** for “the crowd’s odds.”

The magic here isn’t that people make money. It’s that the market becomes an **informational baseline** — a source of truth in real time.

---

### information systems: why they matter

An **information system** is a structured way of collecting, processing, and distributing knowledge to guide decisions (Laudon & Laudon, 2020)(5).

Traditional systems:

- **Polls** → snapshot of opinions, subject to bias.
- **News outlets** → filtered narratives, often slow or politicized.
- **Social media** → raw, noisy, unstructured.
- **Expert forecasts** → precise but bottlenecked by small groups.
- **AI models** → scalable, but risk hallucination and poor calibration.

Prediction markets add something new:

1. **skin in the game** → financial incentives for accuracy.
2. **real-time updating** → probabilities shift continuously with new data.
3. **distributed aggregation** → no need for coordination, just participation.
4. **single actionable number** → a live probability anyone can read.

This makes PMs less like news feeds and more like **live probability terminals** — systems that translate chaos into a price signal.

---

### problems prediction markets could solve

Where does this information actually help us?

- **Politics**: replacing or augmenting polls with real-time, incentive-aligned forecasts of elections, referenda, or policy outcomes.
- **Finance**: predicting central bank moves, inflation trends, mergers, or regulatory rulings faster than analysts.
- **Science**: guiding funding and investment by betting on which research is reproducible or which drug trials will succeed (Dreber et al., 2015)(6).
- **Governance**: governments hedging knowledge risk — pandemics, geopolitical conflicts, climate shocks — through probabilities rather than guesswork.
- **Corporate strategy**: firms using internal PMs to predict sales, launch dates, or supply-chain disruptions more accurately than top-down projections.
- **Everyday decision-making**: a Bloomberg-style PM terminal guiding entrepreneurs, investors, or even citizens in weighing uncertain futures.

---

## the devil’s advocate

### liquidity: the structural weakness

Single Polymarket markets often top out in the **tens to low hundreds of millions**, while platform-wide volume reached **multi-billions** during the 2024 U.S. election cycle (press/industry coverage). By contrast, U.S. options markets clear **~57 million contracts/day** and **hundreds of billions up toward ~$1T notional/day**; 0DTE options alone averaged about **$760B/day** in 2024, per Bank of America (OCC; FT)(7)(8).

Thin PMs mean:

- small bets can distort prices,
- odds are volatile without being informative,
- institutions won’t trust or use the data.

Without liquidity, the “truth machine” risks becoming a “toy calculator.”

---

### regulation: the legal ceiling

Intrade was charged by the CFTC in 2012 and later enjoined (9)(10). PredictIt’s no-action relief was rescinded in 2022, but the **Fifth Circuit granted an injunction** in 2023 that allowed continued operation pending litigation and later rulings (11)(12). Polymarket paid a **$1.4M** civil penalty in 2022 and restricted U.S. access (13).

**Update:** In **Sept 2025**, **Reuters** reported that the **CFTC cleared Polymarket’s U.S. return** via a CFTC-regulated entity (QCX), materially broadening potential adoption (14).

This matters because:

- governments and corporates won’t integrate “illegal” signals,
- mainstream adoption stalls without clarity,
- the sector remains vulnerable if regulators reverse course.

---

### incentives: truth vs influence

Large, motivated flows can shape **perception**, not just reflect truth. Political markets, especially when thin, can be nudged by whales to signal momentum — raising self-fulfilling concerns. This dual-use risk (information vs. influence) is discussed in legal/policy analysis (WilmerHale, 2024)(19) and in media coverage (20).

---

### resolution: when truth is fuzzy

Not every question has a clean outcome. “Will X reduce inflation by 2026?” can be debated endlessly, unlike “Who won the Super Bowl?” Ambiguous contracts introduce disputes, erode confidence, and limit utility.

Markets can only be truth engines if their questions themselves are resolvable as truth.

---

### competition: experts and machines

Prediction markets aren’t the only forecasting tools.

- **Superforecasters** (Tetlock’s Good Judgment Project) often outperform other methods, sometimes beating market alternatives on long-range questions (15)(16).
- **AI systems** can process massive datasets and generate forecasts instantly.

PMs might not replace these; they may only complement them. If so, their “truth machine” status is less absolute and more specialized.

---

### adoption: who actually uses PMs?

Today’s user base is mostly retail speculators and crypto enthusiasts. For PMs to matter institutionally, they need:

- **APIs** plugged into trading terminals,
- **dashboards** for policy think tanks,
- **integrations** with research ecosystems.

Momentum is shifting: appeals-court wins and settlements opened the door for **Kalshi’s election markets** in late 2024, increasing the plausibility of compliant, institutional PM rails (17)(18). Still, mainstream integration is early.

---

### time horizons: short vs long bets

PMs shine with near-term, binary events: elections, sports, short-term policy decisions. But long-term, complex bets (climate policy success in 2040, technological breakthroughs) suffer from:

- capital lock-up,
- low liquidity,
- shifting definitions over time.

This makes PMs less versatile than they first appear.

---

### the social layer: markets as discourse

Prediction markets are not just pricing systems, they’re **social arenas**. People gather, argue, meme, and narrate around them. Sometimes the conversation around the market is as valuable as the price. But this introduces noise — if PMs are just seen as “Twitter with odds,” they risk becoming entertainment rather than decision-making infrastructure.

---

### toward a “Bloomberg for prediction”

The vision isn’t just more markets. It’s **systems built on top**:

- A “prediction terminal” aggregating PM data, expert input, and AI summaries.
- Real-time dashboards of probabilities for politics, finance, science.
- Alerts when odds shift meaningfully, integrated into trading desks, policy planning, or corporate strategy.

Polymarket is the engine. The **terminal** is the win-condition.

---

### how PMs win (if they win)

Prediction markets don’t beat futures in hedging or beat casinos in gambling. They win if they become infrastructure for truth.

But truth alone isn’t enough. They must overcome liquidity, regulation, manipulation, ambiguous resolutions, competition from experts/AI, and adoption hurdles. They must prove their information is not just *different* but **indispensable**.

The optimistic case: PMs evolve into the **Bloomberg of uncertainty** — a layer of real-time probabilities that guide decisions across society.

The skeptical case: they remain niche, fun, and sometimes accurate, but structurally sidelined.

Both outcomes are possible. That’s the bet.

---

## references (plain URLs, numbered to match)

1. Hull, J. (2017). *Options, Futures, and Other Derivatives (10th ed.)*.
    
    https://books.google.com/books/about/Options_Futures_and_Other_Derivatives.html?id=vpIYvgAACAAJ
    
2. Hanson, R. (2002). *Logarithmic Market Scoring Rules for Information Aggregation*.
    
    https://hanson.gmu.edu/mktscore.pdf
    
3. Hanson, R. (2003). *Combinatorial Information Market Design*.
    
    https://mason.gmu.edu/~rhanson/combobet.pdf
    
4. The Wall Street Journal (2024). *How the “Trump Whale” and Prediction Markets Beat the Pollsters in 2024.*
    
    https://www.wsj.com/politics/elections/how-the-trump-whale-and-prediction-markets-beat-the-pollsters-in-2024-dd11ec4e
    
5. Laudon, K.C., & Laudon, J.P. (2020). *Management Information Systems: Managing the Digital Firm (16th ed.)*.
    
    https://www.pearson.com/store/p/management-information-systems-managing-the-digital-firm/P100003064998
    
6. Dreber, A., et al. (2015). *Using prediction markets to estimate the reproducibility of scientific research*. PNAS.
    
    https://www.pnas.org/doi/10.1073/pnas.1516179112
    
7. OCC (Options Clearing Corporation). *Market Data: Volume & Open Interest* (for ADV context).
    
    https://www.theocc.com/market-data/market-data-reports/volume-and-open-interest
    
8. Financial Times (2024). *0DTE options average ~$760bn/day, BofA estimate*.
    
    https://www.ft.com/content/324302e4-0b92-46de-b6b7-41c4766b1cfb
    
9. CFTC Press Release 6423-12 (2012). *CFTC charges Intrade and TEN with violating CFTC orders*.
    
    https://www.cftc.gov/PressRoom/PressReleases/6423-12
    
10. CFTC Press Release 7758-18 (2018). *Order against The Prediction Company et al.* (enforcement history context).
    
    https://www.cftc.gov/PressRoom/PressReleases/7758-18
    
11. U.S. Court of Appeals, Fifth Circuit (2023). *Order enjoining CFTC action re: PredictIt* (22-51124).
    
    https://www.ca5.uscourts.gov/opinions/pub/22/22-51124-CV0.pdf
    
12. CCH (2024). *PredictIt litigation analysis (compiled filings/excerpts).*
    
    https://business.cch.com/srd/20240510-printDocuments.pdf
    
13. CFTC Press Release 8478-22 (2022). *CFTC orders Polymarket to pay $1.4M; off-limits to U.S. users*.
    
    https://www.cftc.gov/PressRoom/PressReleases/8478-22
    
14. Reuters (2025). *CFTC clears Polymarket’s regulated U.S. return via QCX LLC* (Sept 2025).
    
    https://www.reuters.com/sustainability/boards-policy-regulation/polymarket-returns-us-after-cftc-clears-regulatory-hurdles-2025-09-03/
    
15. Good Judgment (Tetlock). *What is Superforecasting?*
    
    https://www.goodjudgment.com/superforecasting/
    
16. Scientific American (2019). *The Secrets of the Superforecasters.*
    
    https://www.scientificamerican.com/article/the-secrets-of-the-superforecasters/
    
17. Reuters (2024). *Federal court upholds ruling letting Kalshi list U.S. election contracts* (Oct 2, 2024).
    
    https://www.reuters.com/legal/us-federal-court-upholds-ruling-letting-kalshiex-list-election-betting-contracts-2024-10-02/
    
18. Bloomberg (2024). *Judge green-lights election betting on congressional outcomes* (Sept 12, 2024).
    
    https://www.bloomberg.com/news/articles/2024-09-12/betting-on-us-congress-elections-outcome-green-lit-by-judge
    
19. WilmerHale (2024). *Market integrity & manipulation risks in election prediction markets (client alert).*
    
    https://www.wilmerhale.com/-/media/files/shared_content/editorial/publications/wh_publications/client_alert_pdfs/20241028-market-integrity-and-manipulation-in-election-prediction-markets.pdf
    
20. CoinDesk (2024). *Election prediction markets prone to manipulation?*
    
    https://www.coindesk.com/policy/2024/07/01/election-prediction-markets-prone-to-manipulation/`,
  },
  {
    id: "3",
    title: "can PMs save science?",
    date: "2025-08-25",
    content: `## the reproducibility crisis

Modern science has a trust problem. Studies suggest that **many published findings do not replicate**. A foundational critique argued that structural incentives and low prior odds make most “positive” findings likely false (Ioannidis, 2005)(1). In psychology, the Open Science Collaboration (2015) tried to replicate 100 experiments and found only **36%** produced statistically significant results in the same direction (2). In cancer biology, Amgen scientists reported they could reproduce **6 of 53** “landmark” preclinical studies (Begley & Ellis, 2012)(3).

The economic cost is large: one estimate put **irreproducible U.S. preclinical biomedical research** at **~$28B per year** (Freedman, Cockburn & Simcoe, 2015)(4).

1. https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124
2. https://www.science.org/doi/10.1126/science.aac4716
3. https://www.nature.com/articles/483531a
4. https://pubmed.ncbi.nlm.nih.gov/26057340/

---

## the case for betting on truth

What if, instead of publishing into the void, we let **markets price the likelihood a claim will replicate**?

**Example 1: Psychology replication markets.** For 44 psychology studies, **prediction markets** forecasted replication outcomes **and outperformed individual survey forecasts** (Dreber et al., 2015)(5).

**Example 2: Economics replications.** In experimental economics, a replication project ran **both surveys and prediction markets**. **Both** tracked outcomes; **neither clearly beat the other**, and both **overestimated** true replication rates—useful signal, but imperfect (Camerer et al., 2016)(6).

**Meta-evidence across projects.** A pooled analysis of four large forecasting projects found **prediction markets ~73% accurate vs. surveys ~66%** at classifying replication outcomes (Gordon et al., 2021)(7).

1. https://projects.iq.harvard.edu/files/yiling/files/pnas.1516179112.pdf
2. https://www.science.org/cms/asset/febfa588-66f1-493b-afb8-268e0aaeb6a9/pap.pdf
3. https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0248780

---

## the biopharma angle

Drug R&D is expensive and risky. A widely cited analysis estimated **$2.6B** (capitalized, incl. failures) per new drug (DiMasi et al., 2016)(8), though newer work shows **wide ranges** and often **lower** averages depending on methods and data (Sertkaya et al., 2024)(9). Success rates remain low: **~10%** of candidates entering Phase I reach approval (BIO industry analyses)(10).

**Late-stage failures can be crushing.** Phase III trial costs vary from **tens of millions** to **hundreds of millions**, depending on disease area and design (RAPS summary of a multi-sponsor sample; median ~$19M per Phase III in one large dataset; Tufts/other estimates are higher)(11)(9).

Alzheimer’s illustrates the stakes: failure rates have historically exceeded **95–99%** and **cumulative private AD R&D outlays** since 1995 are estimated at **~$42.5B** (Cummings et al., 2021)(12), with many high-profile late-stage failures (8).

**Where PMs can help:**

- *“Will Drug X meet its Phase III primary endpoint by 2028?”*
    
    A low market probability can **de-risk portfolios** earlier, steer capital, or hedge exposure.
    
- *Program triage:* funders and VCs use market odds to **prioritize** pipelines.
- *Policy & payers:* probabilities inform **budget impact** planning and **coverage** risk.
1. https://www.sciencedirect.com/science/article/abs/pii/S0167629616000291
2. https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2820562
3. https://go.bio.org/rs/490-EHZ-999/images/Clinical%20Development%20Success%20Rates%202006-2015%20-%20BIO%2C%20Biomedtracker%2C%20Amplion%202016.pdf
4. https://www.raps.org/news-and-articles/news-articles/2018/9/phase-3-trial-costs-estimated-at-19m-study-finds
5. https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.12450

---

## information systems for science

Think of prediction markets as **meta-peer-review**:

- Peer review = a handful of experts’ judgments.
- Prediction markets = **distributed** judgments (experts + outsiders) **priced into a probability**.
- Used together, you get **richer, more honest** signals: incentives to reveal information that **wouldn’t surface** in narratives or status contests.

(5)(6)(7)

---

## DARPA’s replication markets (SCORE)

DARPA funded **Replication Markets** (2019–2021) to forecast the replicability of **thousands** of social-science claims—**~3,000 assessed by mid-2020**—using surveys and incentivized markets. The program delivered **probability “confidence scores”** at scale and resolved **121 markets** with prize payouts, demonstrating feasibility for large pipelines and crisis contexts (e.g., COVID-related claims) (13)(14)(15).

1. https://royalsocietypublishing.org/doi/10.1098/rsos.200566
2. https://replicationmarkets.org/
3. https://projects.iq.harvard.edu/sites/projects.iq.harvard.edu/files/yiling/files/2005.04543.pdf

*Related:* A 2024–2025 decision-market study showed markets can **select** which studies to replicate (top-priced claims replicated ~83% vs. ~33% for bottom-priced), offering a practical triage tool—while surveys remained a cheaper, slightly less accurate baseline (Nature Human Behaviour, 2024/2025)(16).

1. https://www.nature.com/articles/s41562-024-02062-9

---

## the vision: science as a prediction terminal

**Step 1 — publication-time odds.** Every new paper ships with a **live replication market**. Within days, you have a base probability. (5)(7)

**Step 2 — capital alignment.** Funders and VCs **consult odds** before allocating grants or investments; they update as new data arrives. (5)(7)

**Step 3 — pipeline pricing.** Biopharma trials carry markets from Phase I→III; sponsors, investors, payers, and policy planners use **continuous probabilities** to manage risk. (8)(9)(10)(11)(12)

**Step 4 — policy integration.** Health agencies and ministries adopt **replicability dashboards** for strategic planning and crisis response. (13)(16)

**Step 5 — the terminal.** A **Bloomberg-like interface** shows real-time probabilities across fields, paired with expert commentary and AI synthesis, to guide **billions** in public and private decisions. (13)(16)

---

## the devil’s advocate

- **Liquidity.** Niche scientific questions may not attract enough traders for tight, informative prices. (6)(7)
- **Resolution lag.** Many scientific questions resolve **years** later; capital can lock up; incentives must be designed for long horizons. (13)(16)
- **Ethics/compliance.** Markets around trials risk **leaks** or insider trading if not carefully governed. (8)(9)
- **Alternatives.** **Superforecasters**, structured surveys, and **ML models** can be competitive baselines; markets likely **complement** rather than replace them. (7)(16)

---

## pricing truth

Prediction markets won’t fix science alone—but they **price the thing science ultimately seeks**: truth.

Where journals reward prestige, **markets reward accuracy**; where narratives dominate, **prices discipline**; where hype misallocates resources, **probabilities redirect** them.

By **pricing truth**, we channel funding toward **robust** findings and away from fragile ones—saving money **and** accelerating discovery. When truth is priced, **breakthroughs compound faster**. (5)(7)(13)(16)`},
{
    id: "4",
    title: "networks needed for PMs",
    date: "2025-08-25",
    content: `### why networks matter

A prediction market isn’t just a pricing mechanism; it’s a **networked system**. Value scales with users (traders + forecasters), complements (data feeds, terminals, APIs), and adopters (funds, firms, policymakers). In econ terms, PMs are classic **network-effect** / **two-sided platform** businesses: more users → better prices → more complements → more users (Katz & Shapiro, 1985)(1); (Rochet & Tirole, 2003)(2). ([JSTOR](https://www.jstor.org/stable/1814809?utm_source=chatgpt.com))

---

### direct vs indirect network effects

- **Direct effects:** more participants → tighter spreads, faster incorporation of info, more robust prices (Wolfers & Zitzewitz, 2004)(3).
- **Indirect effects:** integrations (APIs, dashboards, terminals) attract institutions; institutional use attracts more liquidity; the **flywheel** turns (Rochet & Tirole, 2003)(2). ([American Economic Association](https://www.aeaweb.org/articles?id=10.1257%2F0895330041371321&utm_source=chatgpt.com))

---

### who belongs in the network?

1. **Retail participants** (breadth, speed), 2) **domain experts** (informed priors), 3) **institutions** (scale, persistence), 4) **platforms & meta-platforms** (exchanges + aggregators), 5) **infrastructure** (identity/AML, market makers, oracles, APIs, analytics). Think **participants × pipes × products**—all three layers must grow. (Wolfers & Zitzewitz, 2004)(3). ([American Economic Association](https://www.aeaweb.org/articles?id=10.1257%2F0895330041371321&utm_source=chatgpt.com))

---

### money network vs information network

PMs “win” in two ways—and need both networks:

- **Money network:** regulated access, deep liquidity, robust market-making.
- **Information network:** open APIs, interoperable data, resolution trust, distribution into decision flows (BI tools, terminals, policy models).
    
    If you optimize only for trading P&L, you get a casino; only for information, you get a dashboard nobody trades on. The durable moat is **both**.
    

---

## real-world nodes: how today’s networks are forming

### regulated exchange rails (kalshi)

- **Legal footing:** U.S. DCM (Designated Contract Market) with a public **Rulebook** and product-level **contract rules**—institution-friendly primitives (Kalshi Rulebook)(13).
- **Courts & scope:** In Oct 2024, a U.S. appeals court upheld a ruling letting Kalshi list election contracts—key signal on regulatory scope (Reuters, 2024-10-02)(4).
- **APIs:** REST API + docs enable programmatic ingestion into terminals/strategies (Kalshi docs)(14). ([kalshi.com](https://kalshi.com/regulatory/rulebook?utm_source=chatgpt.com))

### public crypto-native PM rails (polymarket)

- **U.S. re-entry:** In Sept 2025, **CFTC clearance** paved Polymarket’s return to the U.S. via a regulated entity—broadens institutional access (Reuters, 2025-09-03)(6); see CFTC no-action letter context (CFTC, 2025-09-03)(5).
- **Scale example:** In 2024, Polymarket reported **~$9B annual volume** and **>300k active traders**—evidence of network thickness (The Block, 2025-01-03)(7).
- **Event pop:** During the Sept 2025 Fed cut, Americans wagered **>$300M** across platforms; Polymarket alone cleared ~**$208M** on the decision—showing mass-attention spikes pull liquidity (Investopedia, 2025-09)(8). ([Reuters](https://www.reuters.com/sustainability/boards-policy-regulation/polymarket-returns-us-after-cftc-clears-regulatory-hurdles-2025-09-03/?utm_source=chatgpt.com))

### oracles, tokens & resolution trust

- **How resolution works:** Polymarket resolves via clear market rules and—if contested—routes disputes to **UMA’s DVM** (decentralized oracle) as backstop (Polymarket docs)(9)(10).
- **Token standard:** Positions are ERC-1155 **Conditional Tokens** (Gnosis **CTF**) → interoperable with wallets/analytics; audited by ChainSecurity (CTF audit, 2024)(12)(11).
- **Trade-off:** Crypto PMs gain openness but must **engineer** resolution clarity to earn institutional trust; regulated DCMs like Kalshi lean on rulebooks and centralized adjudication. (Kalshi rulebook, Market Rules)(13). ([docs.polymarket.com](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-resolved?utm_source=chatgpt.com))

### forecasting communities as complements (non-PM but adjacent)

- **Good Judgment Open (GJO)** and **Metaculus** supply expert crowds + reasoning threads; their **APIs/guides** and calibration histories are natural complements to PM price feeds—useful for **hybrid terminals** (GJO FAQ; Metaculus resources)(16)(17). ([gjopen.com](https://www.gjopen.com/faq?utm_source=chatgpt.com))

### market-making & liquidity tech

- **Automated market makers** like **LMSR** (logarithmic market scoring rule) give bounded-loss liquidity—the default for thin, internal, or long-tail markets (Hanson, 2002/2007)(18).
- Liquidity-sensitive variants adapt depth to flow (Othman & Sandholm, 2010)(19). These mechanisms are the **plumbing** for early-stage networks before natural depth arrives. ([hanson.gmu.edu](https://hanson.gmu.edu/mktscore.pdf?utm_source=chatgpt.com))

---

## interoperability: the “prediction terminal” stack

**Data pipes**

- **Exchange APIs:** Kalshi API (14), Polymarket’s on-chain data + docs (9)(16), Manifold API (15) → unified feeds for **prices**, **order books**, **resolutions**.
- **Standards:** Conditional Tokens (CTF) enable portable, composable position IDs across tools (12).
- **Governance & provenance:** DCM rulebooks (13) and on-chain resolution logs (10) let terminals show **why** a market resolved, not just **that** it did.

**Analytics layer**

- Combine PM odds with **expert forecasts** (GJO, Metaculus), text feeds, and fundamentals.
- Compute **implied probabilities**, **moves**, **Brier deltas**, trigger **alerts** into Slack/terminals.

**Decision layer**

- **Finance:** hook into PM dashboards alongside options chains; in macro events (e.g., Fed), PMs already act as a “retail macro tape” (Investopedia, 2025-09)(8).
- **Science & policy:** DARPA’s SCORE + **Replication Markets** showed scalable pipelines for pricing credibility; a Nature Human Behaviour study used **decision markets** to prioritize replications (DARPA; RM site; Nature HB, 2024/25)(20)(21)(22). ([Investopedia](https://www.investopedia.com/forget-sports-betting-americans-found-a-new-300-million-dollar-game-the-fed-meeting-11812164?utm_source=chatgpt.com))

---

## devil’s advocate: why networks still stall

- **Fragmentation:** one PM rarely dominates → prices siloed; without **aggregators**, each network effect is local (Katz & Shapiro, 1985)(1).
- **Trust gap:** crypto PMs must prove resolution integrity (oracles, audits); regulated PMs must navigate shifting legal lines (CFTC, Reuters)(5)(6).
- **Adverse selection:** insiders/noise traders skew signals unless mechanisms (LMSR, position limits, KYC) dampen edge cases (Hanson, 2002; Kalshi rulebook)(18)(13). ([JSTOR](https://www.jstor.org/stable/1814809?utm_source=chatgpt.com))

---

## blueprint: building the network-of-networks

**phase 1 — prices everywhere (pipes)**

- Ship **unified APIs**: Kalshi + Polymarket + Manifold feeds into one schema (market id, rules, resolution source, price, depth).
- Require **explicit resolution criteria** surfaced at the UI/API edge. (Polymarket/Manifold docs)(9)(1). ([docs.polymarket.com](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-resolved?utm_source=chatgpt.com))

**phase 2 — credibility & provenance (trust)**

- Attach **verifiable provenance**: DCM rule references (Kalshi Rulebook), on-chain oracle proofs (UMA DVM txs), audit links (ChainSecurity). (10)(11)(13). ([docs.polymarket.com](https://docs.polymarket.com/developers/resolution/UMA?utm_source=chatgpt.com))

**phase 3 — terminals & alerts (distribution)**

- Build a **“Bloomberg for probabilities”**: cross-PM dashboards, commentary threads, expert overlays (GJO/Metaculus), and **event move alerts**. (16)(17). ([gjopen.com](https://www.gjopen.com/faq?utm_source=chatgpt.com))

**phase 4 — institutional integration (adoption)**

- Finance desks: embed odds for macro/policy; connect to compliance (KYC/AML on regulated rails).
- Corporates: internally run IPMs for delivery/sales risks; display **external PM odds** adjacent to OKRs.
- Science & policy: replication & clinical-success odds incorporated into **grant/portfolio screens** (DARPA SCORE, Nature HB). (20)(22). ([darpa.mil](https://www.darpa.mil/research/programs/systematizing-confidence-in-open-research-and-evidence?utm_source=chatgpt.com))

**phase 5 — feedback & governance (resilience)**

- Publish **calibration**, **Brier scores**, and post-mortems; tune market maker params (LMSR b), position limits, and resolution panels. (18)(19)(13). ([hanson.gmu.edu](https://hanson.gmu.edu/mktscore.pdf?utm_source=chatgpt.com))

---

## bottom line

PMs don’t become infrastructure by being a single site with a ticker. They become infrastructure when **networks**—participants, platforms, oracles, APIs, auditors, analysts, and adopters—**mesh**. That’s when a price stops being trivia and starts steering **capital, policy, and science**.

---

## references

1. Katz, M., & Shapiro, C. (1985). *Network externalities, competition, and compatibility.*
    
    https://www.jstor.org/stable/1814809
    
2. Rochet, J-C., & Tirole, J. (2003). *Platform competition in two-sided markets.*
    
    https://www.edegan.com/pdfs/Rochet%20Tirole%20%282003%29%20-%20Platform%20Competition%20in%20Two%20Sided%20Markets.pdf
    
3. Wolfers, J., & Zitzewitz, E. (2004). *Prediction Markets.* JEP 18(2).
    
    https://www.aeaweb.org/articles?id=10.1257%2F0895330041371321
    
4. **Reuters** (2024-10-02). *US appeals court clears Kalshi to restart elections betting.*
    
    https://www.reuters.com/legal/us-federal-court-upholds-ruling-letting-kalshiex-list-election-betting-contracts-2024-10-02/
    
5. **CFTC** (2025-09-03). *Staff No-Action Letter regarding event contracts (QCX LLC / QC Clearing).*
    
    https://www.cftc.gov/PressRoom/PressReleases/9113-25
    
6. **Reuters** (2025-09-03). *Polymarket returns to US after CFTC clears regulatory hurdles.*
    
    https://www.reuters.com/sustainability/boards-policy-regulation/polymarket-returns-us-after-cftc-clears-regulatory-hurdles-2025-09-03/
    
7. **The Block** (2025-01-03). *Polymarket’s huge year: $9B in volume and 314k active traders.*
    
    https://www.theblock.co/post/333050/polymarkets-huge-year-9-billion-in-volume-and-314000-active-traders-redefine-prediction-markets
    
8. **Investopedia** (2025-09). *Americans wager >$300M on Fed decision across PMs; Polymarket >$208M.*
    
    https://www.investopedia.com/forget-sports-betting-americans-found-a-new-300-million-dollar-game-the-fed-meeting-11812164
    
9. Polymarket Docs — *How markets resolve.*
    
    https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-resolved
    
10. Polymarket Dev Docs — *Resolution via UMA’s DVM (oracle backstop).*
    
    https://docs.polymarket.com/developers/resolution/UMA
    
11. ChainSecurity (2024-04-11). *Audit: Gnosis Conditional Tokens (used by Polymarket).*
    
    https://old.chainsecurity.com/wp-content/uploads/2024/04/ChainSecurity_Polymarket_Conditional_Tokens_audit.pdf
    
12. Gnosis — *Conditional Tokens Framework (CTF) docs (ERC-1155 positions).*
    
    https://conditional-tokens.readthedocs.io/_/downloads/en/latest/pdf/
    
13. Kalshi — *Exchange Rulebook & Contract Rules.*
    
    https://kalshi.com/regulatory/rulebook
    
14. Kalshi — *API docs.*
    
    https://docs.kalshi.com/
    
15. Manifold — *API docs.*
    
    https://docs.manifold.markets/api
    
16. Good Judgment Open — *FAQ / platform overview.*
    
    https://www.gjopen.com/faq
    
17. Metaculus — *Prediction resources / tooling.*
    
    https://www.metaculus.com/help/prediction-resources/
    
18. Hanson, R. (2002/2007). *Logarithmic Market Scoring Rules (LMSR).*
    
    https://hanson.gmu.edu/mktscore.pdf
    
19. Othman, A., & Sandholm, T. (2010). *A practical liquidity-sensitive automated market maker.*
    
    https://www.cs.cmu.edu/~sandholm/liquidity-sensitive%20automated%20market%20maker.teac.pdf
    
20. DARPA — *SCORE program (confidence in research claims).*
    
    https://www.darpa.mil/research/programs/systematizing-confidence-in-open-research-and-evidence
    
21. Replication Markets (SCORE) — *Resolutions & payouts.*
    
    https://replicationmarkets.org/
    
22. Nature Human Behaviour (2024/25). *Decision markets to select replication targets.*
    
    https://www.nature.com/articles/s41562-024-02062-9`,
},
]

const timelineItems = [
  {
    year: "2024-now",
    title: "Founder of Kairos",
    company: "Kairos",
    description: "Gave up PhD to build out the future of Marine Science x AI. Started Kairos, where we build the future of prediction markets. Best bet ever.",
  },
    {
    year: "2023",
    title: "Master's Degree in Marine Science",
    company: "JCU, Townsville, QLD",
    description: "Got into the best university for marine biology to make a difference.",
  },
  {
    year: "2023",
    title: "Master's Degree in Marine Science",
    company: "JCU, Townsville, QLD",
    description: "Got into the best university for marine biology to make a difference.",
  },
  {
    year: "2021-22",
    title: "Home Baker & Crypto enthusiast",
    company: "baked",
    description: "Managed over 8 orders/day with a busted oven for ~4.5 months. Baked challah, babkas, bagels, brownies, cookies and more; explored the crypto space (NFTs, lol).",
  },
  {
    year: "2020",
    title: "Bachelor's Degree in Marine Science & Technology",
    company: "AMITY University, Noida",
    description: "I thought I could make a difference in the marine science world.",
  },
  {
    year: "1999",
    title: "Newborn",
    company: "The Family",
    description: "I realised I existsed, and all of a sudden, I was here, the universe obeserving itself.",
  },
]

export default function Home() {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  const toggleArticle = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId)
  }

  const closeArticle = () => {
    setExpandedArticle(null)
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 terminal-text">
              {">"} kluless<span className="cursor"></span>
            </h1>
            <p className="text-muted-foreground">./kairos/founder</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Removed theme toggle button */}
            <a href="https://github.com/kluless13" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Github className="h-5 w-5" />
              </Button>
            </a>

            <a href="https://twitter.com/kluless_" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Twitter className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </header>

        {/* About Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-primary">{">"} about</h2>
          <Card className="p-6 bg-card">
            <p className="leading-relaxed">
            I like baking, data, lifting heavy, and predicting the future. I’m the founder of Kairos, always exploring and building.
            <br />
            I began as a marine scientist, earning my Master’s at James Cook University, the world’s top-ranked program for marine science. My passion for biology, robotics, and AI led me to Flyingfish Technologies, where I built FishTally—an AI tool that automated fish counts and coral detection from underwater video, saving >100 hours of manual work each week and delivering real-time ecological insights.
            <br />
            Beyond marine robotics, I scraped data across all ASX-listed companies to identify those needing carbon and renewable credits—work that astonished energy executives and saved months of research.
            <br />
            At Kairos, we’re advancing prediction market infrastructure, building tools that let us not only forecast the future but shape it.
              </p>
          </Card>
        </section>

        {/* Timeline Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-primary">{">"} timeline</h2>
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <Card key={index} className="p-4 bg-card">
                <div className="flex items-start gap-4">
                  <div className="text-primary font-bold min-w-[60px]">{item.year}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-primary text-sm">{item.company}</p>
                    <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Thoughts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-primary">{">"} thoughts</h2>
          <div className="space-y-3">
            {sampleArticles.map((article) => (
              <div key={article.id}>
                <Card className="bg-card overflow-hidden">
                  <button
                    onClick={() => toggleArticle(article.id)}
                    className="w-full p-4 text-left hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-muted-foreground text-sm">{article.date}</p>
                      </div>
                      <span className="text-primary">{expandedArticle === article.id ? "[-]" : "[+]"}</span>
                    </div>
                  </button>

                  {expandedArticle === article.id && (
                    <div className="p-6 bg-muted/20">
                      <div className="prose prose-sm max-w-none prose-invert">
                        <ReactMarkdown
                          className="text-foreground"
                          components={{
                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-primary">{children}</h1>,
                            h2: ({ children }) => (
                              <h2 className="text-xl font-semibold mb-3 text-primary">{children}</h2>
                            ),
                            h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-primary">{children}</h3>,
                            p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
                            ),
                            li: ({ children }) => <li className="text-foreground">{children}</li>,
                            code: ({ children }) => (
                              <code className="bg-accent px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-accent p-3 rounded overflow-x-auto mb-3">{children}</pre>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-primary">{children}</strong>
                            ),
                          }}
                        >
                          {article.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm">
          <p>{">"} end of file</p>
        </footer>
      </div>

      {/* Floating Close Button */}
      {expandedArticle && (
        <Button
          onClick={closeArticle}
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          size="icon"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
