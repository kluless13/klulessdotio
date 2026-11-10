# Library and visitor counter: design

Written 2026-11-10. It builds on the Library and counter designs Angad approved in Paper on 2026-11-08 (file "1tx website", Directions page, rows "Library 1/2", "Counter /" and the extras below them). Screenshots of those boards and the scripts that drew them are in `docs/writing/design/library/` (git-ignored, local only). The scripts hold the exact CSS for every button and specimen.

## Why

1tx.dev is a personal site, not a resume. The Library is a shelf of things Angad likes and keeps coming back to: fonts and buttons. It shows taste, which is the thing he sells as a builder of sites and tools, and every item is a page that can be found, linked and shared. The visitor counter is a small, friendly sign that real people come here.

## Goals

- `/library` on the live site, matching the Paper designs by day, by night and on a phone.
- Every item has its own URL, `/library/<slug>`, that opens the page with that item's sheet open, so items can be shared and indexed.
- A Library button in the top bar on every page that has one.
- The "You're visitor #N" counter on the home page and the Library.

## Non-goals (this build)

- The "How I make posters" tab. Parked.
- The 404 page ("Lost at sea.") and the storm sky board.
- "Save as image" in the share menu, and per-item share images. One share image serves the whole Library for now.
- Glass app icons, Interfaces and Styles cards. Removed in Paper on 2026-11-08.

## Anti-goals

- Anything that reads as a design system dump or a component library for sale. It's a shelf, not a product.
- Motion that bounces or shows off. Tiles are "small, quick and quiet".
- Eyebrows, all-caps labels, or mono text anywhere except a code block.

## Global rules (Angad's, apply everywhere)

- No eyebrows, no all caps, no mono font text, no unnecessary lines.
- No em dashes in site copy.
- No email address on the site.
- The site's own buttons are rounded rectangles with gradients and depth, never pills. Exhibits in the Library keep their original shapes (Aqua is a pill because Aqua was a pill).
- The repo is public. Nothing private goes in it.

## Routes

| Route | What it shows |
|---|---|
| `/library` | The Library, nothing open |
| `/library/<slug>` | The same page, server-rendered with that item's sheet open |
| `POST /api/visitor` | Issues the next visitor number |

Both page routes are static (`generateStaticParams` over the catalogue). An unknown slug is a 404.

Slugs are the item name in lowercase with words joined by hyphens: `geist`, `eb-garamond`, `weighted-light`, `aqua-graphite`, `shadcn-ui`, `mine`. They must be unique across fonts and buttons; a test enforces it.

## Top bar

- Home (Noise view), `/writing` pages and `/library` all show: Writing, Library, Quiet, in that order.
- The current section's button gets `aria-current="page"` and the pressed look (already used for Writing).
- Quiet keeps its current behaviour: it remembers the choice and loads the home page.

## The Library page

**Header:** "Library" as the page title, and under it "Things I like and keep coming back to." in grey. On the right, a segmented control (All, Type, Buttons) and a grid/list switch, both in the soft segmented style from the designs.

**Sections:** Type first, then one section per button era in this order: Weighted, Retro desktops, Web 2.0 and early iPhone, Flat and Material, Modern, Soft and glass, Mine. Each heading is the section name in sentence case with its count beside it in grey ("Type 10").

**Filter:** All shows every section. Type shows only Type. Buttons shows every button era. The filter is page state, not in the URL.

**Grid view:** square frosted tiles, five across on desktop, fewer as the window narrows, two across on a phone. A tile has the specimen in the middle (a big "Aa" in the font, or the button itself), the name bottom left, and the kind bottom right in grey ("Sans serif", "Serif", "Button"). No "stand-in" badges.

**List view:** the catalogue reading from the designs (`extra-list-day.jpg`, `extra-list-night.jpg`). Fonts show the name large in the font, the pangram under it, and on the right the kind, the designer and the note. Buttons show the specimen on a small stage on the left and the name, source and note on the right.

**View choice:** remembered in `localStorage` per visitor. Wrap every storage access in try/catch; the page must work without storage.

**Tile states** (`extra-states.jpg`): rest is frosted and flat. Hover lifts 4px, deepens the shadow and gives the border the same shimmer as Angad's button. Pressed sinks to 97% and tucks the shadow in. Previews inside tiles are not interactive: the whole tile is one button, and the specimen inside is `aria-hidden` and can't take focus. The button inside a tile mirrors the tile, which Angad asked for on 2026-11-10:
- hovering or keyboard-focusing the tile shows the exhibit's hover look;
- pressing the tile shows its pressed look.

The same applies to list rows.

**Day and night:** the page sits on the real sky (`SkyProvider` and `SkyCanvas`) and takes its tone from the sky model the same way the writing pages do. Frosted tiles by day, dark glass tiles at night (`libpage-night.jpg`). Text must pass WCAG AA contrast on both.

## The open sheet

**Opening:** clicking a tile grows it into the sheet while the page dims, about 0.3s. Closing shrinks it back into its tile. With `prefers-reduced-motion`, it fades instead.

**Moving:** arrows either side step through the items in the current filter, in page order, wrapping at the ends. Left and right arrow keys and a horizontal swipe do the same. Escape and the close button close it. Focus stays inside the sheet while it's open and returns to the tile on close.

**URL:** opening pushes `/library/<slug>` onto history; stepping replaces it; closing goes back to `/library`. The browser back button closes the sheet. Loading `/library/<slug>` directly shows the sheet open over the page, and closing it goes to `/library`.

**How (Claude's call):** the sheet is a client overlay on a page that stays mounted. It updates the URL with the History API, not with Next route navigation, so the tiles keep their positions and the grow-from-tile animation has an origin. Both routes render the same page component on the server, and `/library/<slug>` just starts with that item open. Handle `popstate` so the back and forward buttons open and close the sheet correctly alongside Next's router.

**Position:** "3 of 10" in small grey sentence case near the close button. This replaces the all-caps "TYPE 1 OF 10" label from Paper, which broke the no-eyebrows rule.

**Font sheet** (`lib-font-open.jpg`, `extra-font-night.jpg`):
- Left panel: a big "Aa" in the font, the pangram "Sphinx of black quartz, judge my vow." and the line "ABCDEFGHIJKLM nopqrstuvwxyz 0123456789 &?!".
- Right: the name large, "Sans serif, by Vercel" in grey, the note, a divider, then a weight ladder: the font's name set in each weight it has, with the weight's name and number on the right ("Thin 100") in the normal UI font, not mono.
- A "Get Geist" button with an outward arrow, linking to the font's official page, in the site's button style.

**Button sheet** (`lib-button-open.jpg`, `extra-button-night.jpg`):
- Left panel: the button large and live (it really hovers and presses), with a row underneath showing it held in Rest, Hover and Pressed.
- Right: the name, the source in grey ("Seen on exa.ai"), the note, a divider, two or three short plain lines on how it's made, and a code block with the key CSS (mono is fine here, it's code).
- Buttons: Copy CSS, Share, and "Visit <site>" when the source is a website.
- The live preview buttons do nothing when clicked.

**Share** (`share-share-menu.jpg`): Share opens a small menu with "Copy link" (shows `1tx.dev/library/<slug>`) and "More options" (the device's share sheet via `navigator.share`, hidden where it isn't supported). Copying shows a "Link copied" toast bottom left. "Save as image" is out of this build.

## Content

All items live in one typed file, `content/library.ts`, so Angad can edit notes in one place. The notes are Angad's. On 2026-11-10 he confirmed they're final ("Fine as they are"), even though a comment in `lib_specimens.py.txt` still calls them drafts. Publish them as they are in `docs/writing/design/library/scripts/lib_catalog.py.txt` and `lib_specimens.py.txt`, except that the Paper-only remarks in brackets ("(Shown in Geist here: ...)") are removed.

**Fonts (10):** Geist, Inter, Helvetica, Satoshi, Switzer, General Sans, Averia Serif Libre, Newsreader, EB Garamond, Fraunces. Each has a name, kind, designer or foundry, note, the weights it really has, and a link to its official page.
- The design scripts only show a fixed seven-step ladder (Thin 100 to Black 900) and have no links.
- The builder takes each font's real weights from its files, and links to its official page: the foundry's site or its Google Fonts page.
- Both lists go in the PR description for Angad to check.

**Buttons (32):** the 31 in `BUTTONS` in the catalogue script, in its order and groups, plus Mine. Each has a name, source, note, era, a "how it's made" list, the CSS to copy, and an optional site link.

The "how it's made" lines are new copy. They're factual descriptions of the CSS, written plainly like the Weighted example ("A darker lip under the face gives it weight."). They aren't opinion, so they aren't in Angad's voice and don't need an interview, but he sees them in the PR.

**Mine** is Angad's real site button: navy by day, white by night, a 10px rounded rectangle, with the shimmer border on hover. The Library uses the site's actual button styles for it, not a copy.

## Fonts

- Each font loads only on the Library routes, never on the home or writing pages.
- Tiles need one weight each. The full set of weights loads when that font's sheet opens.
- Use `font-display: swap`.
- Google Fonts families (Geist, Inter, Averia Serif Libre, Newsreader, EB Garamond, Fraunces) are self-hosted the way the repo already does it.
- Satoshi, Switzer and General Sans come from Fontshare. Self-host them only if their licence allows the files to sit in a public repo; otherwise load them from Fontshare's own CSS. The builder checks the licence and notes the answer in the PR.
- Helvetica is never shipped. It uses the visitor's own copy (`"Helvetica Neue", Helvetica, Arial, sans-serif`). Its sheet adds one grey line: "Shown in your device's Helvetica. Without it, you'll see Arial."

## Visitor counter

Designs: `extra-welcome.jpg`, plus option C in the Paper "Counter /" row.

**What it says:**
- First visit in a browser: "You're visitor #1,284".
- Returning in the same browser: "Welcome back, visitor #1,284".
- Each has a small green live dot and a close button.

**Where:** bottom left, in Angad's button style (the day and night tones), on the home page in Noise mode and on the Library. It's hidden in Quiet mode, while the posters are open, and on the writing pages. Open by default. Closing it hides it until the next visit, which means a new browser session (`sessionStorage`).

**How the number works:**
- On the first visit, the browser calls `POST /api/visitor`. The server increments one Upstash counter and returns the new number. The browser stores it in `localStorage` and never asks again.
- Returning visitors read their number from `localStorage`; no request.
- Numbering starts at 1 on launch. No made-up starting number.
- Only browsers that run JavaScript are counted, so most bots aren't.

**Privacy:** no cookies. Nothing personal is stored. The only thing on the server is the running total, plus a short-lived, hashed rate-limit key per IP.

**Guarding the endpoint:** reuse the existing pieces from the email gate.
- `lib/subscribe-guard.ts`: in production, an exact `Origin` match with `https://1tx.dev`.
- `lib/ratelimit.ts`: five numbers per IP per hour, with the TTL healing.
- If Upstash fails or the limit is hit, the API returns an error, the toast doesn't show, and nothing is stored, so the next visit tries again. Visitors never see an error.

## SEO

- Metadata:
  - `/library`: title "Library · Angad Maniyambath", description "Fonts and buttons I keep coming back to.", canonical URL.
  - Each item: title "<Name> · Library · Angad Maniyambath", with its note and source as the description and its own canonical URL.
- Share image: `/library` and every item use one share image, the 1200x630 Library card from Paper (`extra-share.jpg`), saved in `public/library/`.
- Sitemap: `/library` and every item URL.
- llms.txt: a short Library section listing the items with their URLs.
- JSON-LD: `CollectionPage` and `BreadcrumbList` on `/library`, with a `BreadcrumbList` on each item page too.

## Testing

- Unit tests:
  - Catalogue integrity: 10 fonts and 32 buttons, unique slugs, groups in the stated order, every item has a note, and no notes contain "Shown in" except Helvetica's sheet line.
  - Slug lookup, and the 404 for unknown slugs.
  - The visitor API: origin guard, rate limit, Upstash failure, and the number format.
- E2E (Playwright):
  - Filters and the grid/list switch.
  - Opening a tile; stepping with arrows, keys and wrap-around; closing with Escape, the button and the back button.
  - Loading `/library/<slug>` directly.
  - Copy link.
  - The phone layout at 390px.
  - Night tone contrast.
  - Counter first and returning visits, and closing it.
  - The Library button in the top bar on home, writing and library.
- Visual check against the Paper screenshots by day, by night and on a phone before review.

## Left to the builder

- Component and file layout, following the repo's patterns (`components/library/`, `app/library/`, `lib/library/`).
- Class name prefixes so the exhibit button styles can't leak into the site.
- How the grow-from-tile animation is done (framer-motion is already in the repo).
- Exact tile sizes and breakpoints, matched to the screenshots.
