# 1tx.dev writing section, SEO foundations and email-gated downloads

Written 2026-11-09. It builds on the approved Paper designs (Directions page, rows from y 30200: Writing / index day, night and phone; Writing / post day, night and phone; Writing / paper; Writing / share image; About day and phone) and on the funnel plan in `docs/writing/funnel-plan.md`.

## Intent

1tx.dev is a single page today. Angad wants people to find them through search engines and AI answers, read what they've written, and leave an email in exchange for something useful. That email list is the start of a business: free guides and kits, then consulting.

This build gives the site:
- a home for writing;
- everything search engines and AI crawlers need to find and cite it;
- a way to trade a download for an email.

The first content is the existing drafts and, soon after, a Claude Code field guide. The first download is a Claude Code starter kit.

## Goals

- /writing, post pages and /about, matching the Paper designs, in day and night, on desktop and phone.
- Every page is indexable and citable:
  - a sitemap, robots, canonical URLs and per-page metadata;
  - structured data, a share image per post and RSS;
  - llms.txt and llms-full.txt, and a Markdown copy of every post.
- An email gate for downloads. Someone gives their email, gets a link by email, and is added to Angad's list with consent.
- Publishing a post means adding one Markdown file to the repo. No code changes.
- Built so later series (the Claude Code field guide) and later downloads (the starter kit, paper PDFs) slot in as content.

## Non-goals

- The Library page. It's still in Paper. The nav leaves room for it but doesn't show it yet.
- The full paper pages and paper PDFs. See "Papers, later" below.
- The referral programme, the readiness scorecard and the "Work with me" page. They come later in the funnel plan.
- A CMS, comments or search.
- Writing the field guide posts or building the starter kit itself. Those are separate tracks. This build supplies the slots they plug into.

## Anti-goals: this fails even if it technically works if

- Reading a post is unpleasant: low contrast over the sky, a glaring chart at night, or layout shift as it loads.
- It looks like a template blog rather than the rest of 1tx.dev.
- An email address leaks: shown on the site, logged, or stored anywhere public.
- A draft that Angad hasn't approved gets published, or any file from `docs/writing/` gets committed.
- AI crawlers or Google are blocked, by robots or by Vercel's bot protection.
- The home page gets slower or changes beyond the nav addition below.

## Constraints

- **Stack:** Next.js 14.2.16 (App Router), React 18, Tailwind 4 and the existing CSS in `app/globals.css`, Vercel hosting, and Upstash Redis (already a dependency, with KV env vars injected by Vercel). Node 22.
- **Style rules (Angad's, strict):**
  - No eyebrows, no all caps, no monospace, sentence case everywhere.
  - No unnecessary lines or dividers.
  - No em dashes in site copy.
  - Buttons are the site's existing `.btn`.
- **Tokens:** day and night follow the existing tone script (Asia/Kolkata time, `.day` on `<html>`). Ink is #101A2E by day and white at night; soft text is 60% of ink. The reading-sheet values are in "Post page" below.
- **Fonts:** Instrument Sans for UI and headings, Newsreader for long-form body text. The layout already loads both. Newsreader is currently `preload: false` with weights 500 and 600; posts need 400 (and 400 italic for captions or quotes) as well.
- **Drafts:** `docs/writing/` is excluded from git via `.git/info/exclude` and must never be committed. A post is published by copying it into `content/posts/` once Angad has approved it.
- **The GitHub repo (kluless13/klulessdotio) is public.** Anything committed can be read by anyone. So:
  - gated files never go in the repo;
  - unapproved drafts never go in the repo, so there is no `draft` flag;
  - the repo holds only what is published.
- **Design reference:** Paper screenshots of every board, the portrait, and the Paper builder script (`writing_boards.py.txt`, which holds the exact sizes, colours and copy) are in `docs/writing/design/`. That folder is git-ignored, and so is any Paper copy containing draft text. The builder works from these, plus the Paper file through its MCP server when available.
- `next.config.mjs` currently redirects /writing to /. Remove that redirect. Keep the /portfolio one.
- **Repo rules:** tests first, at least 80% coverage, immutable data, small files, and zod for input validation.

## Structure and routes

| Route | What it is |
|---|---|
| `/` | Unchanged, except a Writing button in the header next to Quiet |
| `/writing` | Index (Paper: Writing / index) |
| `/writing/[slug]` | Post (Paper: Writing / post) |
| `/writing/[slug].md` | The post's Markdown, as plain text (`text/markdown; charset=utf-8`) |
| `/about` | About (Paper: About) |
| `/writing/rss.xml` | RSS 2.0 feed of posts |
| `/sitemap.xml` | Generated from routes and content |
| `/robots.txt` | Generated |
| `/llms.txt`, `/llms-full.txt` | Generated from content |
| `/writing/[slug]/opengraph-image` | Per-post share image (Paper: Writing / share image) |
| `/api/subscribe` | POST: email gate |
| `/api/download/[token]` | GET: delivers a gated file |

All writing pages are statically generated at build time. Only the API routes are dynamic.

### Navigation

- **Top bar on writing pages and /about:**
  - Left: "Angad Maniyambath", linking to /.
  - Right: Writing (pressed on /writing and posts) and Quiet.
  - Quiet goes to / in quiet mode. Write `1tx-mode=quiet` to localStorage through `writeMode`, then navigate. This is the same mode the home button sets.
  - Library joins between them when it ships.
- **Home header:** add a Writing button (a link) before Quiet.
- **Footer on writing pages and /about:** About, Writing, RSS and the copyright line, quiet and small. The home page footer adds an About link.

### Background

Writing pages and /about reuse the home page's sky (`SkyProvider` + `SkyCanvas`) behind the content, as in Paper. Posts sit on the reading sheet, so the sky never affects text contrast. If the sky fails, the page falls back to the existing sky wash colour.

## Content model

Posts live in `content/posts/<slug>.md`, with images in `public/writing/<slug>/`. Front matter is validated with zod at build time, and an invalid post fails the build with a message naming the file and field.

```yaml
title: "The price is right. Who's doing the thinking?"   # required
description: "One sentence for search results and share cards."   # required, at most 160 characters
short: "The short version box: two or three sentences."  # required
date: 2026-11-12          # required, publish date
updated: 2026-11-20       # optional
category: Prediction markets   # required: Prediction markets | AI and building | Thinking
series: { id: prediction-markets, part: 1 }   # optional
download: claude-code-starter-kit   # optional, an id from content/downloads.ts
related: [the-99-point-gap, the-top-one-percent]   # optional, slugs
cover: chart-calibration.png   # optional, an image in the post's folder, used on the share image
```

- **Loading:** the loader takes the content directory as a parameter, defaulting to `content/posts`. Tests use fixture posts under `tests/fixtures/posts/`, never real content.
- **Images:** relative `images/x.png` paths in a post resolve to `/writing/<slug>/x.png`.

- **Slug:** the file name. Each slug is chosen for search, worded the way people search, for example `are-prediction-markets-accurate`, and it never changes once published. Angad approves the slugs together with the posts.
- **Series:** defined in `content/series.ts` as id, title, one-line description, an ordered list of slugs, and `featured: boolean`. The index's featured card shows the series with `featured: true`. Two series are expected: `prediction-markets` (seven parts) and `claude-code-field-guide`.
- **Downloads:** defined in `content/downloads.ts` as id, title, one-line description, file name and file size. They hold no location. A post with `download` shows the email gate at its end.
- **Where download files live:** in Vercel Blob, uploaded by Angad or by a script, under a random path.
  - Each file's URL is kept in a server-only environment variable named `DOWNLOAD_URL_<ID>` (the id upper-cased, with dashes turned into underscores).
  - The download route reads the file server-side and streams it, so the URL never reaches the browser or the repo.
  - A download with no URL set is treated as unavailable: the gate doesn't render, and the route returns 404.
- **Reading time:** body word count divided by 230, rounded, minimum 1.
- **Markdown supported:**
  - headings h2 and h3, paragraphs, bold and italic, links, lists and block quotes;
  - tables (GFM), styled like the Paper paper table: rows on a tint, tabular numbers, no rules;
  - images.
- **Image captions:** an image on its own line, followed by an italic paragraph on the next line, renders as `<figure>` with that italic text as `<figcaption>`. With no italic line, the alt text becomes the caption.
- **Rendering:** use remark and rehype. The builder picks the plugins. External links open in the same tab and get `rel="noopener"`.
- **Empty states:** the code must work with zero posts, even though the PR ships with approved posts. With zero posts:
  - /writing shows its header and "First posts soon.";
  - the featured card hides when its series has no published part;
  - RSS, the sitemap and llms.txt simply list nothing.
- **Draft cleanup:** the drafts' internal front matter (`status`, `source`, `original`, `data`) and their first `# Title` heading are dropped when copying into `content/posts/`, because the title comes from front matter.

### Dark chart variants

Charts are white PNGs and glare on the night sheet. If `chart-x-dark.png` exists next to `chart-x.png`, the figure renders both and CSS shows the right one for the tone, without JavaScript. Charts with no dark file show the light one on a rounded white card in both tones.

The dark PNGs are a separate task, made by the chart scripts in the session scratchpad. The build doesn't wait for them.

## Pages

Paper is the reference for layout, spacing and type sizes. These are the decisions Paper doesn't show.

### /writing

- **Header:** title "Writing" and the subtitle "Things I looked into, and what I found." On the right, the segmented filter: All, then each category that has at least one post.
  - The filter is client-side and shows or hides groups.
  - It updates `?category=` in the URL, without adding history entries, so filtered views can be shared.
  - With JavaScript off, all groups show.
- **Featured card:** the featured series' title, description, "Start with part 1" (a link to part 1), and "N posts, about M minutes". On desktop, the series' first chart sits in a thumbnail on the right.
- **Groups:** one per category, in this order: AI and building, Prediction markets, Thinking. AI and building comes first because it leads the funnel; Paper showed prediction markets first.
  - Each group has its name and count as a quiet heading, then rows, newest first, except series posts, which go in part order.
  - Each row has the title, the `short` text truncated to one line, a "Part n of N" pill for series posts, the date ("12 Nov 2026") and "n min read".
  - On phone, rows stack, as in Paper.

### Post page

- **Reading sheet:** centred, 760px wide on desktop and full width minus a 12px gutter on phone.
  - Day: background rgba(255,255,255,0.92), border 1px rgba(255,255,255,0.9), shadow `0 1px 2px rgba(20,30,60,0.06), 0 30px 80px rgba(20,30,60,0.14)`, radius 28px (24px on phone).
  - Night: background rgba(16,22,40,0.9), border 1px rgba(255,255,255,0.08), shadow `0 30px 80px rgba(0,0,0,0.35)`.
  - Padding: 64px 64px 56px on desktop, 28px 22px 24px on phone.
- **Inside the sheet, in order:**
  1. **Head.** The title (Instrument Sans 500, 44/52, letter spacing -0.02em; 30/36 on phone). Under it, the meta line: date · n min read · category · Part n of N. On the right, the Share button.
     - Share uses the Web Share API where it exists. Otherwise it copies the URL and the label changes to "Link copied" for two seconds.
  2. **"The short version" box:** tinted, radius 16px, holding the `short` text.
  3. **Body:** Newsreader 400 at 20/32 (18/29 on phone), h2 in Instrument Sans 500 at 26/34. Figures are rounded at 16px with a soft caption.
  4. **Download box,** if the post has a `download`. See "Email gate".
- **After the sheet:**
  - Series navigation for series posts: the series name, a progress bar of N segments, and Previous and Next cards. Show only the cards that exist.
  - Related: two cards. Use `related` from front matter, or else the two newest posts in the same category, or else the two newest posts.
- The "full paper" block in Paper is left out until papers ship.
- A post's closing line pointing to the method or the paper becomes a link to the GitHub repo until papers ship.

### /about

- Content as in the Paper About board:
  - title "About" with Angad's portrait (rounded 26px). Angad supplied it as `docs/writing/design/angad-portrait.png`; the build converts it to `public/about/angad.jpg`;
  - the bio;
  - pointers to Writing;
  - the "Elsewhere" list: X @onetrillionx, GitHub kluless13, LinkedIn, and ORCID 0009-0000-0985-4721 with the green iD badge.
- No email address anywhere.
- The bio text, verbatim:
  1. "I'm Angad Maniyambath. I'm Head of AI at Truflation. I'm building Truman, an agent built for macro, and working on Truflation Predict, prediction markets on economic data."
  2. "My background is marine science. I did a masters at James Cook University in Townsville, with fieldwork on reefs. In late 2022 I started teaching myself to code. Since then I've built FishTally, which uses vision models to count fish in video. It's published in SoftwareX."
  3. "Now I research prediction markets. The series in Writing comes from 686,272 Kalshi trades and about 248,000 Polymarket traders. I also forecast CPI and PCE."
  4. "I call myself a generalist. Marine science, code, markets, macro. If you want it in three words: I am stateless."
- One correction to the Paper bio: FishTally is "published in SoftwareX", not "a preprint on SSRN". This matches the home page.
- The Library pointer waits for Library.

## SEO and AEO

- **Metadata:** every page sets title, description, canonical and Open Graph.
  - Titles: "Writing · Angad Maniyambath", "<post title> · Angad Maniyambath", "About · Angad Maniyambath". The home title stays "Angad Maniyambath".
  - Posts use `og:type` article with `article:published_time`, `article:modified_time` and `article:author`.
- **Structured data (JSON-LD):**
  - Home and /about: `Person`, with `@id` https://1tx.dev/#angad, name, url, image (the portrait), jobTitle "Head of AI", worksFor Truflation, and `sameAs` (X, GitHub, LinkedIn, https://orcid.org/0009-0000-0985-4721).
  - Home also has `WebSite`.
  - Posts: `BlogPosting` with headline, description, datePublished, dateModified, author `{ "@id": "https://1tx.dev/#angad" }`, image (the share image), mainEntityOfPage and wordCount. Series posts also get `isPartOf` with the series name.
  - Posts and /writing: `BreadcrumbList`.
- **Share images:** one per post, made with `next/og` from the Paper share image design.
  - 1200x630: the sky crop, the title, the description, "1tx.dev/writing/<slug>" and "Angad Maniyambath".
  - The chart panel appears only if the post sets `cover` in front matter.
  - Instrument Sans for the font. The builder supplies the font file to `ImageResponse`.
  - /writing and /about use the existing `og.png`.
- **robots:**
  - Allow everything except `/api/`.
  - Name the AI crawlers explicitly as allowed: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended and Applebot-Extended.
  - Point to the sitemap.
- **Sitemap:** /, /writing, /about and every published post, using `updated` or `date` as lastModified.
- **RSS:**
  - Title "Angad Maniyambath, writing"; each item has the title, link, guid (the URL), pubDate and description.
  - Linked from the head of every writing page (`<link rel="alternate" type="application/rss+xml">`) and from the footer.
- **llms.txt:** follows the llmstxt.org format:
  - an H1 "Angad Maniyambath", a blockquote one-line summary from the home description, and a short paragraph on who Angad is;
  - `## Writing`, a list of posts as `[title](https://1tx.dev/writing/<slug>.md): description`;
  - `## About` with the about link.
- **llms-full.txt:** the same header, then every post's full Markdown, newest first, each starting with its title, URL and date.
- **Answer-friendly pages:** the short version is real text near the top of the page, and every chart's key number also appears in the prose. Charts carry descriptive alt text from the Markdown.
- **Manual checks before launch** (in the plan as a checklist, not code):
  - Vercel's bot protection and firewall don't challenge Googlebot or the AI crawlers.
  - The sitemap is submitted in Search Console by Angad.
  - Bing Webmaster Tools is set up (optional).

## Email gate

### What the reader sees

- A box at the end of a post with a `download`: the download's title and one-line description, an email field, and a button "Send it to me".
- Under the button, in small soft text: "I'll email you the link and add you to my list. One click to unsubscribe, any time."
- After submitting, the box says: "Check your inbox. The link works for 7 days."
- Errors in plain words, one line, in the box:
  - an invalid email: "That email doesn't look right."
- The token carries the post slug as well as the download id, so the expired-link page can link back to the post.
  - too many tries: "Too many tries. Give it an hour."
  - the provider failing: "Something went wrong on my end. Try again in a minute."

### How it works

1. `POST /api/subscribe` with `{ email, downloadId, consent: true, website }`.
   - `website` is a honeypot field hidden from people. If it's filled, the route returns success and does nothing.
2. The route validates with zod: the email is a valid address of at most 254 characters, `downloadId` exists in `content/downloads.ts`, and `consent` is true.
3. Rate limit through Upstash Redis: 5 requests per IP per hour and 3 per email per day. Store only a SHA-256 hash of IP and email as rate-limit keys, with expiry.
4. Add the contact to the list provider, tagged with the download id and the source post slug. Tag the same way if the contact already exists.
5. Send an email from Angad's sender. It contains the download's title and a link to `/api/download/<token>`.
   - The token is an HMAC-SHA256-signed payload of download id and expiry (7 days), signed with `DOWNLOAD_SIGNING_SECRET`. It holds no email.
6. `GET /api/download/[token]` verifies the signature and expiry, then streams the file with `Content-Disposition: attachment`.
   - An expired or invalid token gets a small page: "This link has expired. Get a fresh one" (linking to the post).
- **Privacy:** no email is logged, stored in Redis, written to the repo or shown anywhere. Server logs record the outcome only: subscribed, rejected or failed.
- **Provider: Resend** (Angad's choice, 2026-11-09). It handles both the list and the download email (the Resend emails API).
  - Resend contacts are now global, grouped by segments; audiences are no longer used. Each new contact is created with `segments: [{ id: RESEND_SEGMENT_ID }]`, a segment Angad creates in Resend (for example "1tx.dev list").
  - The 1tx.dev domain is verified in Resend, configured through Vercel, on 2026-11-09.
  - There is no confirmation step, so the link email is the first email the reader gets.
  - Unsubscribes are handled by Resend.
  - The route talks to Resend through one small module (`lib/mail/provider.ts`) with two functions, `addContact` and `sendDownloadEmail`, so the provider can be swapped later.
  - Tests mock that module.
- **Consent** (Angad's choice, 2026-11-09): pressing the button is consent, shown by the line under it. There's no tick box. The request still sends `consent: true`, so the server can refuse requests that didn't come from the form.
- **Shipping before the kit exists:** the gate is built and tested in this PR. It only appears on a post once that post has a `download` and the download's `DOWNLOAD_URL_<ID>` is set. At launch no post has one, so nothing shows until the starter kit is uploaded.
- **Environment variables:** `DOWNLOAD_SIGNING_SECRET`, `RESEND_API_KEY` (a full-access key, because creating contacts needs it), `RESEND_SEGMENT_ID`, `MAIL_FROM`, and the existing KV variables. Add them to `.env.local.example` without values.

## Papers, later

The full papers in `~/pm-data-analyses` have known errors found during the rewrite:
- a reverse longshot bias that was mislabelled;
- the specialist "124x", which is mostly a size effect;
- a counting bug in the trader journey;
- an invalid tier table;
- wrong microstructure z-scores.

They need corrections before they go public. A later build adds:
- /writing/papers/[slug] as HTML with `citation_*` meta tags for Google Scholar;
- `ScholarlyArticle` JSON-LD;
- a Cite box;
- a PDF behind the same email gate, with the HTML page left open so Scholar can index it.

Until then, posts link to the GitHub repo for method and code.

## Testing

**Unit (Vitest):**
- the front matter schema (valid, missing fields, a bad category, an unknown download or series);
- reading time;
- series ordering and previous and next;
- related-post fallback;
- category grouping and order;
- the Markdown figure and caption rule and dark chart pairing;
- the sitemap, robots, RSS, llms.txt and llms-full.txt output;
- token signing, verification, expiry and tampering;
- the subscribe route: validation, the honeypot, both rate limits, provider failure, and that no email appears in logs or Redis keys;
- the download route: valid, expired and tampered tokens, and an unknown file.

**End to end (Playwright):**
- /writing renders groups and the filter works and updates the URL;
- a post renders the sheet, the short version, figures and series nav;
- /about renders;
- the email gate's happy path and an error path, with the provider mocked;
- the `.md`, RSS, sitemap and llms routes return the right content types;
- extend `contrast.spec.ts` to the reading sheet in day and night.

Coverage stays at 80% or above on new code.

## Launch content

Angad chose nine posts for launch on 2026-11-09. The incomplete agent waits for open questions 23 and 24. Posts are copied from `docs/writing/drafts/` into `content/posts/` as the last step of the build. All nine share the launch day as their date.

| Draft | Proposed slug (needs Angad's OK) | Series |
|---|---|---|
| are-prices-real-probabilities | are-prediction-markets-accurate | Prediction markets, part 1 |
| nothing-ever-happens | why-prediction-markets-resolve-no | part 2 |
| how-knowledge-reaches-the-price | how-prediction-market-prices-move | part 3 |
| which-markets-work | which-prediction-markets-work-best | part 4 |
| specialist-vs-generalist | specialists-vs-generalists-in-prediction-markets | part 5 |
| trader-journey | do-winning-traders-keep-winning | part 6 |
| the-top-one-percent | are-top-prediction-market-traders-lucky | part 7 |
| the-99-point-gap | the-99-point-gap | none, category Thinking |
| not-an-x-person | im-not-a-programming-person | none, category Thinking |

AI and building has no posts at launch, so the filter won't show it until the field guide arrives. The group order rule still puts it first once it does.

The Claude Code field guide posts and the starter kit join when they're ready. Each is a content addition.

## Left to the builder

- The remark and rehype plugin choices, and how the `.md` route is wired (a rewrite or a route handler).
- Component structure, file names under `components/writing/`, and CSS organisation, within the existing patterns.
- How Newsreader 400 is loaded, provided home page performance doesn't regress.
- The rate limiter's implementation on Upstash.
- Exact responsive breakpoints between Paper's 390 and 1440 boards.

## Supplied by Angad

- Approval of the proposed slugs.
- The sender address for download emails, on a domain verified in Resend (for example on 1tx.dev, which means adding Resend's DNS records in Vercel).
- A Resend account and API key, added to Vercel's environment variables. Never pasted into chat.

## Decided by me, open to Angad's check

- The category order, with AI and building first.
- Library is left out of the nav until it ships.
- An About link in the footers.
- Papers wait for corrections.
- The 7-day link expiry and the rate limits.
- The FishTally bio correction.
- The error copy.
- Download files in Vercel Blob, with their URLs in server-only environment variables, because the repo is public.
- No `draft` flag: drafts never enter the repo.
