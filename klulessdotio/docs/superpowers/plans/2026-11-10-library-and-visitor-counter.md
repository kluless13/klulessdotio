# Library and Visitor Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/library` (fonts and buttons Angad likes, each with its own URL and an open sheet) and the "You're visitor #N" counter on 1tx.dev.

**Architecture:**
- The catalogue is typed data in `content/library.ts`, with pure helpers in `lib/library/`.
- `/library` and `/library/[slug]` render one client component, `LibraryView`, on the real sky. The sheet is a client overlay that updates the URL with the History API, so the page stays mounted.
- The counter is a small API route (`POST /api/visitor`) on the existing Upstash and guard code, plus a client toast that remembers the number in `localStorage`.

**Tech Stack:** Next.js 14.2.16 App Router, React 18, TypeScript, plain CSS files (the repo's pattern), framer-motion, lucide-react, next/font, @upstash/redis, Vitest (jsdom), Playwright.

**Spec:** `docs/superpowers/specs/2026-11-10-library-and-visitor-counter-design.md`. Read it first; it is the authority.

**Design reference (local only, git-ignored):** `docs/writing/design/library/`.
- `shots/` holds the approved Paper screenshots.
- `scripts/*.py.txt` hold the exact CSS that drew every button, tile and specimen:
  - `lib_buttons.py.txt`, `lib_styles.py.txt`, `lib_more.py.txt` and `lib_catalog.py.txt` for the buttons;
  - `lib_specimens.py.txt` for the fonts;
  - `library_page.py.txt`, `library_phone.py.txt` and `extra_boards.py.txt` for the page, tiles, sheets, states and night;
  - `counter_boards.py.txt` for the counter.
- Port values from these files; don't invent them.

## Global Constraints

- No eyebrows, no all caps, no mono font text, no unnecessary lines. Mono is allowed only inside the CSS code block on a button sheet.
- No em dashes in any site copy.
- No email address on the site.
- The site's own buttons use the existing `.btn` styles: rounded rectangles, never pills. Exhibits keep their historical shapes.
- The repo is public. Nothing private, no secrets, nothing from `docs/writing/` gets committed.
- Wrap every `localStorage`/`sessionStorage` access in try/catch; every page must work with storage blocked.
- Text passes WCAG AA contrast by day and by night.
- No new runtime dependencies, except the `geist` package if `next/font/google` in Next 14.2.16 has no `Geist` export.
- Commit messages: conventional commits, ending with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Unit tests go in `tests/unit/*.test.ts(x)`, e2e tests in `tests/e2e/*.spec.ts`. Run unit tests with `npx vitest run`, e2e with `npx playwright test`, and the type check with `npx tsc --noEmit`.
- Add `lib/library/**` and `lib/visitor*.ts` to the coverage `include` list in `vitest.config.ts`. Coverage stays at or above 80% lines.

## Review Focus

1. **Storage blocked** (Safari private mode, cookies off): the counter must not call the API and must not render. Otherwise every page load would count a new visitor. Pinned in Task 7.
2. **React StrictMode or a double effect on the first visit:** the toast must POST once, not twice. Pinned in Task 7.
3. **Escape with the share menu open:** it closes the menu, not the sheet. Pinned in Task 6.
4. **Back and forward after stepping through several items:** Back closes the sheet and returns to `/library`, and Forward reopens the last item shown. Pinned in Task 8.
5. **Sheet on a 390px phone:** the panels stack, the arrows don't cover the content, and swiping steps. Pinned in Task 8.

---

### Task 1: Catalogue data and helpers

**Files:**
- Create: `lib/library/types.ts`, `lib/library/catalogue.ts`, `lib/library/navigation.ts`, `content/library.ts`
- Modify: `vitest.config.ts` (coverage include)
- Test: `tests/unit/library-catalogue.test.ts`, `tests/unit/library-navigation.test.ts`

**Interfaces:**
- Produces, in `lib/library/types.ts`:
  ```ts
  export type Era = "Weighted" | "Retro desktops" | "Web 2.0 and early iPhone" | "Flat and Material" | "Modern" | "Soft and glass" | "Mine"
  export interface Weight { name: string; value: number }            // { name: "Thin", value: 100 }
  export interface FontItem { kind: "font"; slug: string; name: string; category: "Sans serif" | "Serif"; by: string; note: string; weights: readonly Weight[]; link: string; systemNote?: string }
  export interface SiteLink { label: string; href: string }          // { label: "Visit exa.ai", href: "https://exa.ai" }
  export interface ButtonItem { kind: "button"; slug: string; name: string; era: Era; source: string; note: string; how: readonly string[]; css: string; link?: SiteLink }
  export type LibraryItem = FontItem | ButtonItem
  export type Filter = "all" | "type" | "buttons"
  export interface Section { title: string; items: readonly LibraryItem[] }
  ```
- Produces, in `lib/library/catalogue.ts`:
  - `ERAS: readonly Era[]`, in the spec's order.
  - `slugify(name: string): string`
  - `allItems(): readonly LibraryItem[]`, in page order: the fonts, then the buttons by era.
  - `itemBySlug(slug: string): LibraryItem | undefined`
  - `sectionsFor(filter: Filter): readonly Section[]`
  - `itemsFor(filter: Filter): readonly LibraryItem[]`
  - `kindLabel(item: LibraryItem): string`
- Produces, in `lib/library/navigation.ts`:
  - `stepIndex(index: number, delta: number, length: number): number`, which wraps around.
  - `positionLabel(index: number, length: number): string`, returning for example "3 of 10".
- Produces, in `content/library.ts`: `FONTS: readonly FontItem[]` and `BUTTONS: readonly ButtonItem[]`.

**Content rules:**
- **Fonts:** 10, in the spec's order. Notes are verbatim from `lib_specimens.py.txt`, with every bracketed "(Shown in Geist here: ...)" remark removed.
  - Weights: each font's real weights, from its files or its official page.
  - Links: each font's official page (the foundry's site, Vercel's Geist page, Fontshare, or Google Fonts).
  - Helvetica gets `systemNote: "Shown in your device's Helvetica. Without it, you'll see Arial."`.
- **Buttons:** 32, the 31 from `lib_catalog.py.txt` in its order, plus Mine.
  - Name, source and note are verbatim.
  - `how` is 2 or 3 short factual lines describing the CSS, in the style of Weighted's lines: "A darker lip under the face gives it weight." / "A thin light line along the top catches the light." / "Pressing drops the lip and sinks it by a pixel."
  - `css` is the item's key CSS, ported from the scripts.
  - Mine: `{ name: "Mine", era: "Mine", source: "1tx.dev", note: "Where all of the above ended up. The border shimmers on hover." }`, with no link.
- **Links:**
  - Sources mentioning exa.ai: `{ label: "Visit exa.ai", href: "https://exa.ai" }`.
  - GitHub: `{ label: "Visit GitHub", href: "https://github.com" }`.
  - apple.com: `{ label: "Visit apple.com", href: "https://www.apple.com" }`.
  - stripe.com: `{ label: "Visit stripe.com", href: "https://stripe.com" }`.
  - shadcn/ui: `{ label: "Visit shadcn/ui", href: "https://ui.shadcn.com" }`.
  - No link for anything else.

- [ ] **Step 1: Write the failing tests** in `tests/unit/library-catalogue.test.ts`:
  - `has 10 fonts and 32 buttons`: `FONTS.length === 10`, `BUTTONS.length === 32`.
  - `slugs are unique across fonts and buttons`.
  - `slugify`: "Geist"→"geist", "EB Garamond"→"eb-garamond", "Weighted, light"→"weighted-light", "Aqua, graphite"→"aqua-graphite", "shadcn/ui"→"shadcn-ui", and every item's `slug === slugify(name)`.
  - `eras appear in order`: `sectionsFor("all").map(s => s.title)` equals `["Type", "Weighted", "Retro desktops", "Web 2.0 and early iPhone", "Flat and Material", "Modern", "Soft and glass", "Mine"]`.
  - `filters`: `sectionsFor("type")` is only Type; `sectionsFor("buttons")` has no Type; `itemsFor("all").length === 42`.
  - `every item has a non-empty note`, and no note contains "Shown in".
  - `every button has 2 to 3 how lines and non-empty css`.
  - `notes contain no em dash`, and neither do `how` lines, `systemNote` or names.
  - `exa.ai sources link to exa.ai`, and Mine has no link.
  - `itemBySlug("weighted")?.name === "Weighted"`, and `itemBySlug("nope") === undefined`.
  - `kindLabel`: Geist → "Sans serif", EB Garamond → "Serif", any button → "Button".
- [ ] **Step 2: Write the failing tests** in `tests/unit/library-navigation.test.ts`:
  - `stepIndex(0, -1, 10) === 9`, `stepIndex(9, 1, 10) === 0`, `stepIndex(3, 1, 10) === 4`.
  - `positionLabel(2, 10) === "3 of 10"`.
- [ ] **Step 3: Run** `npx vitest run tests/unit/library-catalogue.test.ts tests/unit/library-navigation.test.ts`. Expected: FAIL (modules missing).
- [ ] **Step 4: Implement** the types, the helpers and `content/library.ts`. Add the coverage includes.
- [ ] **Step 5: Run** the same command. Expected: PASS. Then `npx tsc --noEmit` is clean.
- [ ] **Step 6: Commit** with `feat: add the library catalogue and helpers`. In the report, list every font's weights and link, so they can go in the PR.

---

### Task 2: Specimen fonts

**Files:**
- Create: `lib/library/fonts.ts`, `app/library/fonts.css` (only if Fontshare CSS or `@font-face` rules are needed), and `assets/fonts/library/` plus licence files (only if self-hosting is allowed)
- Test: `tests/unit/library-fonts.test.ts`

**Interfaces:**
- Consumes: `FONTS` from Task 1.
- Produces: `fontFamily(slug: string): string` in `lib/library/fonts.ts`. It returns a CSS `font-family` value for every font slug, and throws for an unknown slug.
  - Helvetica returns exactly `'"Helvetica Neue", Helvetica, Arial, sans-serif'`.
  - Next/font fonts return their `style.fontFamily`.

**Rules:**
- **Imports:** only Library code imports this module, so nothing loads on the home or writing pages.
- **Google families** (Geist, Inter, Averia Serif Libre, Newsreader, EB Garamond, Fraunces): use `next/font/google`.
  - Set `display: "swap"` and `preload: false`, and declare all the weights the catalogue lists. Browsers only download a face when it's used, so the tile loads one weight and the sheet loads the rest.
  - If `Geist` isn't exported in this Next version, use the `geist` package's `GeistSans`.
- **Fontshare** (Satoshi, Switzer, General Sans): read the ITF Free Font License text.
  - If it allows the font files in a public repository, self-host the woff2 files with the licence beside them, through `next/font/local`.
  - If not, load Fontshare's stylesheet (`https://api.fontshare.com/v2/css?f[]=...&display=swap`) from the Library layout only.
  - Write which choice you made, and the licence sentence that decided it, in the report.
- **Helvetica:** never shipped.

- [ ] **Step 1: Write the failing test** `tests/unit/library-fonts.test.ts`. Mock `next/font/google` and `next/font/local` to return `{ style: { fontFamily: "<name>" }, variable: "" }`. Assert:
  - `fontFamily` returns a non-empty string for every slug in `FONTS`;
  - Helvetica returns the exact stack above;
  - an unknown slug throws.
- [ ] **Step 2: Run** `npx vitest run tests/unit/library-fonts.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `lib/library/fonts.ts`.
- [ ] **Step 4: Run** the test (PASS), then `npx tsc --noEmit` and `npx next build`. Expected: both succeed.
- [ ] **Step 5: Commit** with `feat: load the library specimen fonts`.

---

### Task 3: Exhibit buttons

**Files:**
- Create: `components/library/exhibits.tsx` and `app/library/exhibits.css`
- Test: `tests/unit/library-exhibits.test.tsx`

**Interfaces:**
- Consumes: `BUTTONS` from Task 1.
- Produces, in `components/library/exhibits.tsx`:
  - `type ExhibitState = "live" | "mirror" | "rest" | "hover" | "pressed"`
    - `"mirror"` is for tiles and list rows. The exhibit ignores its own pointer state and follows its nearest ancestor with the `data-exhibit-host` attribute:
      - the host's `:hover` or `:focus-visible` gives the hover look;
      - the host's `:active` gives the pressed look.
    - Do this in CSS, for example `[data-exhibit-host]:hover [data-state="mirror"] .lx-weighted { ... }`, and reuse the same declarations as the forced states, with no JavaScript.
  - `interface ExhibitProps { state?: ExhibitState; scale?: number }`
  - `EXHIBITS: Record<string, (props: ExhibitProps) => JSX.Element>`, keyed by button slug.
  - `Exhibit({ slug, state, scale }: { slug: string } & ExhibitProps): JSX.Element`, which throws for an unknown slug.

**Rules:**
- **Styling:** port each button from the design scripts as real elements styled in `exhibits.css`. Every class is prefixed `lx-`, so nothing can leak into the site's own `.btn`.
- **States:**
  - `state="live"` (the default) uses real `:hover` and `:active`.
  - `rest`, `hover` and `pressed` force that look with `data-state` and ignore the pointer. These are used in the sheet's state row.
- **Behaviour:** exhibits render `<button type="button">` (or the original element type, such as a switch). Clicking does nothing.
- **Mine:** renders the site's real `.btn` markup and classes with the label "Say hello", so it is the actual site button, not a copy.
- **Scale:** `scale` is applied with a CSS `transform: scale()` on a wrapper, so tiles can show exhibits at the tile size and sheets larger.
- **Tone:** exhibits look the same by day and night. Only Mine follows the tone, as the site's button already does.

- [ ] **Step 1: Write the failing test** `tests/unit/library-exhibits.test.tsx`:
  - `every button slug has an exhibit`: `BUTTONS.every(b => b.slug in EXHIBITS)`.
  - `no extra exhibits`: `Object.keys(EXHIBITS).length === 32`.
  - `mirror sets data-state="mirror"`: render `<Exhibit slug="weighted" state="mirror" />` and assert an element with `data-state="mirror"` exists.
  - `forced states set data-state`: render `<Exhibit slug="weighted" state="pressed" />` with `react-dom/client` (or `@testing-library/react` if it is already a dependency), and assert an element with `data-state="pressed"` exists.
  - `unknown slug throws`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/library-exhibits.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** all 32 exhibits and their CSS.
- [ ] **Step 4: Run** the test (PASS) and `npx tsc --noEmit`.
- [ ] **Step 5: Visual check.** Add a temporary page `app/library-exhibits-check/page.tsx` that renders every exhibit in all four states. Screenshot it with Playwright at 1440px and compare against `shots/libpage-day.jpg`, `shots/lib-list.jpg` and `shots/extra-list-day.jpg`. Fix differences, then **delete the temporary page**. Put the screenshot path, under the session scratchpad, in the report.
- [ ] **Step 6: Commit** with `feat: add the library exhibit buttons`.

---

### Task 3b: Playable live exhibits

**Files:**
- Modify: `components/library/exhibits.tsx` and `app/library/exhibits.css`
- Test: `tests/unit/library-exhibits.test.tsx`

**Interfaces:**
- Consumes: `Exhibit` and `ExhibitState` from Task 3.
- Produces: nothing new. Behaviour is internal to `state="live"`.

**Behaviour (live only; every other state stays static or mirrored):**
- **gel-switch:** a `role="switch"` element with `aria-checked`. Click or Space toggles it. The label reads "ON" or "OFF", and the knob slides.
- **segmented:** three real buttons, with Week selected at start. Clicking one moves the raised segment there with a short slide, and sets `aria-pressed` on the selected one.
- **keycaps:**
  - Clicking ⌘ or K shows that key pressed for 150ms.
  - While the exhibit is mounted, a `keydown` listener on `window` presses ⌘ when `event.metaKey` is set or the key is "Meta", and presses K when the key is "k" or "K".
  - It does nothing when the event target is an input, textarea or contenteditable.
  - It never calls `preventDefault`, and it removes its listeners on unmount.
- **aqua:** a gentle pulse at rest (CSS keyframes on the glossy fill, a cycle of about 1.6s), as in the Mac OS X default button. It's off under `prefers-reduced-motion`.
- **traffic-lights:** on hover over the group, × − + glyphs appear inside the red, yellow and green dots.
- **floating-action:** click toggles a 45° rotation, so + becomes ×, with `aria-pressed`.
- **glossy-download:** click plays one small bounce of the arrow, about 400ms.
- **neumorphic** and **liquid-glass:** click toggles the play icon to pause and back, with `aria-pressed`. The label stays the same.
- **Motion:** every animation is disabled under `prefers-reduced-motion: reduce`.
- **Code organization:** keep each stateful exhibit a small component, and split `exhibits.tsx` into `components/library/exhibits/` files if it would pass about 400 lines.

- [ ] **Step 1: Write the failing tests:**
  - gel switch: a click flips `aria-checked` from "true" to "false" and the text from ON to OFF;
  - segmented: clicking "Day" sets `aria-pressed="true"` on Day and false on Week;
  - keycaps: dispatching `keydown` with key "k" on window adds the pressed marker to K. An event whose target is an `<input>` doesn't. After unmount, a keydown doesn't throw;
  - floating action: a click toggles `aria-pressed`;
  - neumorphic: a click toggles `aria-pressed`;
  - `state="pressed"` versions of these render no button or switch.
- [ ] **Step 2: Run** `npx vitest run tests/unit/library-exhibits.test.tsx`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the full unit suite and `npx tsc --noEmit`. Expected: all pass.
- [ ] **Step 5: Visual check** with a temporary page in Playwright: toggle each one and screenshot it. Delete the page afterwards.
- [ ] **Step 6: Commit** with `feat: make the live library buttons playable`.

---

### Task 4: Top bar, shell and footer

**Files:**
- Modify:
  - `components/writing/TopBar.tsx`: `current?: "Writing" | "Library"`, and a Library link between Writing and Quiet.
  - `components/noise/NoiseView.tsx`: a Library link between Writing and Quiet.
  - `components/writing/Footer.tsx`: add `{ name: "Library", href: "/library" }` after Writing.
  - `components/writing/WritingShell.tsx`: extract the tone wrapper.
- Create: `components/ToneShell.tsx`
- Test: `tests/unit/top-bar.test.tsx`

**Interfaces:**
- Produces: `ToneShell({ className, current, children }: { className: "writing" | "library"; current?: "Writing" | "Library"; children: ReactNode })`.
  - It renders `SkyProvider`, `SkyCanvas`, a `<div className={className} data-tone={tone}>`, `TopBar`, the children and `Footer`.
  - The tone logic is the same as today's `Tone`.
  - `WritingShell` becomes a thin wrapper with `className="writing"`, so the writing pages don't change.
- **Tone styles:** the Library's CSS keys day and night on `.library[data-tone="day"|"night"]` and `:root.day .library:not([data-tone])`, mirroring `app/writing/writing.css` lines 24 to 25.

- [ ] **Step 1: Write the failing test** `tests/unit/top-bar.test.tsx`:
  - `TopBar` renders links named Writing, Library and Quiet, in that order.
  - `current="Library"` puts `aria-current="page"` on Library only.
- [ ] **Step 2: Run** `npx vitest run tests/unit/top-bar.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** the changes.
- [ ] **Step 4: Run** the whole unit suite, `npx vitest run` (all pass), then `npx tsc --noEmit` and `npx playwright test tests/e2e/writing.spec.ts tests/e2e/site.spec.ts`. Writing and home must still pass; update only assertions that count nav buttons.
- [ ] **Step 5: Commit** with `feat: add library to the top bar and footer`.

---

### Task 5: Library page, grid and list

**Files:**
- Create:
  - `app/library/page.tsx` and `app/library/[slug]/page.tsx`
  - `app/library/library.css` (page, tiles, list, filters, day and night)
  - `components/library/LibraryView.tsx` (client)
  - `components/library/Tile.tsx`, `components/library/ListRow.tsx`, `components/library/Controls.tsx`
  - `lib/library/view-pref.ts`
- Test: `tests/unit/library-view-pref.test.ts`

**Interfaces:**
- Consumes:
  - From Task 1: `sectionsFor`, `itemsFor`, `itemBySlug`, `allItems`, `kindLabel`.
  - From Task 2: `fontFamily`.
  - From Task 3: `Exhibit`.
  - From Task 4: `ToneShell`.
- Produces:
  - `LibraryView({ initialSlug }: { initialSlug?: string })`. It owns the `filter`, `view` and `openSlug` state; Task 6 adds the sheet inside it.
  - In `lib/library/view-pref.ts`:
    - `type LibraryViewMode = "grid" | "list"`
    - `readView(storage: Pick<Storage, "getItem"> | null): LibraryViewMode`, which defaults to "grid";
    - `writeView(storage: Pick<Storage, "setItem"> | null, view: LibraryViewMode): void`.
    - The storage key is `"1tx-library-view"`, and both functions swallow storage errors.
  - `app/library/[slug]/page.tsx` exports:
    - `generateStaticParams()` over `allItems()`;
    - `dynamicParams = false`;
    - `notFound()` for unknown slugs.
  - Both pages render `<ToneShell className="library" current="Library"><LibraryView initialSlug={...} /></ToneShell>`.

**Copy (exact):**
- The title is "Library".
- The subtitle is "Things I like and keep coming back to."
- The filters are "All", "Type" and "Buttons".
- The view switch has accessible names "Grid" and "List".

**Layout:**
- Match `shots/libpage-day.jpg`, `shots/libpage-night.jpg`, `shots/libphone-3200.jpg`, `shots/libphone-3750.jpg`, `shots/extra-list-day.jpg` and `shots/extra-list-night.jpg`.
- Section headings are the title, with the count in grey beside it.
- Tiles show the specimen, with the name bottom left and `kindLabel` bottom right.
- Five tiles per row at 1440px, two at 390px.
- **Tile states** follow `shots/extra-states.jpg`: hover lifts 4px with a deeper shadow and a shimmer border; pressed scales to 0.97.
- **Each tile is one `<button>`.** Its accessible name is the item name, and it opens the sheet; until Task 6 that only sets `openSlug`. The specimen inside is `aria-hidden` and `inert`.
- **Tiles and list rows mirror their button.** They carry `data-exhibit-host` and render button exhibits with `state="mirror"`, so hovering or focusing the tile shows the button's hover look and pressing the tile shows its pressed look.
- **Font tiles** show "Aa" in `fontFamily(slug)`. **Button tiles** show the exhibit, scaled to fit.
- **List rows** follow `extra-list-day.jpg`. Font rows show the name in the font, then the pangram "Sphinx of black quartz, judge my vow."; the right column holds the category, `by` and the note. Button rows show the exhibit on a stage, then the name, source and note.

- [ ] **Step 1: Write the failing test** `tests/unit/library-view-pref.test.ts`:
  - `readView(null) === "grid"`;
  - a stored `"list"` reads back as list;
  - a garbage value reads as grid;
  - a `getItem` that throws reads as grid;
  - `writeView` with a throwing `setItem` doesn't throw.
- [ ] **Step 2: Run** the test. Expected: FAIL.
- [ ] **Step 3: Implement** the page, components and CSS.
- [ ] **Step 4: Run** `npx vitest run`, `npx tsc --noEmit` and `npx next build`. All succeed, and `/library/weighted` and the other item pages appear as static in the build output.
- [ ] **Step 5: Visual check.** Screenshot `/library` with Playwright at 1440px by day and by night (force night by setting `data-tone="night"` on `.library` in the test), and at 390px. Compare with the shots and fix differences. Put the paths in the report.
- [ ] **Step 6: Commit** with `feat: add the library page with grid and list views`.

---

### Task 6: The open sheet

**Files:**
- Create:
  - `components/library/Sheet.tsx`: overlay, grow animation, arrows, keys, swipe, focus trap, history.
  - `components/library/FontSheet.tsx` and `components/library/ButtonSheet.tsx`.
  - `components/library/ShareMenu.tsx`.
  - `lib/library/history.ts`.
  - Styles in `app/library/sheet.css`.
- Modify: `components/library/LibraryView.tsx`, to mount the sheet.
- Test: `tests/unit/library-history.test.ts`, `tests/unit/library-share-menu.test.tsx`

**Interfaces:**
- Consumes:
  - From Task 1: `itemsFor`, `stepIndex`, `positionLabel`, `itemBySlug`.
  - From Task 2: `fontFamily`.
  - From Task 3: `Exhibit`.
- Produces, in `lib/library/history.ts` (pure, testable):
  - `itemPath(slug: string): string`, returning `/library/<slug>`.
  - `slugFromPath(pathname: string): string | null`. It returns the slug for `/library/<known slug>`, and null for `/library` or an unknown slug.
  - `LIBRARY_PATH = "/library"`.
- Produces `Sheet({ items, index, onStep, onClose })`, where `items` is the current filter's list and `index` the open item.

**Behaviour:**
- **Opening** sets `openSlug` and calls `history.pushState({ library: slug }, "", itemPath(slug))`.
- **Stepping** calls `history.replaceState` with the new path.
- **Closing:**
  - If the entry was pushed by this page, call `history.back()`.
  - If the page was loaded directly at `/library/<slug>`, call `history.replaceState(..., LIBRARY_PATH)`.
- **`popstate`:** read `slugFromPath(location.pathname)`, then set `openSlug` to that slug, or close.
- **Never** call Next's router for these changes.
- **Animation:** the tile grows into the sheet in about 0.3s with framer-motion `layoutId`, keyed by slug, and the page dims behind. With `prefers-reduced-motion`, it fades instead.
- **Keys:** Left and Right step, Escape closes. Escape closes the share menu first if it is open.
- **Swipe:** a horizontal swipe of more than 50px steps.
- **Focus:** stays trapped in the sheet and returns to the item's tile on close.
- **Position label:** `positionLabel(index, items.length)` in small grey sentence case next to the close button. There is no label above the title.

**Contents:**
- **FontSheet** (`shots/lib-font-open.jpg`, `shots/extra-font-night.jpg`):
  - Left panel: "Aa", the pangram "Sphinx of black quartz, judge my vow.", and "ABCDEFGHIJKLM nopqrstuvwxyz 0123456789 &?!".
  - Right panel:
    - the name;
    - `${category}, by ${by}` in grey;
    - the note;
    - a divider;
    - the weight ladder: the name in each weight, with `${weight.name} ${weight.value}` on the right, in the UI font and not mono;
    - `systemNote` in grey when present;
    - a "Get <name>" link styled `.btn` with an outward arrow icon, `target="_blank" rel="noopener"`.
- **ButtonSheet** (`shots/lib-button-open.jpg`, `shots/extra-button-night.jpg`):
  - Left panel: the live exhibit large, and a row of `rest`, `hover` and `pressed` exhibits labelled "Rest", "Hover" and "Pressed".
  - Right panel: the name, the source in grey, the note, a divider, the `how` lines, and a `<pre><code>` with `css`.
  - Buttons:
    - "Copy CSS" copies `css` to the clipboard, and its label becomes "Copied" for 2s;
    - Share (the ShareMenu);
    - the `link` as "Visit ..." with an outward arrow, when present.
- **ShareMenu** (`shots/share-share-menu.jpg`):
  - "Copy link", with `1tx.dev/library/<slug>` under it. It copies `https://1tx.dev/library/<slug>` and shows a "Link copied" toast bottom left, stacked above the visitor toast when that's visible.
  - "More options", with "Your device's share sheet" under it. It calls `navigator.share({ title, url })` and is hidden when `navigator.share` isn't a function.
  - Escape and a click outside close the menu.

- [ ] **Step 1: Write the failing test** `tests/unit/library-history.test.ts`:
  - `itemPath("geist") === "/library/geist"`;
  - `slugFromPath("/library/geist") === "geist"`;
  - `slugFromPath("/library") === null`;
  - `slugFromPath("/library/nope") === null`;
  - `slugFromPath("/library/geist/") === "geist"`.
- [ ] **Step 2: Write the failing test** `tests/unit/library-share-menu.test.tsx`:
  - with `navigator.share` undefined, "More options" isn't rendered;
  - "Copy link" calls `navigator.clipboard.writeText("https://1tx.dev/library/weighted")`;
  - **(Review Focus 3)** pressing Escape while the menu is open calls the menu's `onClose`, and the event doesn't propagate to the sheet: assert a parent `keydown` listener is not called.
- [ ] **Step 3: Run** both tests. Expected: FAIL.
- [ ] **Step 4: Implement** the sheet, the contents and the share menu.
- [ ] **Step 5: Run** `npx vitest run`, `npx tsc --noEmit` and `npx next build`. All succeed.
- [ ] **Step 6: Visual check.** Open a font and a button at 1440px by day and night, and at 390px. Compare with the shots. At 390px the panels stack vertically, and the arrows sit at the sheet's bottom edge, not over the content. Put the paths in the report.
- [ ] **Step 7: Commit** with `feat: add the library sheet with sharing`.

---

### Task 7: Visitor counter

**Files:**
- Create:
  - `lib/visitor.ts` (server, pure);
  - `lib/visitor-store.ts` (client storage);
  - `app/api/visitor/route.ts`;
  - `components/VisitorToast.tsx`;
  - `app/visitor.css`, or rules added to `app/globals.css` next to `.btn`.
- Modify:
  - `lib/ratelimit.ts`: widen `hashKey`'s kind to `"ip" | "email" | "visitor"`, so the counter's limit can't share a key with the email gate.
  - `components/noise/NoiseView.tsx`: render `<VisitorToast />`. It sits inside the noise layer, so Quiet and the posters hide it.
  - `components/library/LibraryView.tsx`: render `<VisitorToast />`.
- Test: `tests/unit/visitor.test.ts`, `tests/unit/visitor-store.test.ts`, `tests/unit/visitor-toast.test.tsx`, `tests/unit/visitor-route.test.ts`

**Interfaces:**
- Consumes: `allow`, `hashKey` and `getRateLimitRedis` from `lib/ratelimit.ts`, and `guardSubscribeRequest` from `lib/subscribe-guard.ts`.
- Produces, in `lib/visitor.ts`:
  - `VISITOR_KEY = "visitor:count"`;
  - `VISITOR_LIMIT = 5`;
  - `VISITOR_WINDOW_SECONDS = 3600`;
  - `handleVisitor(ip: string, deps: { redis: Pick<Redis, "incr" | "expire" | "ttl"> }): Promise<{ status: number; body: { success: boolean; data?: { number: number }; error?: "rate_limited" | "server" } }>`.
    - Over the limit: `{ status: 429, body: { success: false, error: "rate_limited" } }`.
    - Any Redis error: `{ status: 503, body: { success: false, error: "server" } }`.
    - Success: 200 with `data.number` from `redis.incr(VISITOR_KEY)`.
    - It never logs the IP.
  - `formatVisitor(n: number): string`, returning `"#" + n.toLocaleString("en-US")` (so 1284 becomes "#1,284").
- Produces, in `lib/visitor-store.ts`:
  - `readVisitor(storage: Pick<Storage, "getItem"> | null): number | null`. A positive integer only; otherwise null.
  - `writeVisitor(storage: Pick<Storage, "setItem"> | null, n: number): void`.
  - `isClosed(session: Pick<Storage, "getItem"> | null): boolean` and `markClosed(session: Pick<Storage, "setItem"> | null): void`.
  - The keys are `"1tx-visitor"` and `"1tx-visitor-closed"`. Every function swallows storage errors.
- **The route** `POST /api/visitor`:
  - Run `guardSubscribeRequest(request.headers, new URL(SITE_URL).origin, production)`. On rejection, return `{ success: false, error: "server" }` with the guard's status.
  - Take the IP from `x-forwarded-for`, as the subscribe route does.
  - Use the same lazy-Redis pattern, and return `handleVisitor`'s result.
  - `export const dynamic = "force-dynamic"`.
- **The toast**, `VisitorToast()`:
  - **On mount:** get `localStorage` and `sessionStorage` with try/catch.
  - **Local storage unavailable** (null, or its access throws): render nothing and never fetch.
  - **Closed this session:** render nothing.
  - **Stored number:** show "Welcome back, visitor" plus the number.
  - **No stored number:** POST `/api/visitor` once, with `content-type: application/json` and body `{}`. Guard it with a ref so a double effect never sends twice. On success, `writeVisitor` and show "You're visitor" plus the number. On any failure, render nothing and store nothing.
  - **Look:** bottom left, in the site's button tones by day and night, with a green live dot, the number in semibold `tabular-nums`, and a close button labelled "Close". Closing calls `markClosed` and hides the toast.
  - **Accessibility:** `role="status"`.

- [ ] **Step 1: Write the failing tests:**
  - `tests/unit/visitor.test.ts`, using a fake redis:
    - the first call returns 200 with `number: 1`, and the next returns 2;
    - the sixth call from one IP within the window returns 429;
    - `incr` throwing returns 503;
    - the rate-limit key starts with `rl:visitor:`;
    - `formatVisitor(1284) === "#1,284"` and `formatVisitor(1) === "#1"`.
  - `tests/unit/visitor-store.test.ts`:
    - read and write round trip;
    - "abc", "0", "-3" and "1.5" read as null;
    - throwing storage is safe for all four functions;
    - null storage is safe.
  - `tests/unit/visitor-route.test.ts`, mocking `@/lib/ratelimit`'s `getRateLimitRedis` with a fake:
    - a POST with JSON content type returns 200 and a number;
    - `text/plain` returns 415;
    - with `NODE_ENV` stubbed to production and a wrong origin, it returns 403.
  - `tests/unit/visitor-toast.test.tsx`:
    - **(Review Focus 1)** with `localStorage` access throwing, `fetch` is never called and nothing renders;
    - **(Review Focus 2)** mounted inside `<StrictMode>`, `fetch` is called exactly once;
    - a stored 42 renders "Welcome back, visitor" and "#42" without fetching;
    - fetch rejecting renders nothing and stores nothing;
    - clicking Close hides it and sets the session flag.
- [ ] **Step 2: Run** `npx vitest run tests/unit/visitor*.test.ts*`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run` (all pass, including `ratelimit.test.ts`), then `npx tsc --noEmit`.
- [ ] **Step 5: Visual check.** Screenshot the home page with the toast by day and night, and at 390px. Compare with `shots/extra-welcome.jpg`.
- [ ] **Step 6: Commit** with `feat: add the visitor counter`.

---

### Task 8: SEO and end-to-end tests

**Files:**
- Modify:
  - `lib/writing/feeds.ts`: `sitemapEntries` gains the Library URLs; `llmsTxt` gains a Library section.
  - `lib/writing/seo.ts`: add `collectionPageJsonLd()`.
  - `app/library/page.tsx` and `app/library/[slug]/page.tsx`: metadata and JSON-LD.
- Create:
  - `public/library/og.jpg`, copied from `docs/writing/design/library/shots/extra-share.jpg` (1200x630);
  - `tests/e2e/library.spec.ts` and `tests/e2e/visitor.spec.ts`.
- Modify: `tests/e2e/contrast.spec.ts`, to add `/library` by day and night.
- Test: `tests/unit/writing-feeds.test.ts`, `tests/unit/writing-seo.test.ts`

**Interfaces:**
- Consumes: `allItems` from Task 1, and `pageMetadata` and `breadcrumbJsonLd` from `lib/writing/seo.ts`.
- **`sitemapEntries(posts)`** also returns `${SITE_URL}/library` and `${SITE_URL}/library/<slug>` for every item.
- **`llmsTxt(posts)`** adds a `## Library` section, between Writing and About. It has one line `- [Library](https://1tx.dev/library): Fonts and buttons I keep coming back to.`, then one line per item: `- [<name>](https://1tx.dev/library/<slug>): <note>`.
- **`collectionPageJsonLd()`** returns `{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Library", url: "https://1tx.dev/library", description: "Fonts and buttons I keep coming back to.", author: { "@id": "https://1tx.dev/#angad" } }`.
- **Metadata:**
  - `/library`: `pageMetadata("/library", "Library · Angad Maniyambath", "Fonts and buttons I keep coming back to.")`.
  - Items: `pageMetadata("/library/<slug>", "<name> · Library · Angad Maniyambath", "<note> <source line>")`.
    - The source line is `${category}, by ${by}.` for fonts and `${source}.` for buttons.
  - Both override `openGraph.images` and `twitter.images` with `/library/og.jpg` (1200x630, alt "Library").
- **JSON-LD:**
  - `/library`: `collectionPageJsonLd()` plus breadcrumbs Home > Library.
  - Items: breadcrumbs Home > Library > `<name>`.

- [ ] **Step 1: Write the failing unit tests:**
  - The sitemap includes `https://1tx.dev/library` and `https://1tx.dev/library/weighted`, and its length is `posts + 3 + 42`. The three are home, writing and about.
  - llms.txt contains `## Library` and `https://1tx.dev/library/geist`.
  - `collectionPageJsonLd().url === "https://1tx.dev/library"`.
- [ ] **Step 2: Write the e2e specs.** In `tests/e2e/library.spec.ts`:
  - Filters: Type shows 10 tiles, Buttons shows 32, All shows 42.
  - List view persists across a reload.
  - Clicking the Geist tile opens the sheet, the URL becomes `/library/geist`, and "1 of 42" is visible under All.
  - ArrowRight changes to Inter, and "2 of 42" is visible.
  - ArrowLeft from the first item wraps to Mine.
  - Escape closes the sheet, the URL returns to `/library`, and focus is on the Geist tile.
  - Loading `/library/aqua` directly shows the Aqua sheet; closing it goes to `/library`.
  - `/library/nope` returns 404.
  - **(Review Focus 4)** Open Geist, step right twice, go back: the sheet is closed and the URL is `/library`. Go forward: the sheet shows the third item.
  - Copy link puts `https://1tx.dev/library/<slug>` on the clipboard. Grant clipboard permissions in the context.
  - The top bar on `/`, `/writing` and `/library` shows Writing, Library and Quiet, and Library has `aria-current` only on `/library`.
  - **(Review Focus 5)** At 390x844: the grid has 2 columns. An open sheet stacks its panels, and its arrow buttons don't overlap the title's bounding box. A swipe (mouse drag of at least 80px) steps to the next item.
- [ ] **Step 3: Write the e2e spec** `tests/e2e/visitor.spec.ts`, routing `/api/visitor` with `page.route`:
  - The first visit shows "You're visitor #7".
  - A reload shows "Welcome back, visitor #7", and the API isn't called again.
  - Close hides it for the session.
  - Entering Quiet mode hides it.
- [ ] **Step 4: Run** the unit tests (FAIL), implement, then run them again (PASS).
- [ ] **Step 5: Run** `npx playwright test`. Expected: all specs pass, the existing ones included.
- [ ] **Step 6: Run** `npx vitest run --coverage` (at least 80%), `npx tsc --noEmit` and `npx next build`.
- [ ] **Step 7: Commit** with `feat: add library seo and end to end tests`.
