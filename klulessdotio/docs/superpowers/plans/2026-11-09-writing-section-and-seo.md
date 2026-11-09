# Writing section, SEO foundations and email gate: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add /writing, post pages and /about to 1tx.dev, with a sitemap, robots, RSS, llms.txt, JSON-LD, share images and a Resend-backed email gate, launching with nine approved posts.

**Architecture:** Posts are Markdown files in `content/posts/`, validated with zod and rendered to HTML at build time with unified (remark/rehype). Pages are statically generated App Router routes that reuse the home page's sky. SEO outputs (sitemap, robots, RSS, llms files, Markdown copies) are pure functions over the loaded posts, exposed through Next metadata routes and route handlers. The email gate is two dynamic API routes: one validates, rate-limits through Upstash, adds the contact and emails an HMAC-signed link; the other verifies the link and streams the file from Vercel Blob.

**Tech Stack:** Next.js 14.2.16, React 18, TypeScript, Tailwind 4 and `app/globals.css`, zod, gray-matter, unified, remark-parse, remark-gfm, remark-rehype, rehype-stringify, next/og, resend, @upstash/redis, Vitest and Playwright.

**Spec:** `docs/superpowers/specs/2026-11-09-writing-section-and-seo-design.md`. Read it before starting any task. The design reference (Paper screenshots, the portrait, and `writing_boards.py.txt` with exact sizes, colours and copy) is in `docs/writing/design/`.

## Global Constraints

- Never `git add` anything under `docs/writing/`. It is excluded through `.git/info/exclude` and must stay out of the public repo.
- No gated file and no unapproved draft is ever committed. The repo kluless13/klulessdotio is public.
- **Style:**
  - No eyebrows, no all caps (`text-transform: uppercase` is banned), no monospace, sentence case everywhere.
  - No divider lines.
  - No em dash characters in any site copy, data or component string.
  - Buttons use the existing `.btn` class.
- **Reading sheet, day:** background rgba(255,255,255,0.92), border 1px rgba(255,255,255,0.9), shadow `0 1px 2px rgba(20,30,60,0.06), 0 30px 80px rgba(20,30,60,0.14)`, radius 28px (24px on phone), ink #101A2E, soft rgba(16,26,46,0.6), tint rgba(16,26,46,0.045).
- **Reading sheet, night:** background rgba(16,22,40,0.9), border 1px rgba(255,255,255,0.08), shadow `0 30px 80px rgba(0,0,0,0.35)`, ink #FFFFFF, soft rgba(255,255,255,0.6), tint rgba(255,255,255,0.05).
- **Type:**
  - Body: Newsreader 400 at 20/32 (18/29 under 640px).
  - h2: Instrument Sans 500 at 26/34.
  - Post title: Instrument Sans 500 at 44/52 with letter spacing -0.02em (30/36 under 640px).
- **Categories, in this exact order:** AI and building, Prediction markets, Thinking.
- Reading time is words divided by 230, rounded, minimum 1.
- Site URL is `https://1tx.dev`. Person `@id` is `https://1tx.dev/#angad`.
- **sameAs:** `https://twitter.com/onetrillionx`, `https://github.com/kluless13`, `https://www.linkedin.com/in/angad-maniyambath-b019293a7/`, `https://orcid.org/0009-0000-0985-4721`.
- **Email gate:**
  - Rate limits: 5 per IP per hour and 3 per email per day. Keys are SHA-256 hashes only.
  - Link expiry is 7 days.
  - No email in logs, Redis keys or the repo.
- **Environment variables:**
  - `DOWNLOAD_SIGNING_SECRET`, `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `MAIL_FROM`;
  - `DOWNLOAD_URL_<ID>`, with the id upper-cased and dashes turned into underscores;
  - the existing `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
  - Add all of them to `.env.local.example` with empty values.
- **Tests:**
  - Unit tests in `tests/unit/`, end-to-end tests in `tests/e2e/`.
  - Add `lib/writing/**`, `lib/downloads/**`, `lib/mail/**` and `lib/ratelimit.ts` to the Vitest coverage `include`. Lines must stay at 80% or above.
- **Commits:** conventional format (`feat:`, `test:` and so on), on the branch `feat/writing-section`, and never on main. Do not push. Angad decides on merging.

## Review Focus

1. **A post with a front matter mistake.** A missing `short`, a wrong category or a series part that doesn't match its position should fail the build with the file and field named, not render a broken page. Covered in Task 1.
2. **Night reading.** Charts with no dark variant must sit on a white rounded card, never directly on dark glass. Covered in Task 2 (markup) and Task 13 (contrast).
3. **Repeated or hostile gate submissions.** Double clicks, bots filling the honeypot, and the same email many times should be absorbed silently or rate-limited, with no email stored. Covered in Tasks 10 and 11.
4. **An old or edited download link.** An expired link should lead back to its post, and a tampered one should get a plain error, never the file. Covered in Tasks 9 and 11.
5. **Shared filtered views and JavaScript off.** `/writing?category=Thinking` should open filtered; with JavaScript off, every group shows. Covered in Task 5 and Task 13.

---

### Task 1: Content model and loader

**Files:**
- Create: `lib/writing/types.ts`, `lib/writing/schema.ts`, `lib/writing/posts.ts`, `lib/writing/format.ts`, `content/series.ts`, `content/downloads.ts`, `content/posts/.gitkeep`
- Create fixtures: `tests/fixtures/posts/valid/*.md` (four posts: two in series `prediction-markets` parts 1 and 2; one Thinking; one AI and building with `download: claude-code-starter-kit`; each with one small PNG under `public/writing/<slug>/` only if a later end-to-end test needs it), `tests/fixtures/posts/bad-category/x.md`, `tests/fixtures/posts/bad-part/x.md`, `tests/fixtures/posts/missing-short/x.md`
- Test: `tests/unit/writing-posts.test.ts`
- Modify: `package.json` (add `gray-matter`), `vitest.config.ts` (coverage include)

**Interfaces:**
- Produces:
  - `type Category = "AI and building" | "Prediction markets" | "Thinking"` and `CATEGORIES: readonly Category[]` (in the order above).
  - `interface Series { id: string; title: string; description: string; slugs: readonly string[]; featured: boolean }`
  - `interface Download { id: string; title: string; description: string; fileName: string; sizeLabel?: string }`
  - `interface PostMeta { slug: string; title: string; description: string; short: string; date: string; updated?: string; category: Category; series?: { id: string; part: number }; download?: string; related?: readonly string[]; cover?: string; words: number; minutes: number }`
  - `interface Post extends PostMeta { body: string }`
  - `class PostError extends Error { file: string; field: string }`
  - `loadPosts(dir?: string): readonly Post[]`: the default dir is `process.env.WRITING_CONTENT_DIR`, or else `path.join(process.cwd(), "content/posts")`. Sorted newest first. Throws `PostError`.
  - `getPost(slug: string, posts?: readonly Post[]): Post | undefined`
  - `readingMinutes(markdown: string): { words: number; minutes: number }`
  - `groupByCategory(posts: readonly PostMeta[]): readonly { category: Category; posts: readonly PostMeta[] }[]`: non-empty groups only, in category order. Series posts in part order, others newest first.
  - `seriesNeighbours(post: PostMeta, posts: readonly PostMeta[]): { series: Series; part: number; total: number; previous?: PostMeta; next?: PostMeta } | null`: `total` is `series.slugs.length`.
  - `relatedPosts(post: PostMeta, posts: readonly PostMeta[], count?: number): readonly PostMeta[]`: front matter `related` first, then the same category newest first, then the newest overall, never the post itself.
  - `featuredSeries(posts: readonly PostMeta[]): { series: Series; posts: readonly PostMeta[]; minutes: number } | null`: null when no published part exists.
  - `formatDate(iso: string, style: "long" | "short"): string`: "12 November 2026" or "12 Nov 2026", computed in UTC.
  - `SERIES`: two entries.
    - `prediction-markets`: title "Prediction market research", description "Seven posts from 686,272 Kalshi trades and about 248,000 Polymarket traders, all from December 2025 data.", slugs in the order of the spec's launch table, featured true.
    - `claude-code-field-guide`: title "Claude Code field guide", description "How I set up and use Claude Code every day, one part at a time.", no slugs, featured false.
  - `DOWNLOADS`: one entry. id `claude-code-starter-kit`, title "Claude Code starter kit", description "My CLAUDE.md, rules, hooks and agent setup, ready to copy.", fileName `claude-code-starter-kit.zip`.

- [ ] **Step 1: Write the failing tests** in `tests/unit/writing-posts.test.ts`:
  - `loads valid fixtures newest first with words and minutes`: `loadPosts(validDir)` has length 4, its first item has the latest date, and `minutes === Math.max(1, Math.round(words / 230))`.
  - `names the file and field on a bad category`: expect a `PostError` matching `{ file: expect.stringContaining("x.md"), field: "category" }`.
  - `names the file and field when short is missing`: `field: "short"`.
  - `rejects a series part that does not match the series order`: `field: "series"`.
  - `rejects a description over 160 characters`: built inline with a temp dir.
  - `groups in category order and orders series by part`: group names are `["AI and building", "Prediction markets", "Thinking"]` and series slugs are in part order.
  - `finds series neighbours`: part 1 has no previous, its next is part 2, and total is 7.
  - `fills related from front matter then category then newest, never itself`.
  - `featuredSeries is null with no published parts and sums minutes otherwise`.
  - `formats dates in UTC`: `formatDate("2026-11-12","long") === "12 November 2026"` and `formatDate("2026-11-12","short") === "12 Nov 2026"`.
  - `content data has no em dashes`: `JSON.stringify([SERIES, DOWNLOADS])` does not contain "—".
- [ ] **Step 2:** Run `npx vitest run tests/unit/writing-posts.test.ts`. Expect FAIL, with the modules not found.
- [ ] **Step 3: Implement.** Use gray-matter to parse. Validate with a zod schema in `schema.ts`. The date is a `YYYY-MM-DD` string; coerce gray-matter `Date` objects back to ISO date strings. Map the first failing zod issue path to `PostError.field`. Fixtures for the series check reference `SERIES` slugs, so name the two series fixtures with the first two prediction-markets slugs.
- [ ] **Step 4:** Run the test. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add the writing content model and loader`.

### Task 2: Markdown rendering

**Files:**
- Create: `lib/writing/markdown.ts`
- Test: `tests/unit/writing-markdown.test.ts`
- Modify: `package.json` (add `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-stringify`)

**Interfaces:**
- Consumes: `Post` from Task 1.
- Produces: `renderMarkdown(markdown: string, slug: string, hasFile?: (publicPath: string) => boolean): Promise<string>`. `hasFile` defaults to checking `public/` on disk.

**Rules:**
- **Image paths:** `images/x.png` becomes `/writing/<slug>/x.png`.
- **Figures:** a paragraph containing only an image, followed by a paragraph containing only emphasis, becomes `<figure class="post-figure"><img ...><figcaption>…</figcaption></figure>`. With no emphasis paragraph after it, the alt text is the caption.
- **Dark variants:** if `hasFile("/writing/<slug>/x-dark.png")`, render two `<img>` elements with classes `fig-light` and `fig-dark`. If not, add class `fig-card` to the figure.
- **Image attributes:** every `<img>` gets `loading="lazy"`, `decoding="async"` and its alt text.
- **Links:** external links (http or https, not 1tx.dev) get `rel="noopener"`.
- **Tables:** GFM tables are wrapped in `<div class="post-table">`.

- [ ] **Step 1: Write the failing tests:**
  - `resolves relative image paths per slug`;
  - `wraps image plus italic line as figure with that caption and drops the italic paragraph`;
  - `uses alt as caption when no italic line follows`;
  - `pairs a dark variant when the file exists` (with `hasFile` stubbed to true for `-dark`);
  - `marks figures without a dark variant as cards`;
  - `adds rel noopener to external links only`;
  - `wraps tables`;
  - `renders bold, italic, h2, h3, lists and quotes`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement with a small custom remark or rehype plugin for the figure rule. No raw HTML passthrough.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: render posts from markdown with figures and dark chart pairing`.

### Task 3: Feeds and machine-readable outputs

**Files:**
- Create: `lib/writing/feeds.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/writing/rss.xml/route.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `app/writing/md/[slug]/route.ts`
- Modify: `next.config.mjs`
  - Remove the `/writing` redirect.
  - Add the rewrite `{ source: "/writing/:slug.md", destination: "/writing/md/:slug" }`.
- Test: `tests/unit/writing-feeds.test.ts`

**Interfaces:**
- Consumes: `loadPosts` and `PostMeta` from Task 1.
- Produces, in `lib/writing/feeds.ts`:
  - `SITE_URL = "https://1tx.dev"`
  - `AI_CRAWLERS = ["GPTBot","OAI-SearchBot","ChatGPT-User","ClaudeBot","Claude-SearchBot","PerplexityBot","Google-Extended","Applebot-Extended"] as const`
  - `sitemapEntries(posts): { url: string; lastModified: string }[]`: /, /writing, /about, then each post using `updated ?? date`.
  - `robotsRules(): MetadataRoute.Robots`: `*` allowed with `/api/` disallowed, each AI crawler explicitly allowed, and the sitemap at `https://1tx.dev/sitemap.xml`.
  - `rssXml(posts): string`: RSS 2.0, channel title "Angad Maniyambath, writing". XML-escape everything.
  - `llmsTxt(posts): string` and `llmsFullTxt(posts): string`, following the spec's format.
  - `postMarkdown(post): string`: `# title`, then a URL line, a date line, a blank line and the body.
- All route handlers set `export const dynamic = "force-static"`. Content types:
  - RSS: `application/rss+xml; charset=utf-8`;
  - llms and Markdown: `text/plain; charset=utf-8` and `text/markdown; charset=utf-8`.
- The Markdown route uses `generateStaticParams` from the posts and returns 404 for an unknown slug.

- [ ] **Step 1: Write the failing tests:**
  - `sitemap lists home, writing, about and each post with lastModified`;
  - `robots disallows api, allows every named AI crawler and points to the sitemap`;
  - `rss escapes ampersands and quotes and includes guid, link and pubDate`;
  - `llms.txt has the H1, the blockquote and one line per post linking to the .md copy`;
  - `llms-full contains every post body newest first`;
  - `outputs are valid with zero posts`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement the functions and wire the routes.
- [ ] **Step 4:** Run it. Expect PASS. Also run `npx next build` and check that the build lists `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/writing/rss.xml` as static.
- [ ] **Step 5:** Commit: `feat: add sitemap, robots, rss, llms files and markdown copies`.

### Task 4: Metadata and structured data

**Files:**
- Create: `lib/writing/seo.ts`, `components/writing/JsonLd.tsx`
- Test: `tests/unit/writing-seo.test.ts`

**Interfaces:**
- Produces:
  - `personJsonLd()` and `websiteJsonLd()`;
  - `blogPostingJsonLd(post: PostMeta, seriesTitle?: string)`;
  - `breadcrumbJsonLd(items: readonly { name: string; url: string }[])`;
  - `postMetadata(post: PostMeta): Metadata`: title `<title> · Angad Maniyambath`, canonical, Open Graph article fields, Twitter card;
  - `pageMetadata(path: string, title: string, description: string): Metadata`.
- `<JsonLd data={object} />` renders `<script type="application/ld+json">`, with `<` escaped as `<`.
- Person: jobTitle "Head of AI", worksFor `{ "@type": "Organization", name: "Truflation", url: "https://truflation.com" }`, image `https://1tx.dev/about/angad.jpg`.

- [ ] **Step 1: Write the failing tests:**
  - `person has the id, sameAs in the agreed order, and no email`;
  - `blog posting references the person id and has dates, wordCount and image`;
  - `series posts get isPartOf`;
  - `post metadata sets canonical and article times`;
  - `JsonLd escapes closing script tags`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add metadata and json-ld helpers`.

### Task 5: Shared chrome, home nav and the /writing index

**Files:**
- Create:
  - `components/writing/WritingShell.tsx`: client component; `SkyProvider` + `SkyCanvas` + top bar + children + footer.
  - `components/writing/TopBar.tsx`, `components/writing/QuietLink.tsx`, `components/writing/Footer.tsx`
  - `components/writing/CategoryFilter.tsx` (client), `components/writing/FeaturedCard.tsx`, `components/writing/PostRow.tsx`
  - `app/writing/page.tsx`, `app/writing/writing.css` (imported from the writing pages)
- Modify:
  - `components/noise/NoiseView.tsx`: a Writing `<a className="btn" href="/writing">` before Quiet, and an About link in the footer.
  - `playwright.config.ts`: the web server command sets `WRITING_CONTENT_DIR=tests/fixtures/posts/valid` and `DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT=http://localhost:3100/test-download.txt`.
- Test: `tests/unit/writing-quiet-link.test.tsx`, `tests/e2e/writing.spec.ts` (new)

**Page details:**
- `app/writing/page.tsx` uses `pageMetadata("/writing", "Writing · Angad Maniyambath", "Things I looked into, and what I found.")`.
- It adds `alternates.types: { "application/rss+xml": "https://1tx.dev/writing/rss.xml" }`, which the post page reuses.
- It renders a BreadcrumbList (Home, then Writing) with `<JsonLd>`.
- The footer has About, Writing and RSS links, plus `COPYRIGHT`.

**Interfaces:**
- Consumes: Task 1 functions and `writeMode` from `lib/mode.ts`.
- Produces:
  - `QuietLink`: on click, it calls `writeMode(localStorage, "quiet")` and navigates to `/`.
  - `TopBar({ current?: "Writing" })`.
  - `CategoryFilter({ categories })` toggles `hidden` on `[data-category]` groups and calls `history.replaceState` with `?category=`. It reads the initial value from the URL. The server renders every group visible.

- [ ] **Step 1: Write the failing tests:**
  - Unit: `QuietLink writes quiet mode then navigates`, with jsdom and `location.assign` stubbed.
  - End to end, in `tests/e2e/writing.spec.ts` (requires Task 15 content or the env var `WRITING_CONTENT_DIR` pointing at fixtures):
    - `home shows a Writing button that opens /writing`;
    - `/writing shows groups in order with rows showing title, short, date and minutes`;
    - `filter hides other groups and updates the URL`;
    - `?category=Thinking opens filtered`;
    - `with JavaScript disabled all groups are visible`;
    - `Quiet from /writing lands on home in quiet mode`;
    - `/writing links the RSS feed in the head and has BreadcrumbList json-ld`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement to match `docs/writing/design/writing-index-*.jpg` and the `index_header`, `featured`, `post_row` and `post_row_phone` values in `writing_boards.py.txt`. Show the empty state "First posts soon." when there are no posts. Add `public/test-download.txt`, containing "test", for the gate's end-to-end tests.
- [ ] **Step 4:** Run it. Expect PASS. Check that the home page still passes `tests/e2e/site.spec.ts`.
- [ ] **Step 5:** Commit: `feat: add the writing index, shared chrome and home nav`.

### Task 6: Post page

**Files:**
- Create:
  - `app/writing/[slug]/page.tsx`: `generateStaticParams`, `dynamicParams = false`, `generateMetadata` from Task 4.
  - `components/writing/Sheet.tsx`, `components/writing/PostHead.tsx`, `components/writing/ShareButton.tsx` (client)
  - `components/writing/ShortVersion.tsx`, `components/writing/SeriesNav.tsx`, `components/writing/RelatedPosts.tsx`
- Modify: `app/writing/writing.css` (sheet, body, figure, `fig-light`/`fig-dark`/`fig-card` and post-table styles), `app/layout.tsx` (Newsreader weights 400 and 400 italic, still `preload: false`)
- Test: extend `tests/e2e/writing.spec.ts`

**Rules:**
- **Figure tone:** `.fig-dark` shows only when `<html>` lacks `.day`, and `.fig-light` only when it has it.
- **Share button:** `navigator.share` when available, otherwise `navigator.clipboard.writeText` and the label "Link copied" for 2 seconds.
- **JSON-LD:** BlogPosting and BreadcrumbList are rendered on the page.

- [ ] **Step 1: Write the failing end-to-end tests:**
  - `post renders title, meta line, the short version and body in Newsreader`;
  - `figures render with captions`;
  - `series nav shows next only on part 1 and both on a middle part`;
  - `related shows two cards`;
  - `share copies the link when Web Share is missing`;
  - `json-ld BlogPosting is present`;
  - `unknown slug is 404`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement to match `docs/writing/design/writing-post-*.jpg` and `writing_boards.py.txt` (`post_head`, `short_version`, `post_body`, `series_nav`, `related`). Leave out the paper block.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add the post page`.

### Task 7: Share images

**Files:**
- Create: `app/writing/[slug]/opengraph-image.tsx`, `assets/fonts/InstrumentSans-Medium.ttf` (OFL; download from the Google Fonts GitHub repo), `assets/og/sky-day.jpg` (a 1200x630 crop of the day sky image the home page uses)
- Test: extend `tests/e2e/writing.spec.ts`

**Interfaces:**
- Consumes: `getPost` and `formatDate`.
- Produces: a 1200x630 PNG.
  - Left: the title (60/66), the description (24/34), "Angad Maniyambath" and `1tx.dev/writing/<slug>`.
  - Right: a panel with the `cover` chart, only when `cover` is set.

- [ ] **Step 1: Write the failing test:** `opengraph-image returns a 1200x630 png for a post`. Check the content type is `image/png`, and read the dimensions from the PNG header bytes.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement with `ImageResponse`, loading the font and the sky with `fs.readFile`. Compare against `docs/writing/design/writing-share.jpg`.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: generate a share image for each post`.

### Task 8: /about and home structured data

**Files:**
- Create: `app/about/page.tsx`, `content/about.ts` (bio paragraphs verbatim from the spec, and the elsewhere links), `scripts/portrait.mjs` (sharp: `docs/writing/design/angad-portrait.png` to `public/about/angad.jpg`, 480x480, quality 82, grayscale), `public/about/angad.jpg` (generated)
- Modify: `app/page.tsx` (render `<JsonLd>` with Person and WebSite). `/about` uses `pageMetadata("/about", "About · Angad Maniyambath", <first bio sentence>)`, plus Person and BreadcrumbList JSON-LD.
- Test: `tests/unit/about-content.test.ts`, extend `tests/e2e/writing.spec.ts`

- [ ] **Step 1: Write the failing tests:**
  - Unit: `about copy has no em dashes, no email and says SoftwareX not SSRN`.
  - End to end:
    - `about renders portrait, bio, Elsewhere with four links including ORCID, and Person json-ld`;
    - `home has Person json-ld`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement to match `docs/writing/design/writing-about-*.jpg`, leaving out the Library pointer. Run `node scripts/portrait.mjs` once and commit only the output JPEG.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add the about page and person structured data`.

### Task 9: Download tokens and the download registry

**Files:**
- Create: `lib/downloads/token.ts`, `lib/downloads/registry.ts`
- Test: `tests/unit/download-token.test.ts`

**Interfaces:**
- Produces:
  - `signToken(payload: { downloadId: string; slug: string; exp: number }, secret: string): string`: the format is `base64url(json).base64url(hmacSha256)`.
  - `verifyToken(token: string, secret: string, now?: number): { ok: true; payload } | { ok: false; reason: "invalid" } | { ok: false; reason: "expired"; slug: string }`. Use a timing-safe comparison. `expired` is returned only when the signature is valid.
  - `TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000`
  - `downloadEnvKey(id: string): string` (`claude-code-starter-kit` becomes `DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT`)
  - `downloadUrl(id: string, env?: Record<string, string | undefined>): string | null`
  - `isDownloadAvailable(id: string, env?): boolean`: the id exists in `DOWNLOADS` and its URL is set.

- [ ] **Step 1: Write the failing tests:**
  - `round-trips a payload`;
  - `rejects a tampered payload and a tampered signature as invalid`;
  - `reports expired with the slug only when the signature is valid`;
  - `rejects malformed strings`;
  - `maps ids to env keys`;
  - `availability needs both a known id and a url`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement with `node:crypto`.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add signed download tokens and the download registry`.

### Task 10: Rate limiting and the mail provider

**Files:**
- Create: `lib/ratelimit.ts`, `lib/mail/provider.ts`, `lib/mail/download-email.ts`
- Modify: `package.json` (add `resend`), `.env.local.example`
- Test: `tests/unit/ratelimit.test.ts`, `tests/unit/mail-provider.test.ts`

**Interfaces:**
- Produces:
  - `hashKey(kind: "ip" | "email", value: string): string`: `rl:<kind>:<sha256 hex>`, with the email lower-cased and trimmed first.
  - `allow(redis: Pick<Redis, "incr" | "expire">, key: string, limit: number, windowSeconds: number): Promise<boolean>`: INCR, then EXPIRE when the count is 1. Allowed when count is at most the limit.
  - `getRateLimitRedis(): Pick<Redis, "incr" | "expire">`, using the same env var fallback as `app/api/cron/notify/route.ts`.
  - `MailProvider { addContact(input: { email: string; downloadId: string; slug: string }): Promise<void>; sendDownloadEmail(input: { email: string; title: string; link: string }): Promise<void> }`
  - `resendProvider(env?): MailProvider`
    - It calls `contacts.create({ email, unsubscribed: false, segments: [{ id: RESEND_SEGMENT_ID }] })`. Resend contacts are global; there is no `audienceId`.
    - It treats "already exists" as success. Before relying on that, check the current SDK error shape against resend.com/docs.
    - It sends from `MAIL_FROM` with the subject `Your download: <title>`.
    - It throws `Error("mail provider failed")` on any other failure, never including the email in the message.
  - `downloadEmailHtml(title: string, link: string): string` and `downloadEmailText(...)`.
    - Body: "Here's the <title> you asked for." / the link / "The link works for 7 days." / "Angad".
    - No em dashes.

- [ ] **Step 1: Write the failing tests:**
  - `hashKey never contains the raw value and normalises email case`;
  - `allow sets expiry on first hit and blocks after the limit`;
  - `resendProvider adds the contact and sends the email`, with Resend mocked;
  - `existing contact counts as success`;
  - `provider errors never include the email`;
  - `email copy has no em dashes`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add rate limiting and the resend mail provider`.

### Task 11: Subscribe and download routes

**Files:**
- Create: `app/api/subscribe/route.ts`, `app/api/download/[token]/route.ts`, `lib/subscribe.ts` (the testable handler core)
- Test: `tests/unit/subscribe-route.test.ts`, `tests/unit/download-route.test.ts`

**Interfaces:**
- Consumes: Tasks 9 and 10.
- Produces:
  - `handleSubscribe(body: unknown, ip: string, deps: { redis; provider: MailProvider; env; now: () => number; log: (event: "subscribed" | "rejected" | "rate_limited" | "failed") => void }): Promise<{ status: number; body: { success: boolean; error?: "invalid_email" | "rate_limited" | "unavailable" | "server" } }>`
    - The zod schema is `{ email: z.string().trim().email().max(254), downloadId: z.string(), consent: z.literal(true), website: z.string().max(0).optional(), slug: z.string() }`.
    - If the honeypot is filled, return `{ status: 200, body: { success: true } }` and call no dependencies.
    - An unknown or unavailable download returns 404 `unavailable`.
    - Rate limited returns 429.
    - Provider failure returns 502 `server`.
  - Both routes set `export const dynamic = "force-dynamic"`.
  - The download route:
    - verifies the token, fetches `downloadUrl(id)` server-side, and streams it with `Content-Disposition: attachment; filename="<fileName>"` and `Cache-Control: private, no-store`;
    - on an expired token, returns a small HTML page reading "This link has expired." with a link "Get a fresh one" to `/writing/<slug>`;
    - on an invalid token, returns 400 with "This link doesn't work.";
    - returns 404 when the file is unavailable.

- [ ] **Step 1: Write the failing tests:**
  - `honeypot returns success and touches nothing`;
  - `invalid email is 400 invalid_email`;
  - `missing consent is 400`;
  - `unknown or unavailable download is 404`;
  - `ip and email limits return 429`;
  - `happy path adds the contact, sends a link that verifies, and logs subscribed`;
  - `provider failure is 502`;
  - `no email appears in any log call or redis key`, asserting over every captured argument;
  - for downloads, `valid token streams with attachment headers`, `expired token links back to the post`, `tampered token is 400` and `unavailable file is 404`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement. Thin route files call `handleSubscribe` with real dependencies. Get the IP from `x-forwarded-for` (first entry), falling back to `"unknown"`.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add the subscribe and download routes`.

### Task 12: Email gate component

**Files:**
- Create: `components/writing/EmailGate.tsx` (client)
- Modify: `app/writing/[slug]/page.tsx` (render it inside the sheet after the body, only when `post.download` is set and `isDownloadAvailable(post.download)` is true at build)
- Test: extend `tests/e2e/writing.spec.ts`, using a fixture post with `download` and `DOWNLOAD_URL_CLAUDE_CODE_STARTER_KIT` set in the test web server env

**Copy (exact):**
- Button: "Send it to me".
- Line under the button: "I'll email you the link and add you to my list. One click to unsubscribe, any time."
- Success: "Check your inbox. The link works for 7 days."
- Errors:
  - invalid_email: "That email doesn't look right."
  - rate_limited: "Too many tries. Give it an hour."
  - server or unavailable: "Something went wrong on my end. Try again in a minute."
- The honeypot field is named `website`. It's visually hidden, with `tabIndex={-1}` and `autoComplete="off"`.
- The request body is `{ email, downloadId, slug, consent: true, website }`. The props are `EmailGate({ download: Download; slug: string })`.
- The button is disabled while the request is in flight.

- [ ] **Step 1: Write the failing end-to-end tests,** intercepting `/api/subscribe` with `page.route`:
  - `shows success copy after submit`;
  - `shows the invalid email copy on 400`;
  - `disables the button while sending`;
  - `gate is absent on posts without a download`.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run it. Expect PASS.
- [ ] **Step 5:** Commit: `feat: add the email gate to posts with a download`.

### Task 13: Reading contrast and phone checks

**Files:**
- Modify: `tests/e2e/contrast.spec.ts`
- Test: extend `tests/e2e/writing.spec.ts`

- [ ] **Step 1: Write the tests:**
  - `post text and soft text on the sheet pass 4.5:1 in day and night`: compute from the sheet colours in Global Constraints against the sheet background composited over the darkest and lightest sky pixels.
  - `charts without a dark variant sit on a card at night`.
  - `at 390px the index and post have no horizontal scroll`.
- [ ] **Step 2:** Run them. Fix any failures by adjusting CSS only.
- [ ] **Step 3:** Commit: `test: check reading contrast and phone layout for writing pages`.

### Task 14: Publish the nine launch posts

**Files:**
- Create: `content/posts/<slug>.md` for the nine slugs in the spec's launch table, and `public/writing/<slug>/*.png` for the images each post references.
- Modify: `content/series.ts` if a slug differs from Task 1.

**Steps:**
- [ ] **Step 1:** For each draft in `docs/writing/drafts/` named in the launch table:
  - copy the body without its internal front matter and first `# Title`;
  - write the front matter (title from the draft, then `description`, `short`, `date` as the launch day, `category`, `series`, and `cover` for part 1 only: `chart-calibration.png`);
  - copy only the images it references into `public/writing/<slug>/`.

  Take `short` from the matching `POSTS` entry in `writing_boards.py.txt`, and write `description` as one sentence under 160 characters.
- [ ] **Step 2:** Replace placeholder method or paper lines, such as `[link to the paper on this site]`, with a link to `https://github.com/kluless13/pm-data-analyses`. Replace links between drafts with the new slugs.
- [ ] **Step 3:** Run `npx vitest run` and `npx next build`. Expect all nine posts to build as static pages with no `PostError`.
- [ ] **Step 4:** Run `git status`. Confirm that nothing under `docs/writing/` is staged and that only the referenced images are added.
- [ ] **Step 5:** Commit: `feat: publish the first nine posts`.

### Task 15: Final verification and launch checklist

- [ ] **Step 1:** Run `npm run test:coverage` (expect lines at 80% or above) and `npm run test:e2e` (expect all to pass).
- [ ] **Step 2:** Run `npx next build`, then `npx next start`, and check with `curl -sI`:
  - `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/writing/rss.xml` and `/writing/are-prediction-markets-accurate.md` return 200 with the right content types;
  - `/writing/nope` returns 404.
- [ ] **Step 3:** Grep the built `.next/server/app` for "—" in writing pages, and for any email pattern. Expect none.
- [ ] **Step 4:** Write a checklist for Angad into the PR description:
  - set the Resend env vars and verify the sending domain;
  - set `DOWNLOAD_SIGNING_SECRET` (`openssl rand -hex 32`);
  - confirm Vercel's firewall and bot protection don't challenge Googlebot or the named AI crawlers;
  - submit `https://1tx.dev/sitemap.xml` in Search Console after merge;
  - optionally, set up Bing Webmaster Tools.
- [ ] **Step 5:** Commit any fixes. Do not push without Angad's go-ahead.
