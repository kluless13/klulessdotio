# Starter Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the free starter kit: a public `/kit` signup page, a Ripple C email with a link that works for good, a private kit page at that link with highlighter and margin-note annotations, and one-click unsubscribe.

**Architecture:**
- The kit's text is Markdown with directives, stored in Upstash Redis (`kit:starter-kit:content`). In tests and local work it's a file named by `KIT_CONTENT_FILE`.
- `lib/kit/parse.ts` turns it into typed blocks, rendered by React components in `components/kit/`.
- Signup reuses `/api/subscribe` with a new `kind: "kit"` branch.
- Tokens come from the existing HMAC module, generalised to kit and unsubscribe payloads with no expiry.

**Tech Stack:** Next.js 14.2.16 App Router, React 18, TypeScript, plain CSS files, unified/remark (plus `remark-directive`, new), Resend SDK, @upstash/redis, zod, Vitest (jsdom), Playwright, vite-node (ships with Vitest) for the upload script.

**Spec:** `docs/superpowers/specs/2026-11-10-starter-kit-design.md`. Read it first, including "Claude's calls on the builder check". It is the authority.

**Design reference (local, git-ignored):**
- Screenshots in `docs/writing/design/kit/`:
  - `kit-signup-day.jpg`, `kit-signup-phone.jpg`;
  - `kit-guide-day*.jpg`, `kit-guide-night*.jpg`, `kit-guide-phone*.jpg`;
  - `kit-annotations.jpg`, `kit-email-c.jpg`, `kit-email-pulse.jpg`.
- Email assets in `docs/writing/design/kit/email-headers/`.
- The Paper builder scripts (exact sizes, colours, highlighter and note drawing) are `kit_boards.py`, `kit_ink.py`, `kit_parts.py`, `kit_text.py`, `kit_email.py` and `kit_annotations.py` in `/private/tmp/claude-501/-Users-kluless--claude-spares-spare-9WR20L/4017b6f2-b7b5-44ba-a306-bda57241526c/scratchpad/`. Port values from them; don't invent them.
- The kit text: `docs/writing/kit/draft.md`. Never commit it.

## Global Constraints

- **Copy rules:**
  - no eyebrows and no all caps;
  - no mono text, except inside the copyable prompt block;
  - no unnecessary lines;
  - no em dashes in any copy, the email included;
  - no email address shown on any page.
- **Buttons:** the site's `.btn`, rounded rectangles, never pills.
- **The repo is public.** Nothing from `docs/writing/` gets committed. The real kit text never enters git; tests use `tests/fixtures/kit/kit.md`, which holds placeholder text.
- **Contrast:** text passes WCAG AA by day and by night.
- **Storage:** wrap every `localStorage`/`sessionStorage` access in try/catch.
- **Existing download tokens must keep verifying exactly as now.** A payload with no `kind` is a download.
- **New dependency:** only `remark-directive`.
- **Commits:** conventional commits ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never `git add -A` (`klulessdotio/.claude/` is untracked).
- **Testing:**
  - Unit tests: `tests/unit/*.test.ts(x)`, run with `npx vitest run`.
  - E2E: `tests/e2e/*.spec.ts`, run with `npx playwright test`.
  - Type check: `npx tsc --noEmit`.
  - Add `lib/kit/**` and `lib/mail/**` to the coverage include in `vitest.config.ts`. Coverage stays at or above 80% lines.

## Review Focus

1. **Tampered or wrong-kind tokens:** a download token used as a kit link, a kit token on `/api/download`, an unsub token used as a kit link, or a truncated or garbled path. Each shows the friendly "this link doesn't work" page or a 404, never a crash or a leak. Pinned in Tasks 1 and 7.
2. **Redis down while someone opens their kit:** they see "Something went wrong on my end, try again in a minute", with status 503, not a stack trace or a blank page. Pinned in Task 3 and Task 7.
3. **A kit text with an em dash, a leftover `[note]` or an unknown directive:** the upload script refuses it, with the line number, and writes nothing. Pinned in Tasks 2 and 3.
4. **Resend hanging:** signup returns a 502 "server" within about 5 seconds and sends nothing. Pinned in Task 4.
5. **Margin notes at narrow widths:** at 390px the note sits under its paragraph with no overlap or horizontal scroll; at 1440px it sits in the margin level with its words. Pinned in Task 8.

---

### Task 1: Tokens for kit links and unsubscribe

**Files:**
- Modify: `lib/downloads/token.ts`
- Test: `tests/unit/download-token.test.ts` (existing; must pass unchanged), plus a new `tests/unit/kit-token.test.ts`

**Interfaces:**
- Produces, in `lib/downloads/token.ts` (keeping today's exports and behaviour):
  - `signKitToken(email: string, secret: string): string`. The payload is `{ kind: "kit", kit: "starter-kit", subject }`, where `subject` is the first 16 hex chars of sha256(email trimmed and lowercased). There's no `exp`.
  - `verifyKitToken(token: string, secret: string): { ok: true; subject: string } | { ok: false }`. It only accepts `kind: "kit"`.
  - `signUnsubToken(email: string, secret: string): string`, with payload `{ kind: "unsub", email }` (lowercased).
  - `verifyUnsubToken(token: string, secret: string): { ok: true; email: string } | { ok: false }`.
  - `kitSecret(env: Record<string, string | undefined>): string | undefined`, which returns `KIT_SIGNING_SECRET || DOWNLOAD_SIGNING_SECRET`.
  - `verifyToken` (downloads) rejects any payload that has a `kind`.
- One shared private `sign` and `split/verify-signature` helper. Don't duplicate the HMAC logic.

- [ ] **Step 1: Write failing tests** in `tests/unit/kit-token.test.ts`:
  - `kit token round trip`: `verifyKitToken(signKitToken("A@x.com ", s), s)` equals `{ ok: true, subject: <sha256("a@x.com") first 16 hex> }`.
  - `same email gives the same link; different emails differ`.
  - `kit token never expires`: verify with the clock mocked 50 years ahead still returns ok.
  - `kit token holds no email`: the decoded payload JSON doesn't contain "@".
  - `tampered signature or payload is rejected`; `wrong secret is rejected`; `garbage strings ("", "a", "a.b.c", "%%%") are rejected`.
  - `kinds don't cross`:
    - `verifyKitToken` of an unsub token is `{ ok: false }`;
    - `verifyKitToken` of a download token is `{ ok: false }`;
    - `verifyToken` (downloads) of a kit token is `invalid`;
    - `verifyUnsubToken` of a kit token is `{ ok: false }`.
  - `unsub round trip lowercases the email`.
  - `kitSecret prefers KIT_SIGNING_SECRET, falls back to DOWNLOAD_SIGNING_SECRET, else undefined`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/kit-token.test.ts tests/unit/download-token.test.ts`. Expected: the kit tests FAIL, and the download tests PASS.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the same command. Expected: all PASS, with download-token.test.ts unchanged.
- [ ] **Step 5: Commit** with `feat: add kit and unsubscribe tokens`.

---

### Task 2: Kit Markdown parser and validator

**Files:**
- Create: `lib/kit/types.ts`, `lib/kit/parse.ts`, `lib/kit/validate.ts`, `tests/fixtures/kit/kit.md`
- Modify: `package.json` (add `remark-directive`), `vitest.config.ts` (coverage include)
- Test: `tests/unit/kit-parse.test.ts`, `tests/unit/kit-validate.test.ts`

**Interfaces:**
- Produces, in `lib/kit/types.ts`:
  ```ts
  export type Inline = string // sanitised HTML for one paragraph's inline content
  export interface Note { on: string; text: string }
  export type KitBlock =
    | { type: "heading"; level: 2 | 3; text: string; step?: number }   // "## 1 Switch from chatting to working" gives step 1
    | { type: "paragraph"; html: Inline; notes: readonly Note[] }
    | { type: "list"; ordered: boolean; items: readonly Inline[]; notes: readonly Note[] }
    | { type: "steps"; items: readonly string[] }
    | { type: "paths"; paths: readonly { name: string; pick: boolean; html: Inline }[] }
    | { type: "timeline"; find: number; decide: number; fix: number; html: Inline }
    | { type: "beforeAfter"; before: Inline; after: readonly { label: string; quote: string }[] }
    | { type: "prompt"; text: string }
    | { type: "job"; title: string; who: string; html: Inline }
    | { type: "ending"; html: Inline }
  export interface KitDoc { title: string; blocks: readonly KitBlock[] }
  ```
- Produces, in `lib/kit/parse.ts`: `parseKit(markdown: string): Promise<KitDoc>`. The title is the first `#` heading.
  - Inline HTML may contain only these tags: `a[href]`, `strong`, `em`, `code` (only inside the prompt, never in prose), `mark class="hl" data-seed`, `span class="note-on" data-note`, `span class="fill"`, `br`.
  - Links to `/…` or `https://…` only.
- Produces, in `lib/kit/validate.ts`: `validateKit(markdown: string): readonly { line: number; message: string }[]`. An empty array means valid.

**Syntax rules (from the spec's table, plus the builder-check calls):**
- **`==text==`** is a highlight: `<mark class="hl" data-seed="{hash of text}">`. Write a small remark plugin for it; don't add a dependency.
- **`:note[note text]{on="words"}`** inside a paragraph or list item: the `words` must appear in that same block. They're wrapped in `<span class="note-on" data-note="n">`, and the note goes into that block's `notes`.
- **`:fill[text]`** becomes `<span class="fill">`.
- **Container directives:** `:::steps`, `:::paths` with `::path[Claude]{pick}` leaves, `:::timeline{find decide fix}`, `:::before-after`, `:::prompt` (exactly one fenced code block inside), `:::job{title who}` and `:::ending`.
- **Allowed Markdown:** headings 1 to 3, paragraphs, lists, bold, italic, links and the fenced code inside `:::prompt`.

**The validator reports:**
- any em dash `—`;
- a line starting with `[`, or a line that is only a bracketed note;
- any directive name outside the set above;
- a `:note` whose `on` words aren't in its block;
- a `:::prompt` without exactly one code block;
- a missing `#` title;
- raw HTML in the Markdown.

**The fixture** `tests/fixtures/kit/kit.md` uses every construct at least once, with placeholder copy ("Lorem-free" plain sentences about a sample kit), not the real kit text.

- [ ] **Step 1: Write failing tests:**
  - `kit-parse.test.ts`:
    - **The fixture:** it parses into a title plus at least one block of every `type`.
    - **Highlights:** `==a b==` becomes a mark with a stable `data-seed`. The same text gives the same seed.
    - **Notes:** `:note[N]{on="files it needs"}` in a paragraph wraps those words and adds `{ on, text: "N" }` to that paragraph's notes.
    - **Steps:** `## 2 Give it hands` gives `step: 2`.
    - **Paths:** `::path[Claude]{pick}` gives `pick: true`.
    - **Timeline:** the attributes parse as numbers.
    - **Prompt:** the text equals the code block exactly.
    - **Safety:** a `javascript:` link is dropped, and raw `<script>` never appears in any `html`.
  - `kit-validate.test.ts`:
    - the fixture is valid (`[]`);
    - an em dash on line 7 gives `{ line: 7, … }`;
    - `[COPY BUTTON]` on its own line is reported;
    - `:::unknown` is reported;
    - a `:note` whose `on` words are missing is reported;
    - `:::prompt` without a code block is reported;
    - raw `<div>` is reported;
    - **Review Focus 3:** all three of these together in one document give three entries, with their line numbers.
- [ ] **Step 2: Run** `npx vitest run tests/unit/kit-parse.test.ts tests/unit/kit-validate.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** Install with `npm install remark-directive`.
- [ ] **Step 4: Run** the tests (PASS), then `npx tsc --noEmit`.
- [ ] **Step 5: Commit** with `feat: parse and validate the kit format`.

---

### Task 3: Kit content store and upload script

**Files:**
- Create: `lib/kit/content.ts`, `scripts/kit-upload.ts`
- Modify: `package.json` (add `"kit:upload": "vite-node scripts/kit-upload.ts"`), `.env.local.example` (document `KIT_CONTENT_FILE`, `KIT_SIGNING_SECRET` and `RESEND_KIT_SEGMENT_ID`)
- Test: `tests/unit/kit-content.test.ts`

**Interfaces:**
- Consumes: `parseKit` and `validateKit` from Task 2.
- Produces, in `lib/kit/content.ts`:
  - `KIT_CONTENT_KEY = "kit:starter-kit:content"`
  - `loadKitContent(env: Record<string, string | undefined>, deps?: { redis?: { get(key: string): Promise<string | null> }; readFile?: (p: string) => string }): Promise<{ ok: true; doc: KitDoc } | { ok: false; reason: "unavailable" }>`
    - **Order:** if `KIT_CONTENT_FILE` is set, read that file. Otherwise read Redis (`KV_REST_API_URL` and `KV_REST_API_TOKEN`, falling back to the `UPSTASH_*` vars), with a 5 second timeout.
    - **Failures:** a missing value, a read or parse error, a timeout, or invalid content (`validateKit` not empty) all give `{ ok: false, reason: "unavailable" }`.
- Produces, in `scripts/kit-upload.ts`: it reads the path given as the first argument (default `docs/writing/kit/kit.md`) and runs `validateKit`.
  - **On errors:** print each as `line N: message`, exit 1, and write nothing.
  - **Otherwise:** `parseKit` it (it must succeed), `SET` it in Redis under `KIT_CONTENT_KEY`, and print `Uploaded <bytes> bytes, <blocks> blocks.`
  - It never prints env values or tokens.
  - A `--dry-run` flag validates and parses without writing.

- [ ] **Step 1: Write failing tests:**
  - **File:** `KIT_CONTENT_FILE` pointing at the fixture gives `ok` with `doc.title` set.
  - **Redis:** `get` returning the fixture text gives `ok`.
  - **Review Focus 2:** `get` throwing gives `unavailable`.
  - `get` returning null gives `unavailable`.
  - `get` never resolving gives `unavailable` within the timeout (fake timers).
  - Content with an em dash gives `unavailable`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/kit-content.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** both files.
- [ ] **Step 4: Run** the tests (PASS).
  - `npm run kit:upload -- tests/fixtures/kit/kit.md --dry-run` exits 0, printing that it's valid.
  - A temp copy with an em dash exits 1 and prints its line. Make that copy in `/tmp`; don't commit it.
- [ ] **Step 5: Commit** with `feat: store and upload the kit text`.

---

### Task 4: Kit email, mail provider and timeouts

**Files:**
- Create: `lib/mail/kit-email.ts`, `lib/timeout.ts`, `public/email/kit-header.gif` (copy of `docs/writing/design/kit/email-headers/header-ripple.gif`), `public/email/signature-angad.png` (copy of `…/email-headers/signature-angad.png`)
- Modify: `lib/mail/provider.ts`
- Test: `tests/unit/kit-email.test.ts`, `tests/unit/mail-provider.test.ts` (extend), `tests/unit/timeout.test.ts`

**Interfaces:**
- Produces, in `lib/timeout.ts`: `withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>`. It rejects with `new Error("timeout")` after `ms`, and clears its timer either way.
- Produces, in `lib/mail/kit-email.ts`:
  - `KIT_EMAIL_SUBJECT = "Your starter kit is here"` and `KIT_EMAIL_PREVIEW = "Five steps to get the AI you already pay for doing real work."`
  - `kitEmailHtml(link: string, unsubscribeLink: string): string`, from `kit-email-c.jpg` plus `kit-email-pulse.jpg`:
    - inline-styled tables; a white card with an 18px radius on `#EEF3F9`;
    - the header `<img src="https://1tx.dev/email/kit-header.gif" alt="" width="552">`, clipped to the top corners;
    - the body copy exactly as on the board; the button "Open your kit" linking to `link`;
    - the signature `<img src="https://1tx.dev/email/signature-angad.png" alt="Angad">` and "1tx.dev";
    - the footer "You're getting this because you asked for the starter kit at 1tx.dev/kit." plus "Unsubscribe in one click" linking to `unsubscribeLink`;
    - a `<style>` block with `@keyframes kitpulse` on the card's `box-shadow` (3s ease-in-out infinite), wrapped in `@media (prefers-reduced-motion: no-preference)`;
    - the preview text as a hidden preheader.
  - `kitEmailText(link: string, unsubscribeLink: string): string`
- Produces, in `lib/mail/provider.ts` (extending `MailProvider`):
  - `addContact(input: { email: string; downloadId?: string; slug?: string; segments?: readonly string[] }): Promise<void>`
    - If `segments` is given, use those segment ids; otherwise behave as today.
    - On a duplicate, call `contacts.update({ email, unsubscribed: false })`, re-adding the segments if the SDK allows it, so a returning reader is re-subscribed.
  - `sendKitEmail(input: { email: string; link: string; unsubscribeLink: string }): Promise<void>`
    - Uses `KIT_EMAIL_SUBJECT` and the HTML and text versions.
    - Headers: `{ "List-Unsubscribe": "<" + unsubscribeLink + ">", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }`.
  - `unsubscribe(email: string): Promise<void>`: `contacts.update({ email, unsubscribed: true })`. A "not found" counts as success.
  - Every Resend call is wrapped in `withTimeout(…, 5000)`.

- [ ] **Step 1: Write failing tests:**
  - `timeout.test.ts`: resolves before the deadline; rejects with "timeout" after it (fake timers); doesn't leak timers.
  - `kit-email.test.ts`:
    - the HTML has no em dash;
    - every `src` and `href` is absolute https;
    - it contains `link` and `unsubscribeLink`;
    - it contains `border-radius:18px`, `@keyframes kitpulse` and `prefers-reduced-motion`;
    - it contains no email address other than inside the given links;
    - the text version contains both links and no HTML tags.
  - `mail-provider.test.ts` (mock the `resend` module):
    - `sendKitEmail` passes both unsubscribe headers and the subject;
    - `addContact` with `segments: ["a","b"]` sends both;
    - a duplicate triggers `contacts.update` with `unsubscribed: false`;
    - `unsubscribe` calls `update` with `unsubscribed: true`, and a not-found counts as success;
    - **Review Focus 4:** a Resend call that never resolves makes `sendKitEmail` reject within the timeout (fake timers).
- [ ] **Step 2: Run** these three test files. Expected: FAIL.
- [ ] **Step 3: Implement.** Copy the two images from the design folder into `public/email/`.
- [ ] **Step 4: Run** the tests (PASS), then `npx tsc --noEmit`.
- [ ] **Step 5: Commit** with `feat: add the kit email and harden the mail provider`.

---

### Task 5: Subscribe and unsubscribe routes

**Files:**
- Modify: `lib/subscribe.ts`, `lib/subscribe-guard.ts`, `app/api/subscribe/route.ts`, `lib/downloads/serve.ts` (Content-Length)
- Create: `app/api/unsubscribe/[token]/route.ts`, `app/unsubscribe/page.tsx`, `lib/unsubscribe.ts`
- Test: `tests/unit/subscribe-route.test.ts` (extend), `tests/unit/unsubscribe.test.ts`, `tests/unit/download-route.test.ts` (extend)

**Interfaces:**
- Consumes: from Task 1, `signKitToken`, `signUnsubToken`, `verifyUnsubToken` and `kitSecret`. From Task 4, `MailProvider.addContact`, `sendKitEmail`, `unsubscribe` and `withTimeout`.
- **`handleSubscribe`:**
  - The body may carry `kind: "kit"`. The kit schema is `{ kind: "kit", kit: "starter-kit", email, consent: true, company_url? }`.
  - The download branch's schema and behaviour don't change.
  - **Kit branch:**
    1. Honeypot, then validation, then the secret (`kitSecret(env)`; missing gives 502 "server").
    2. Limits (the same IP and email limits).
    3. `link = origin + "/kit/" + signKitToken(email)` and `unsubscribeLink = origin + "/api/unsubscribe/" + signUnsubToken(email)`.
    4. `addContact({ email, segments: [RESEND_SEGMENT_ID, RESEND_KIT_SEGMENT_ID].filter(Boolean) })`. A failure there is non-fatal: log `contact_failed`.
    5. `sendKitEmail`. A failure or timeout gives 502 "server" and logs `failed:send`.
    6. Then 200.
- **`guardSubscribeRequest(headers, allowedOrigins: readonly string[], production: boolean)`:** this replaces the single-origin parameter.
  - The route passes `[SITE_URL origin, "https://" + VERCEL_URL, "https://" + VERCEL_BRANCH_URL]`, filtered to those that are set.
  - The visitor route keeps passing only the SITE_URL origin. Update `app/api/visitor/route.ts` and its tests to the array form.
- **`lib/unsubscribe.ts`:** `handleUnsubscribe(token: string, deps: { provider: MailProvider; env }): Promise<{ status: number }>`.
  - An invalid token gives 400.
  - A valid one calls `provider.unsubscribe(email)`. Success or not-found gives 200; a failure or timeout gives 502.
- **`app/api/unsubscribe/[token]/route.ts`:**
  - `POST` (one-click, RFC 8058) returns an empty response with that status.
  - `GET` redirects (303) to `/unsubscribe?status=done|invalid|error`.
- **`app/unsubscribe/page.tsx`:** a small ToneShell page, noindex.
  - done: "You're unsubscribed. Your kit link still works."
  - invalid: "That unsubscribe link doesn't look right."
  - error: "Something went wrong on my end. Try again in a minute."
- **`serveDownload`:** forwards the upstream `content-length` when present.
- **Limiter timeout, both branches:** wrap the rate-limit check (`withinLimits`) in `withTimeout(…, 5000)`. A timeout is handled like today's limiter failure: fail closed, 502 "server", log `failed:limiter`.

- [ ] **Step 1: Write failing tests:**
  - **The kit branch:**
    - it sends one kit email whose link verifies with `verifyKitToken`;
    - its unsubscribe link verifies with `verifyUnsubToken` and carries the same email, lowercased;
    - `addContact` is called with both segment ids when both env vars are set, and one when the kit segment isn't set;
    - an `addContact` failure still sends and returns 200;
    - a `sendKitEmail` rejection returns 502 "server";
    - a missing secret returns 502;
    - a limiter that never resolves returns 502 "server" within the timeout (fake timers), and nothing is sent;
    - the honeypot returns 200 and sends nothing;
    - the download branch's existing tests still pass, unchanged.
  - **The guard:**
    - in production, `Origin: https://${VERCEL_URL}` passes when `VERCEL_URL` is set;
    - `https://evil.example` fails with 403;
    - outside production, any origin passes, as today.
  - `unsubscribe.test.ts`:
    - a valid token calls `provider.unsubscribe` and gives 200;
    - an invalid token gives 400;
    - a provider failure gives 502;
    - a kit token used as an unsub token gives 400;
    - the GET handler redirects to `/unsubscribe?status=done`.
  - **Downloads:** an upstream with `content-length: 123` is forwarded.
- [ ] **Step 2: Run** these test files. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run` (all pass) and `npx tsc --noEmit`.
- [ ] **Step 5: Commit** with `feat: kit signup, one-click unsubscribe and gate hardening`.

---

### Task 6: The /kit signup page

**Files:**
- Create: `app/kit/layout.tsx`, `app/kit/page.tsx`, `app/kit/kit.css` (tone, sheet, form), `components/kit/KitGate.tsx`, `components/kit/Byline.tsx`, `public/kit/og.jpg`
- Modify:
  - `components/ToneShell.tsx`: add `"kit"` to the className union.
  - `components/writing/Footer.tsx`: add "Starter kit" linking to `/kit`.
  - `lib/writing/feeds.ts`: add `/kit` to the sitemap with `lastModified: "2026-11-10"`, and to llms.txt.
  - `app/writing/page.tsx`: one quiet line under the subtitle linking to `/kit`.
- Test: `tests/unit/kit-gate.test.tsx`, `tests/unit/writing-feeds.test.ts` (extend)

**Interfaces:**
- Consumes: the subscribe API from Task 5 (`kind: "kit"`).
- Produces:
  - `KitGate()`, a client component posting `{ kind: "kit", kit: "starter-kit", email, consent: true, company_url }`, with the copy from the spec's "The form" section exactly.
  - `Byline()`: the portrait (`/about/angad.jpg`) plus "Angad Maniyambath" and "Head of AI at Truflation".

**Page:** match `kit-signup-day.jpg` and `kit-signup-phone.jpg`.
- Title "Talk to it. It does the work."
- The subtitle on one line: "A free starter kit for getting AI agents to do real work in your tools. No code."
- The byline, then two pitch paragraphs with one `==highlight==`, rendered with the Task 7 Highlight component.
- "What's inside": the five-steps box, plus the prompt and jobs cards.
- KitGate.

**Metadata:**
- `pageMetadata("/kit", "Talk to it. It does the work. · Angad Maniyambath", "<120 to 160 chars>")`, with `openGraph` and `twitter` images set to `/kit/og.jpg` (1200x630).
- Breadcrumb JSON-LD, Home > Starter kit.

**Copy:** the pitch copy is static and lives in the page (it's public by design). Copy it from the board.

**Share image:** build `public/kit/og.jpg` in the kit style from the signup board: the title on the sky, matching `public/library/og.jpg`. Note in the report that Angad should check it.

**`/writing` line:** "New: a free starter kit for getting AI to do real work in your tools." with "starter kit" linking to `/kit`. Note in the report that Angad should check this line too.

- [ ] **Step 1: Write failing tests:**
  - `kit-gate.test.tsx`:
    - the submit posts the exact payload;
    - a 200 shows "Check your inbox. Your link works for good.";
    - a 429 shows the rate-limited message;
    - the honeypot input is hidden from screen readers and tab order;
    - no email address text renders.
  - `writing-feeds.test.ts`: the sitemap includes `https://1tx.dev/kit` and llms.txt contains `https://1tx.dev/kit`. Update the sitemap length assertion by +1.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run` and `npx tsc --noEmit`.
  - **Visual check:** screenshot `/kit` at 1440 and 390, by day and night, with Playwright (`npx next dev -p 3200`), into `/private/tmp/claude-501/-Users-kluless--claude-spares-spare-9WR20L/4017b6f2-b7b5-44ba-a306-bda57241526c/scratchpad/kit-build/`. Compare with the boards.
- [ ] **Step 5: Commit** with `feat: add the kit signup page`.

---

### Task 7: The kit page and annotations

**Files:**
- Create:
  - `app/kit/[token]/page.tsx`
  - `components/kit/KitBody.tsx` (server; renders `KitDoc` blocks)
  - `components/kit/Highlight.tsx`, `components/kit/MarginNotes.tsx`, `components/kit/CopyPrompt.tsx` (client), `components/kit/CalButton.tsx` (client)
  - `lib/kit/ink.ts` (seeded stroke geometry)
  - `app/kit/guide.css`
- Modify: `next.config.mjs` (headers for `/kit/:token*`)
- Test: `tests/unit/kit-ink.test.ts`, `tests/unit/kit-body.test.tsx`, `tests/unit/kit-page.test.tsx`

**Interfaces:**
- Consumes:
  - from Task 1, `verifyKitToken` and `kitSecret`;
  - from Task 2, `KitDoc` and `KitBlock`;
  - from Task 3, `loadKitContent`;
  - from Task 6, `Byline`, `KitGate` and `ToneShell className="kit"`.
- Produces, in `lib/kit/ink.ts`:
  - `highlightPath(seed: string, width: number, height: number, line: number): string`: an SVG path `d` for one highlight stroke, deterministic for the same inputs. Wobbly top and bottom edges, angled ragged ends, and the height and tilt varying with `line`. Port the shape logic from the scratchpad's `kit_ink.py`.
  - `underlinePath(seed: string, width: number): string`
- **`app/kit/[token]/page.tsx`:**
  - `export const dynamic = "force-dynamic"`.
  - `generateMetadata` returns `robots: { index: false, follow: false }` and title "Your starter kit · Angad Maniyambath".
  - It verifies the token. Invalid: render the friendly state ("This link doesn't work. Pop in your email and I'll send you a fresh one.") plus KitGate, with status 200 and noindex.
  - Valid: `loadKitContent(process.env)`.
    - **Unavailable:** render "Something went wrong on my end. Try again in a minute." and set status 503. Use a route-level `unstable_noStore` plus throwing to an `error.tsx`, or render the message and mark it with `notFound`-style handling. The builder chooses, but the e2e must observe 503 or the message.
    - **Ok:** render `<KitBody doc={…} />` in `ToneShell className="kit"`.
- **`next.config.mjs` headers:** for `source: "/kit/:token"`, set `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex, nofollow`.

**KitBody rendering:** match the guide boards and `kit-annotations.jpg`.
- **Sheet and columns:** a reading sheet about 1040px wide, with a 632px text column and a right margin for notes.
  - Inside the text column: the steps box, the paths (stacked), the timeline and before and after.
  - Full sheet width: the prompt and the job cards.
- **Step headings:** the number badge. **Header:** the title, the one-line subtitle and the Byline.
- **Highlight:** draws `<mark class="hl">` with SVG strokes from `highlightPath`.
  - Warm yellow `#FFD449` at 58% by day; sky blue `#6AAEFF` at 34% by night.
  - The text never shifts.
  - Per-line strokes: measure the line boxes on the client (`getClientRects`) and absolutely position one SVG per line behind the text. Before hydration (or without JS), fall back to a plain translucent `background` on `mark`.
- **MarginNotes:** for each block with notes, the `.note-on` words get an `underlinePath` underline in the ink colour (`#2F4FA8` by day, `#9DB8F5` by night).
  - The note text is Caveat 23px, tilted 1.5°, in an `<aside aria-label="Note">`, placed in the margin with its first line level with the words.
  - **No arrows.**
  - Under 1100px wide (no margin), the note renders under its block, in the same font and colour, with no tilt.
  - Load Caveat with `next/font/google` (`display: "swap"`, `preload: false`), imported only by kit components.
- **CopyPrompt:** shows the prompt in Geist Mono (`geist/font/mono`), the only mono on the page. The "Copy prompt" `.btn` copies the exact text and shows "Copied" for 2s.
- **CalButton:** "Book a free call", a `.btn` that is an `<a href="https://cal.com/angad888/show-me">`.
  - On mount it loads Cal's embed script from `https://app.cal.com/embed/embed.js` once.
  - On click, it opens the popup with `calLink: "angad888/show-me"` and the theme following the tone. If the script failed, it lets the link navigate.
- **The `ending` block:** renders the timeline list, the "Show me" card with the CalButton, the "Keep going" card, and the business paragraph, as on the board.

- [ ] **Step 1: Write failing tests:**
  - `kit-ink.test.ts`:
    - the same inputs give the same path, and a different seed or line gives a different path;
    - the path starts with "M" and stays within 0 to `width` horizontally, give or take 4px.
  - `kit-body.test.tsx`, rendering the parsed fixture:
    - one `.kit-badge` per numbered step;
    - `mark.hl` count equals the fixture's highlights;
    - each note renders as `aside[aria-label="Note"]` after its block in DOM order;
    - the CopyPrompt text equals the fixture prompt;
    - the CalButton href is `https://cal.com/angad888/show-me`;
    - no element other than the prompt uses the mono font class;
    - there are no arrow elements (`[data-arrow]`).
  - `kit-page.test.tsx`, calling the page with mocked `loadKitContent`:
    - **Review Focus 1:** an invalid token renders the friendly state and KitGate; a download token, an unsub token and `"%%%"` all render the friendly state;
    - **Review Focus 2:** an unavailable store renders the "Something went wrong" message;
    - a valid token renders the title;
    - `generateMetadata` has `robots.index === false`.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run`, `npx tsc --noEmit` and `npx next build`.
  - **Visual check:** with `KIT_CONTENT_FILE=docs/writing/kit/draft.md` locally (the real text, never committed), screenshot the kit page at 1440 by day and night, and at 390, into the scratchpad `kit-build/` folder.
  - Compare with the guide boards and `kit-annotations.jpg`, especially the highlighter and notes looking hand-made.
  - Put the paths in the report.
- [ ] **Step 5: Commit** with `feat: add the kit page with highlighter and margin notes`.

---

### Task 8: End-to-end tests and contrast

**Files:**
- Create: `tests/e2e/kit.spec.ts`
- Modify:
  - `playwright.config.ts`: add `KIT_CONTENT_FILE=tests/fixtures/kit/kit.md` and `KIT_SIGNING_SECRET=e2e-kit-secret` to the webServer env.
  - `tests/e2e/contrast.spec.ts`: add `/kit` and a kit page.
- Test: these files.

**Interfaces:** e2e helpers mint tokens with `signKitToken("e2e@example.com", "e2e-kit-secret")`, importing `lib/downloads/token.ts` in the spec.

- [ ] **Step 1: Write the e2e** in `tests/e2e/kit.spec.ts`:
  - **`/kit` signup:**
    - it has the title, the one-line subtitle (one line box at 1440: assert its height is under 40px) and no "min read" text;
    - submitting an email with `page.route("/api/subscribe")` returning 200 shows "Check your inbox. Your link works for good.";
    - the posted body has `kind: "kit"`.
  - **The kit page:**
    - `/kit/<valid>` renders the fixture title and at least one `mark.hl`;
    - the response has the `x-robots-tag` header containing `noindex` and `referrer-policy: no-referrer`;
    - `/kit/garbage` shows "This link doesn't work".
  - **Review Focus 5:**
    - at 1440x900, each note's bounding box is to the right of the text column, and its top is within 12px of the top of its `.note-on` words;
    - at 390x844, each note is below its block, and `document.documentElement.scrollWidth <= 390`.
  - **Copy prompt:** with clipboard permissions, the clipboard equals the prompt text.
  - **CalButton:** with `page.route("https://app.cal.com/**", r => r.abort())`, clicking navigates to `cal.com/angad888/show-me` (fallback). Assert the href and that the click isn't prevented.
  - **Unsubscribe:** `/unsubscribe?status=done` shows "You're unsubscribed. Your kit link still works."
- [ ] **Step 2: Add contrast checks** for `/kit` and `/kit/<valid>`, by day and night, following the existing pattern. Skip `.btn`, `.lx` and highlight marks' backgrounds; measure the text.
- [ ] **Step 3: Run** `npx playwright test`. Expected: all specs pass, the existing ones included.
- [ ] **Step 4: Run** `npx vitest run --coverage` (80% or more), `npx tsc --noEmit` and `npx next build`.
- [ ] **Step 5: Commit** with `test: cover the starter kit end to end`.
