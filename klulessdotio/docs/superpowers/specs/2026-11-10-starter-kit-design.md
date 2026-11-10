# Starter kit: design

Written 2026-11-10. It builds on the starter kit designs Angad approved in Paper ("1tx website" file, Directions page, the "Kit / …" boards from y 36651).
- Screenshots and email header files are in `docs/writing/design/kit/` (git-ignored).
- The board builder scripts are `kit_*.py` in the session scratchpad. They hold exact sizes, colours and the highlighter and margin-note drawing code.
- The kit's text is in `docs/writing/kit/draft.md` (git-ignored). The interview behind it is in `docs/writing/kit/interview.md`.

## Why

1tx.dev now gets search traffic, but nothing turns a visitor into someone Angad can reach again. The starter kit is the first free thing worth an email.

It's for non-technical people (business owners, accountants, teachers, scientists) who only ever chat with Claude or ChatGPT. It moves them to the work mode, gets them connecting tools and teaches them to brief an agent like a capable colleague.

It's the top of Angad's funnel:
- the list for the field guide posts;
- a free "show me what you built" call;
- paid help for business owners who hit a wall.

## Goals

- **`/kit`:** a public, indexed signup page that explains the kit and collects an email.
- **The email:** a custom HTML email from Angad via Resend, with a personal link to the kit that works for good.
- **The kit page:** a private page at that link, with the full guide by day, by night and on a phone, as designed.
- **Private text:** the kit's text is never in the public GitHub repo.
- **The list:** every signup lands in Resend, marked as a starter kit signup.
- **Hardening:** the deferred email-gate hardening is done before launch.

## Non-goals

- A PDF or download version.
- Paid kits or checkout. Cal.com paid bookings come later, via PayPal.
- Newsletters or broadcasts. The parked email headers are for those later.
- Changing the existing post download gate, beyond the shared hardening.

## Anti-goals

- **Content leaking into the repo.** Anyone could read it on GitHub, which makes the email gate pointless.
- **Links that expire or break.** People bookmark the kit and come back while they learn.
- **Annotations that look stamped or digital.** The highlighter and margin notes must look hand-made.

## Global rules (Angad's, apply everywhere)

- **No eyebrows, no all caps.** No mono text, except inside the copyable prompt block. No unnecessary lines.
- **No em dashes** in any copy, including the email.
- **No email address shown** on any page. The email itself may say "reply to this email".
- **Buttons:** the site's `.btn` (rounded rectangles, never pills).
- **The repo is public.** Nothing from `docs/writing/` gets committed. The kit's text never goes in git.
- **Contrast:** text passes WCAG AA by day and by night.

## Routes

| Route | Indexed | What it does |
|---|---|---|
| `/kit` | yes | Signup page: title, pitch, what's inside, the email form |
| `/kit/[token]` | no | The kit itself, for a valid token. An invalid token shows a friendly "this link doesn't work" with the signup form |
| `POST /api/subscribe` | no | Existing endpoint, extended to accept the kit |
| `GET /api/unsubscribe/[token]` and `POST` | no | One-click unsubscribe from the list |

**`/kit/[token]` hardening:**
- headers `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex`;
- metadata `robots: noindex, nofollow`;
- not in the sitemap.

## The kit link

- The token is an HMAC-signed value, using the existing `DOWNLOAD_SIGNING_SECRET` and the same signing format as `lib/downloads/token.ts`.
- Payload: `{ kind: "kit", kit: "starter-kit", subject: <first 16 hex chars of sha256(lowercased email)> }`.
- No expiry, so the link works for good.
- The email itself is never in the kit token.
- The verifier rejects any token whose `kind` isn't `"kit"`, so a download token can't open the kit and a kit token can't download.
- **Revoking every link** means rotating a secret. To make that possible without breaking downloads, kit tokens can use their own secret, `KIT_SIGNING_SECRET`, and fall back to `DOWNLOAD_SIGNING_SECRET` when it isn't set.

## Where the kit's text lives

- The text is stored in the existing Upstash Redis under the key `kit:starter-kit:content`, as one Markdown string. No new infrastructure.
- **Authoring:**
  - Angad edits `docs/writing/kit/kit.md`, which is git-ignored. It's the final version of `draft.md`, without the bracketed notes.
  - `npm run kit:upload` validates it (it fails on em dashes, on leftover `[` notes, and on unknown directives) and writes it to Redis.
  - The script reads Redis credentials from the environment and never prints them.
- **Rendering:**
  - The kit page reads the text on the server for each request (dynamic, not cached across tokens), then parses and renders it.
  - If Redis is unreachable, the page shows a "Something went wrong on my end, try again in a minute" state, never a broken page.
- **Local development and e2e:** when `KIT_CONTENT_FILE` is set, the page reads that file instead. Tests use the committed fixture `tests/fixtures/kit/kit.md`, which holds placeholder text, not the real kit.

## Authoring format

The kit is Markdown with a small set of directives (`remark-directive`), so the whole kit stays editable in one file. Each directive maps to a designed component:

| Markdown | Renders as |
|---|---|
| `==text==` | Highlighter stroke (see Annotations) |
| `:note[note text]{on="words"}` placed at the end of a paragraph | Margin note tied to `words` in that paragraph |
| `:::steps` with a list | The five-steps overview box |
| `:::paths` containing `::path[Claude]{pick}` and `::path[ChatGPT]` sections | The two setup boxes, stacked in the text column, with a "My pick" tag on Claude |
| `:::timeline{find=10 decide=2 fix=5}` | The 17-minute bar |
| `:::before-after` | The Before and After pair |
| `:::prompt` with a fenced block | The full-width copyable prompt block with the "Copy prompt" button |
| `:::job{title="Reconciling" who="…"}` | A step 5 job card (full width) |
| `:::ending` | The ending: the timeline list, the "Show me" card with the "Book a free call" button, the "Keep going" card, and the business paragraph |

- Step headings (`## 1 …`) render with the numbered badge.
- Links work as normal.
- Unknown directives fail the upload script and the unit tests.

## Page design (from the Paper boards)

**Signup page `/kit`:** see `kit-signup-day.jpg` and `kit-signup-phone.jpg`.
- Title: "Talk to it. It does the work."
- A one-line subtitle: "A free starter kit for getting AI agents to do real work in your tools. No code."
- The byline: portrait plus "Head of AI at Truflation".
- Two pitch paragraphs, with one highlight.
- "What's inside": the five steps, the starting prompt card and the five jobs card.
- The "Unlock it for free" form.

**The form:**
- **Copy:** "Pop in your email and I'll send you the link. You'll also get my occasional posts on working with agents. One click to unsubscribe, any time."
- **Field:** placeholder "Your email". **Button:** "Send me the kit".
- **Under it:** "The link arrives by email, usually within a minute."
- **Success:** "Check your inbox. Your link works for good."
- **Errors:** the existing gate's messages.
- **Consent:** pressing the button is consent, as on the existing gate.

**Kit page:** see `kit-guide-day*.jpg`, `kit-guide-night*.jpg` and `kit-guide-phone*.jpg`.
- A reading sheet about 1040px wide, with a 632px text column and an empty right margin for notes.
- The five-steps box, the setup boxes and before and after align exactly with the text column.
- The prompt block and the job cards are full sheet width.
- The page follows the sky's day and night tone the same way as `/writing` and `/library`, using `ToneShell` with a new `className: "kit"`.
- The top bar shows Writing, Library and Quiet, with none pressed.

## Annotations

**Highlighter (`==text==`):**
- An imperfect stroke behind the words, like a highlighter on paper.
- Translucent, a little wobbly, with ragged ends and a faint darker streak along the bottom. It differs per line and per highlight, so it never looks stamped.
- Warm yellow `#FFD449` at about 58% by day, and sky blue `#6AAEFF` at about 34% by night.
- **Builder's call, two options:**
  - render each highlight as an inline element with a generated SVG background, `box-decoration-break: clone`, and the seed taken from the text so the same highlight always looks the same;
  - or split the text into per-line spans on the client.
  - Either way, it must look like `kit-annotations.jpg` and must not shift the text.

**Margin note (`:note`):**
- The words named in `on="…"` get a hand-drawn underline.
- The note sits in the right margin, its first line level with those words, in Caveat (blue ballpoint `#2F4FA8` by day, pale blue by night), tilted about 1.5°.
- **No arrows.**
- On a phone, or wherever there's no margin, the note sits under its paragraph instead, without an arrow.
- Caveat loads only on kit routes.

**Accessibility:** highlights use `<mark>`. Notes are real text in the reading order, marked as a note (`aside` with an accessible label), not images. Screen readers read the note after its paragraph.

## The email

**Design:** `kit-email-c.jpg` (Ripple C) plus the pulse border (`kit-email-pulse.jpg`).
- **Card:** a white, rounded card (18px, all four corners) on `#EEF3F9`.
- **Header:** the Ripple C animated GIF, with no name in it. The GIF's first frame is the Outlook fallback.
- **Body:** as designed. It keeps the "reply to this email" line.
- **Signature:** an image ("Angad"), with "Angad" as alt text.
- **Footer:** "You're getting this because you asked for the starter kit at 1tx.dev/kit. Unsubscribe in one click."
- **Pulse border:** a CSS `@keyframes` animation on the card's `box-shadow`, about 3 seconds, ease-in-out, infinite. Apple Mail plays it; other apps show the static glow. Use `prefers-reduced-motion` where clients honour it.

**Sending:**
- Subject: "Your starter kit is here". Preview text: "Five steps to get the AI you already pay for doing real work."
- From `MAIL_FROM` (angad@1tx.dev). Replies reach Angad through the ImprovMX forwarding.
- A plain-text version is included.
- **Hosting:** the header GIF and signature are served from `public/email/` on 1tx.dev, with absolute `https://1tx.dev/email/...` URLs.
- **Format:** inline-styled HTML tables, as in `lib/mail/download-email.ts`. No new email framework.
- **Unsubscribe:**
  - headers `List-Unsubscribe: <https://1tx.dev/api/unsubscribe/<token>>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`;
  - the unsubscribe token is a signed `{ kind: "unsub", email }`, with no expiry;
  - the POST and GET handlers set the Resend contact to `unsubscribed: true`;
  - GET shows a simple confirmation page: "You're unsubscribed. Your kit link still works."
  - **Changed during the build (2026-11-10):** email security scanners open links automatically, so GET now leads to a confirm page with an "Unsubscribe" button, and only POST unsubscribes. Gmail's and Apple Mail's built-in one-click unsubscribe still POSTs directly.

## List and tagging

- Kit signups are added to the main Resend segment (`RESEND_SEGMENT_ID`), as today.
- They're also added to a "Starter kit" segment when `RESEND_KIT_SEGMENT_ID` is set, so Angad can email kit readers separately.
- Creating that segment and setting the env var happens at launch, done by Claude through the Resend MCP with Angad's OK.

## Email gate hardening (deferred items, done here)

- **Timeouts:** every Resend and Upstash call in the subscribe and unsubscribe paths gets a timeout of about 5 seconds. On timeout: no email is sent, and the result is 502 "server", not a hang.
- **Preview origins:** in production, the subscribe Origin check also allows this deployment's own preview URL (`https://${VERCEL_URL}`, and `VERCEL_BRANCH_URL` when set), so signups can be tested on previews. The visitor counter guard stays production-only.
- **Downloads:** the post download route sends `Content-Length` when the upstream gives one, as noted in the launch checklist.
- **Rate limits:** unchanged (5 per IP per hour, 3 per email per day).

## Calls to action at the end of the kit

- **"Show me":** a free 20 minute call, opened as a Cal.com popup for `angad888/show-me` (the event already exists).
  - Uses Cal.com's embed script from `app.cal.com`, loaded only on kit pages, with the popup on click and the site's colours.
  - The button falls back to a normal link to `https://cal.com/angad888/show-me` if the script fails.
- **"Keep going":** they're already on the list.
- **The business paragraph:** paid help, with no link for now.

## SEO

- `/kit`:
  - title "Talk to it. It does the work. · Angad Maniyambath";
  - a 120 to 160 character description;
  - canonical URL, sitemap entry, a line in llms.txt, and a share image (a new 1200x630 card in the kit style, designed in Paper by the builder from the signup board);
  - breadcrumb JSON-LD.
- `/kit/[token]`: noindex, as above.
- Add `/kit` to the footer links, and to the top of `/writing` as a quiet line. The builder proposes the wording, and Angad checks it in the PR.

## Testing

**Unit tests:**
- **Tokens:** sign and verify, kind separation, no expiry, tampering, and the secret fallback.
- **Directive parsing:** each directive, unknown-directive errors, and the em dash check.
- **The upload script's validation.**
- **Subscribe:** the kit path, the second segment, timeouts, and preview origins.
- **Unsubscribe:** the GET and POST handlers.
- **The email:** its HTML (no em dashes, absolute image URLs, the List-Unsubscribe headers) and its text version.

**E2E (Playwright, with `KIT_CONTENT_FILE` pointing at the fixture and the API mocked):**
- signing up on `/kit` shows the success message;
- a valid token renders the kit with highlights and notes, and an invalid one shows the friendly state;
- the margin note sits beside its words on desktop and under the paragraph at 390px;
- Copy prompt copies;
- the Cal button opens the popup, or falls back to the link;
- contrast by day and night on `/kit` and the kit page;
- `/kit/[token]` has noindex.

**Visual check:** compare against the Paper screenshots by day, by night and on a phone before review.

**Launch check:** one real signup with Angad's own email, the email arriving with the animated header, the link opening the kit, replying reaching Angad, and unsubscribe working.

## Claude's calls on the builder check (2026-11-10)

1. **The subscribe request** gets a `kind` field: `"download"` (the default, today's behaviour, unchanged schema) or `"kit"`.
   - The kit branch has its own schema (`{ kind: "kit", kit: "starter-kit", email, consent, company_url }`; no slug) and calls new provider methods: `sendKitEmail({ email, link, unsubscribeLink })` and `addContact({ email, segments })`.
   - `sendKitEmail` passes the List-Unsubscribe headers through Resend's `headers` option.
   - `/kit` posts `kind: "kit"`. The download path and its tests don't change.
2. **Tokens:**
   - Generalise the token module into a shared `sign` and `verify` over a discriminated payload: download `{ downloadId, slug, exp }`, kit `{ kind: "kit", kit, subject }`, unsub `{ kind: "unsub", email }`.
   - Existing download tokens must keep verifying exactly as now; they're live in sent emails. So a payload with no `kind` is treated as a download.
   - The kit `subject` is only an identifier, never looked up, and it makes each person's link distinct.
3. **Resending:**
   - A second signup with the same email resends the same link, and counts against the existing limit of 3 per email per day.
   - Signing up again after unsubscribing re-subscribes them, because they asked again. `addContact` updates an existing contact to `unsubscribed: false` when the create call reports a duplicate.
4. **Unsubscribe** updates the contact by email; the Resend SDK's `contacts.update` accepts an email. If that isn't so in the installed version, it looks the contact up first, within the same 5 second budget. An unknown or already-unsubscribed email counts as success; the page says the same thing either way.
5. **Headers and caching:** no CSP is set anywhere (none in `next.config.mjs`, no middleware, none in Vercel), so Cal.com's script loads. `/kit/[token]` is `force-dynamic` and is never cached.
6. **Dependencies:** adding `remark-directive` is fine. `==text==` gets a small custom remark plugin, not another dependency.
7. **What the kit uses:** `docs/writing/kit/draft.md` plus this table is the complete structural spec.
   - Bracketed notes (`[…]` at line start, and lines that are only a bracketed note) fail the upload.
   - Inline placeholders the reader fills in, like `[Xero/QuickBooks]` and `[bakery]`, are written as `:fill[Xero/QuickBooks]`, which renders in a lighter colour, as in the design.
   - Normal Markdown (lists, links, bold, fenced code inside `:::prompt`, `###` subheadings) is allowed.
   - If a new construct comes up, the builder adds a directive rather than bending the rule.
8. **Email checks:**
   - Deliverability is already set up: the Resend domain is verified with DKIM and SPF on `send.1tx.dev`, and DMARC `p=none` is on the root.
   - Resend adds no unsubscribe headers to transactional sends, so ours are the only ones.
   - The new root SPF (`include:spf.improvmx.com`) doesn't affect Resend, which aligns through `send.1tx.dev` and DKIM.
9. **Contact failures:** a failure to add the contact to either segment isn't fatal. The email still sends and the failure is logged (event name only), as with downloads today.

## Left to the builder

- Component and file layout, following the repo's patterns (`app/kit/`, `components/kit/`, `lib/kit/`).
- How the highlighter SVG is generated, within the look above.
- The exact share image for `/kit`.
- Whether the kit renderer reuses the writing Markdown pipeline (`lib/writing/markdown.ts`) or has its own.

## Before launch (Angad, with Claude)

1. Finalise `docs/writing/kit/kit.md` from the draft. Re-check the two ChatGPT details (the Codex menu names, and whether its Google connection can edit) against OpenAI's current docs.
2. `npm run kit:upload` to production Redis.
3. Create the "Starter kit" Resend segment and set `RESEND_KIT_SEGMENT_ID`. Optionally set `KIT_SIGNING_SECRET`.
4. The launch check above.
