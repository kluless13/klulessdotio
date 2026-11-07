# Personal Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the résumé-style 1tx.dev with the approved one-page personal site: a live weather sky, Noise and Quiet modes, a poster viewer, a physics bookshelf and a weather image at the page bottom.

**Architecture:** Pure logic lives in `lib/` and is unit tested: sky model, poster data, content. A client `SkyProvider` owns the current time and weather and writes the tone's colours to CSS variables. `SkyCanvas` draws the shader behind everything. Noise and Quiet are two client views swapped by `useMode`. Server routes cache the weather and GitHub contributions, and both fail quietly.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind v4 (kept for its reset; the design lives in plain CSS), Framer Motion, Matter.js, sharp, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-07-personal-site-redesign-design.md`. Reference pages are in `docs/superpowers/specs/assets/`.

## Global Constraints

- Keep the Next.js 14, React 18, Tailwind v4 and Framer Motion stack. Use npm, because `package-lock.json` is the real lockfile.
- Tests first for new logic, 80% coverage of `lib/`, Playwright for critical flows.
- Respect `prefers-reduced-motion`. No site copy may contain em dashes. No email address on the site.
- Light sky minimum 0.27 luminance, dark sky maximum 0.15. Text at least 4.5:1, button edges at least 3:1.
- Don't touch `app/api/cron/notify`, `app/api/heatmap` or `vercel.json`.
- Immutable patterns, files under 800 lines, functions kept small, no `console.log`, validate external input with zod.
- Build on a new branch from `origin/main`. Nothing goes live without Angad's review.

## Review Focus

- Weather service down or slow: the page shows a clear sky with no temperature and no error. Pin with a route test and an e2e test that blocks the route.
- No WebGL: a CSS gradient for the current time and weather, with readable text. Pin with an e2e test that disables WebGL.
- Storage blocked, as in some private windows: the mode switch still works. Pin with a unit test on the mode store.
- 390px phone: no sideways page scroll in Noise, Quiet or the poster view. Pin with an e2e test.
- Keyboard only: Say hello opens, posters move with arrow keys, Escape closes, books open with Enter. Pin with an e2e test.

---

### Task 1: Branch, tooling and sky model

**Files:**
- Create: `vitest.config.ts`, `playwright.config.ts`, `lib/sky/model.ts`, `lib/sky/shader.ts`, `tests/unit/sky.test.ts`

**Interfaces:**
- Produces: `WEATHER`, `sunAt(hourIST, date)`, `istHour(date?)`, `palette(elevation)`, `weatherFromCode(code)`, `skyView({hour, weather, date})` returning `{sun, light, night, colours, base}`, `inkVars(light)`, `sceneFor(weather, night)`, `contrast(a, b)`, `formatHour(h)`.

- [ ] Commit the staged `.env.local` removal on the new branch.
- [ ] Install `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `jsdom`, `@playwright/test`.
- [ ] Write failing tests for: the WMO code table in the spec (0, 1, 2, 3, 45, 48, 51, 67, 71, 80, 86, 95), snow falling back to overcast, sun above horizon at Coimbatore noon and below at midnight, sky light only when the sun is above -1.5° with no rain or storm, the image table in the spec, and `contrast` on known pairs.
- [ ] Run them and see them fail, then port the logic from `sky-test.html` until they pass.
- [ ] Copy the shader unchanged in look from `sky-test.html`, with test controls removed.
- [ ] Commit.

### Task 2: Sky on screen, weather route, buttons and shell

**Files:**
- Create: `app/api/weather/route.ts`, `components/sky/SkyProvider.tsx`, `components/sky/SkyCanvas.tsx`, `components/Btn.tsx`, `app/icon.svg`, `public/og.png`, `tests/unit/weather-route.test.ts`
- Modify: `app/layout.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: Task 1 model.
- Produces: `useSky()` returning `{hour, weather, temperature, light, night, statusLine}`; `<Btn>`; CSS variables `--ink`, `--soft`, `--edge`, `--b-top`, `--b-bot`, `--b-ink`, `--b-ring`, `--b-shine`, `--g-light`, `--g-dark`.

- [ ] Test the route: valid upstream gives `{success: true, data: {weather, temperature, cover}}`; a failed or malformed upstream gives `{success: false}` with status 200. Then implement it with 15-minute caching.
- [ ] Build `SkyCanvas`: half resolution, capped at 30 frames per second, paused when the tab is hidden, a still frame with reduced motion, and a CSS gradient without WebGL. A `?weather=` and `?hour=` preview override is validated with zod.
- [ ] Rewrite `globals.css` for the button system with the Sweep shimmer, and load Instrument Sans with `next/font`.
- [ ] Update the layout and metadata: "A" favicon, share image, drop the Satoshi link and theme provider.
- [ ] Commit.

### Task 3: Noise page

**Files:**
- Create: `lib/content.ts`, `components/noise/*.tsx` (Greeting, Header, SayHello, Accordion rows, Projects, Activity, Timeline, PageBottom), `app/api/contributions/route.ts`, `tests/unit/content.test.ts`, `tests/unit/contributions.test.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `GREETINGS`, `BELIEFS`, `TIMELINE`, `BUILD`, `PROJECTS`, `LINKS`; `<NoiseView onPosters onQuiet />`; `GET /api/contributions` returning `{success, data: {weeks: number[][]}}`, with levels 0 to 4.

- [ ] Test content: no em dash in any copy, 11 greetings, timeline order and Baked text, FishTally's paper link.
- [ ] Test the contributions parser against a saved GitHub HTML sample, and that a bad response returns `{success: false}`.
- [ ] Implement content and sections in the spec's order, copying its wording exactly.
- [ ] Port `scene-test.html` to `PageBottom`, with the image chosen by `sceneFor`. Add a fallback where backdrop-filter is unsupported.
- [ ] Commit.

### Task 4: Posters

**Files:**
- Create: `scripts/build-posters.mjs`, `lib/posters.ts`, `lib/posters.manifest.json`, `public/p/*`, `components/posters/PosterStage.tsx`, `components/posters/Dock.tsx`, `components/posters/PosterViewer.tsx`, `tests/unit/posters.test.ts`

**Interfaces:**
- Produces: `POSTERS: Poster[]`, `GROUPS`, `posterOfTheDay(date)`, `nextIndex(i, delta, length)`; `<PosterStage>` shared by the viewer and Quiet.

- [ ] Test: 102 posters, every group's label as in the spec, no visible "official" label, the duplicates absent, every manifest file on disk, the same Poster of the Day for the same IST date, wrap-around in `nextIndex`.
- [ ] Export the 23 new posters from Paper at full size. Generate 1600px and 160px WebP files with sharp.
- [ ] Build the stage (swipe, arrows, smooth transition), the dock (magnify on hover, category jumps, thumbnails load lazily) and the viewer overlay (Escape closes, focus returns).
- [ ] Commit.

### Task 5: Quiet, music and books

**Files:**
- Create: `lib/mode.ts`, `lib/books.ts`, `public/covers/*`, `components/quiet/QuietView.tsx`, `components/quiet/Music.tsx`, `components/books/Bookshelf.tsx`, `components/books/shelf-engine.ts`, `tests/unit/mode.test.ts`, `tests/unit/books.test.ts`

**Interfaces:**
- Produces: `useMode()` returning `{mode, setMode}`; `<Bookshelf />`. Matter.js loads only when Books opens.

- [ ] Test the mode store, including blocked storage, and that every book has a cover file.
- [ ] Build Quiet: greeting, status line, Music, Books, Noise, stage with Poster of the Day, dock. Clicking the dock swaps the poster in place.
- [ ] Build Music as in the spec: loads when opened, hiding keeps it playing, leaving Quiet removes it.
- [ ] Port the physics and spines from `books-test.html`, with the slump rule, ceiling, respawn, Tidy, keyboard opening and cover card.
- [ ] Commit.

### Task 6: Cleanup and end-to-end checks

**Files:**
- Delete: `app/writing`, `app/portfolio`, `components/theme-*.tsx`, `components/ui/*`, unused hooks and dependencies
- Modify: `next.config.mjs` (redirects)
- Create: `tests/e2e/site.spec.ts`, `tests/e2e/contrast.spec.ts`

- [ ] Write e2e tests for: section order, Say hello links, redirects, mode switch and memory, poster keyboard flow, Quiet dock swap, music removal on leaving Quiet, dragging a book, opening a book, weather failure, no WebGL, no sideways scroll at 390px, and the 288-state contrast audit.
- [ ] Remove unused code and dependencies. Check that the cron route still builds.
- [ ] Run unit tests with coverage, e2e tests and `next build`, and see them pass.
- [ ] Commit, push, and open the PR with a test plan.
