# 1tx.dev personal site redesign

Date: 2026-11-07, updated 2026-11-08. Status: approved by Angad, who asked for it to be built as a PR.

Items marked **(Claude's call)** were not decided by Angad and are open to change. Everything else is what he asked for or agreed to.

## Intent

The current site reads like a résumé. Angad wants a personal site: what he believes, what he does, what his days are like, and how he got here. It should feel calm and alive, with very little on screen until someone goes looking.

Most of his code is private to Truflation and TRUF Network, and he no longer wants Substack on the site, so the Code and Writing sections add little. His posters stay, as one part of the site and not the headline.

## Goals

- A single personal page, built from the "The Day" direction's text and calm layout, with no time labels.
- A live background of colour gradients that follows the real time and weather in Coimbatore.
- A minimal "screensaver" mode that visitors can swap to and from.
- A smooth poster experience built around a dock, replacing the current draggable board.
- One button system, with depth and good hover effects, that stays visible on any sky.

## Non-goals

- A blog or any Writing section.
- A Code or GitHub repo section beyond the three named projects.
- A Skills section.
- A manual light and dark theme toggle (**Claude's call**: the sky decides the tone, so `ThemeToggle` and the theme provider go away).
- Changes to the GitHub to Telegram notifier (`app/api/cron/notify`, `vercel.json`).

## Anti-goals: this fails even if it technically works if

- Text or buttons become hard to find or read at some time of day or in some weather.
- The background shows drawn scenery: hills, a sun disc, moon or stars. Skies are colour gradients; the one exception is rain and storm, where Angad asked for realistic cloud, rain and lightning.
- Browsing posters feels like a plain scroll, or feels buggy the way the current board does.
- The page still reads like a résumé on first view.
- The animation makes the site slow or drains a laptop.

## Constraints

- Keep the existing stack: Next.js 14 App Router, React 18, Tailwind v4, Framer Motion, deployed on Vercel at 1tx.dev.
- Follow the repo owner's standing rules: tests first for new logic, 80% coverage for new code, Playwright for critical flows. The repo has no tests or Playwright setup today, so that setup is part of this work.
- Respect `prefers-reduced-motion`.
- No secrets are needed for the weather service.

## Structure

One page at `/`. `/writing` and `/portfolio` are removed and redirect to `/` **(Claude's call)**.

Order of the full page:

1. Angad's name and the Quiet/Noise switch. No logo in the header.
2. Rotating greeting: "Hi, I'm Angad."
3. What I believe.
4. What I do, and what my days look like.
5. "Say hello" and "Flick through my posters" buttons, directly below What I do.
6. What I can build.
7. Things I've made: STRIKE, FishTally, PM Data Analyses.
8. What I've been up to: GitHub activity, kept small.
9. How I got here: collapsed to one line, opens to the full timeline.
10. Footer, directly below How I got here.
11. Weather image with the glass watermark.

No time labels. No "A day with Angad". Going live needs a private preview review by Angad, including on his phone, and launches only with translations that have been checked. Section order after the greeting is **Claude's call**.

### Minimal until found

- "Find me" is gone. Clicking "Say hello", below What I do, opens the ways to reach Angad right there: Telegram, LinkedIn, X and GitHub. No email address is shown.
- The timeline stays collapsed until opened.
- Project rows show a name and an arrow; descriptions appear on hover or tap **(Claude's call)**.

### Links

- GitHub: https://github.com/kluless13
- X: https://twitter.com/onetrillionx
- LinkedIn: https://www.linkedin.com/in/angad-maniyambath-b019293a7/
- Telegram: https://t.me/onetrillionx
- STRIKE: https://strike.oranj.co
- FishTally: https://github.com/kluless13/fishtally
- FishTally paper (SoftwareX, Volume 34, 2026): https://www.sciencedirect.com/science/article/pii/S2352711026001366
- PM Data Analyses: https://github.com/kluless13/pm-data-analyses

## Modes

- **Noise:** the full page, everything above.
- **Quiet:** the screensaver. The live sky fills the screen, with the rotating greeting, a line such as "17:36 in Coimbatore, some cloud, 22°C", Poster of the Day, the poster dock, and "Music" and "Books" buttons.

A button swaps between them with a soft crossfade. It reads "Quiet" on the full page and "Noise" in screensaver mode, as Angad named them. Default on load is Noise and the choice is remembered for the visitor **(Claude's call)**.

## Background

Layout reference: the "New site" page of the Paper file (https://app.paper.design/file/01M6VDQSW0800R1GD0ARVTB61M/p-3-0) has every screen, with sky frames captured from the test. Its temperatures and "7 of 79" counter are placeholders, and the Spotify player is a mock of the real embed. Its captions, header and language sheet show suggested answers that Angad has not confirmed.

The working reference for the sky is `docs/superpowers/specs/assets/sky-test.html`. It is a throwaway test and should be rewritten properly, but its look, colour keys and brightness numbers are what Angad approved. Its test controls, sample dock and audit hook are not part of the product, although the audit logic should be carried into a test.

- **Time:** the sky follows Coimbatore's actual time (`Asia/Kolkata`) for every visitor, not the visitor's own time, and goes dark after sunset, as Angad agreed. The colours keep shifting with the sun through the day, as in the test he approved. Sun elevation is computed for latitude 11.0168, longitude 76.9558. The test's result matched the weather service's sunrise and sunset to within about 2 minutes.
- **Colour:** gradients keyed to sun elevation, moving through night, blue hour, dawn, golden hour, morning and midday, and modelled on real skies.
- **Weather:** clear, some cloud, overcast, mist, rain and storm change only the colours and their slow movement. Cloud is soft colour patches, the sun or moon is only a glow, and rain and storm get their own realistic treatment below.
- **Rain and storm:** a low cloud deck lit from above with dark undersides, pale light under the cloud base (taking on sunset colour at dusk), wide slanted rain shafts, and two layers of fine falling rain. Storm is darker and heavier, with lightning that lights the clouds from inside, in bursts of two or three pulses at least 7 seconds apart. There is no drawn bolt **(Claude's call)**. Lightning stays inside the brightness limit so text stays readable, and reduced motion turns off lightning and falling rain.
- **No dither:** Angad removed the dither effect. Skies have no visible grain or pattern. To stop slow gradients showing as thin lines, the shader rounds colours by less than one level with no pattern, which can't be seen as texture **(Claude's call)**.
- **Drawing:** a WebGL fragment shader on a full-screen canvas at half resolution, as in the test. Cap the frame rate and pause when the tab is hidden **(Claude's call)**.
- **Fallbacks:** without WebGL, use a CSS gradient for the current time and weather. With reduced motion, draw a still frame and stop the greeting rotation.

### Weather data

- Source: Open-Meteo (`https://api.open-meteo.com/v1/forecast`). It was tested without an API key and returned current temperature, weather code, cloud cover and sunrise and sunset. Its free tier is meant for non-commercial use, so check its terms before launch.
- Fetch through a Next.js route with roughly 15-minute caching, rather than from each browser **(Claude's call)**.
- Map weather codes as in the test: 0 clear; 1 and 2 some cloud; 3 overcast; 45 and 48 mist; 51 to 67 and 80 to 86 rain; 95 and above storm. Codes 71 to 77 are snow, which is not expected in Coimbatore and falls back to overcast **(Claude's call)**.
- If the service fails, keep the time-based sky with a neutral clear state and omit the temperature. The page must never break or show an error for this.

## Keeping text and buttons visible

This answers Angad's concern about buttons feeling hidden. Picking a text colour was measured and failed, as low as about 1.1:1, because one sky spans deep blue to near white. The approved approach has three parts:

1. **The sky stays in a safe brightness range.** A "light" sky never goes below 0.27 relative luminance, so dark text always reads. A "dark" sky never goes above 0.15, so white text always reads. The shader eases each pixel into the limit gradually, since a hard cut-off flattens the sky and leaves visible edges.
2. **One decision sets the tone.** The sky is light when the sun is above -1.5° and it isn't raining or storming. Otherwise it is dark. Text, secondary text and buttons all follow it, with a smooth transition when it changes.
3. **Buttons use a solid surface in the opposite tone,** with a two-tone edge, so they stand apart from the sky whatever is behind them.

Measured on the test across 288 combinations (every half hour in all 6 weather states, desktop viewport, over the text column), including the new rain and storm: text at least 5.2:1, secondary text at least 4.5:1, button edges at least 3:1. An earlier run measured button labels at 12:1 or better. Lightning flashes were not in this measurement. The build must include an automated test that keeps text at 4.5:1 or better and button edges at 3:1 or better. Hover and pressed states, mobile layouts, and elements that sit outside that measured area still need checking.

## Buttons

One system everywhere:

- Rounded rectangles with a radius of about 10px, not pills.
- A vertical colour gradient, a lit top edge and a soft shadow, so they have depth.
- **Hover:** the "Sweep" shimmer Angad chose: a soft light-to-dark gradient band glides across the border and repeats, as in the reference test. It is not a thin line, and the button itself does not move, grow or pop up.
- **Pressed:** an inner shadow, with no movement.
- **Focus:** a clear keyboard focus ring. The shimmer also runs on keyboard focus, and with reduced motion it becomes a still, bright border.
- On touch devices, the pressed state stands in for hover.
- Poster dock thumbnails are not buttons in this sense and may still magnify on hover **(Claude's call)**.

The test page demonstrates these. It's only a demo; the real site needs the same behaviour.

## Posters

The dock is only for posters.

- "Flick through my posters" opens a working, clickable poster view over the live sky, agreed by Angad. Quiet mode shows the dock directly, plus a Poster of the Day that changes daily and is the same for every visitor that day **(Claude's call)**.
- **Quiet is its own viewer (Claude's call):** clicking a dock thumbnail in Quiet swaps the large poster in place, with its caption below, and arrow keys and swipe work there too. The greeting, status line and buttons stay. The Poster of the Day comes back the next time Quiet opens. Quiet and the "Flick through my posters" view share one poster component, so this is cheap to change.
- One large poster at a time, with a dock of thumbnails that magnify on hover, in the style of the macOS Dock **(Claude's call)**.
- Moving between posters must feel fluid and not like a plain scroll: swipe, arrow keys, and clicking the dock, with a smooth transition.
- All 79 current posters and their 5 categories stay, alongside the 23 new ones below. How the dock handles that many is left to the builder, but it must stay easy to browse.
- Serve optimised images. Some source files are very large, such as the 17.8 MB banner and posters totalling about 190 MB.
- Angad added 27 newer posters directly to the Paper file's "New site" page: CESR index, Netflix markets, Big Mac index, NVDA earnings, Meta EPS and Tesla EPS. Export them from Paper at full size at the start of the build (the Paper app must be open, and `~/.paper/bin/paper mcp` gives access), leaving out duplicates: one of the two identical "cesr index 1" boards, "NVDA Earnings 10" (nearly identical to 1), and "tsla eps 5" and "tsla eps 12" (already in the site's Tesla set). Both Netflix posters stay, as do CESR 1 and 2. That makes 23 new posters and 102 in total. Adding more later should only mean adding files and a data entry.

Captions stay: category name and short description, including the credit to Jeff for the Bobbin set. Claude drafts the missing captions for the new Official groups, and Angad approves them at the preview, since they are public statements about Truflation's work. Existing text that calls official posters "studies", such as the Tesla caption in `app/portfolio/page.tsx`, must be rewritten. Labelling follows what Angad confirmed:

- **Official work:** Earnings (NVDA, Meta and Tesla, merged into one group), CESR index, Netflix markets and Big Mac index. No disclaimer and no visible "official" label.
- **Case study:** the Bobbin set, labelled "Case study", keeping the credit to Jeff.
- **Practice:** the Perplexity and Quartr sets, labelled "Practice and experiments".
- **Older experiments:** the Prediction Platforms set (Polymarket, Kalshi and others), labelled "Older personal experiments, not official work."

The current board, shuffle, drag and info panel are removed. That also removes its known bugs: the background grid that never renders and the info panel that goes off-screen.

## FishTally

Wherever FishTally appears as a project, a "Published in SoftwareX, 2026" badge sits beside its name and is always visible, linking to the paper.

## Bookshelf

The "What I'm reading" shelf lives only in Quiet mode, opened with a "Books" button beside "Music". It does not appear in Noise mode. The working reference is `docs/superpowers/specs/assets/books-test.html`, a throwaway test whose feel the build should match.

- **Physics:** books behave like real objects under gravity. Visitors can drag and rearrange them; books push on each other, lean on neighbours and fall when unsupported. The test uses Matter.js.
- **Slump rule (Claude's call):** a thin rectangle would balance forever in pure physics, so an upright book with a nearby gap gets a gentle push and leans into it, and one with nothing beside it tips over.
- **One unit:** the ledge and bookends are a single connected piece. A book pushed over an end drops off and falls back in at the top of the shelf area, so none are lost. "Tidy the shelf" resets it.
- **Never over the words:** books stay inside the shelf's own area, held by an invisible ceiling. Opening the shelf replaces the Poster of the Day while it is open **(Claude's call)**.
- **Phones:** spines get thinner but stay tall. Each title shrinks automatically until it fits, and the author's surname drops off when space is still too tight. In the test this measured no clipped titles at 390px wide and 1280px wide. Dragging and touch behaviour still need checking on a real phone.
- **Opening:** clicking without dragging opens a small card with the real cover, title and author. Keyboard users can open books too.
- **Covers:** real cover images, self-hosted, shown when a book opens. Test covers come from Open Library; Antifragile's has a library stamp and The Hard Thing's is low resolution, so those need better images.
- **Spines:** no public source for spine images was found, and using a slice of the cover looked wrong to Angad. Each spine is designed from its real cover's colours and type style, with title, author surname and accent bands, as in the test, which Angad approved. Photos of his own books' spines could replace these later if he provides them.
- **Notes:** left for later, at Angad's request. The panel should have room to add them without a redesign.
- **Book list:** launch with the 11 books in the test, taken from the Books Index in Angad's vault. Angad may swap in what he is actually reading, so the list must be a simple data file.
- **Phones (Claude's call):** keep the full physics, since Quiet doesn't scroll and so dragging doesn't compete with it. Test on a real phone during the build; if it feels bad or runs slowly, fall back to a still shelf with tap to open. With reduced motion, books should not animate on their own.

## Page bottom

The reference is `docs/superpowers/specs/assets/scene-test.html`.

- **Footer:** "© 2026 Angad Maniyambath" sits directly below How I got here, not on the image.
- **Weather image:** Angad's images appear only at the very bottom of the page, chosen by the weather, at full page width and their original proportions (1488 x 816), so nothing is cropped. Only the watermark sits in front of them. The images are the 8 he placed on the Paper file's "New site" page; export them from there.
- **Which image shows (Claude's call):**

| Weather | Before sunset | After sunset |
|---|---|---|
| Clear | Early morning | Clear night |
| Some cloud | Stormy midday | Clear night |
| Overcast | Stormy morning | Clear night |
| Mist | Misty morning | Clear night |
| Rain | Stormy evening, lake | Stormy night |
| Storm | Stormy evening, lightning | Stormy night |

- **Blend:** the image fades out toward its top while five stacked layers blur both the sky and the image together, strongest at the top and easing to none around 85% of the way down, so there is no visible join. Backdrop-filter does this in the test; it needs a fallback where unsupported and a performance check on phones.
- **Watermark:** "Angad" as transparent glass letters at the bottom right, about a quarter of the page width in type size, with the bottom of the g dipping below the edge: the image behind is softened and brightened only inside the word, with a thin bright outer edge. It rises and fades in slowly, tied directly to scroll position, and sinks back as you scroll away. With reduced motion it only fades. The word stays "Angad", as agreed.

## Left for later

Not in this build, at Angad's request: book notes, the day-scrubbing slider and the bread gallery.

## Greeting

"Hi, I'm Angad." rotates about every 5 seconds with a soft fade through English, Tamil, Spanish, Mandarin, Japanese, Hindi, French, Korean, Portuguese, Arabic and German. Angad asked for Spanish, Mandarin, Japanese and "a bunch"; the rest were **Claude's call**.

- The translations in the test are drafts and need checking by native speakers, especially his name in Tamil and Hindi. Angad arranges this. The languages are a simple list, and any language not confirmed by launch is left out, so launch never waits on a reviewer **(Claude's call)**.
- Screen readers should get a single stable greeting.
- Layout must not jump between languages, and Arabic runs right to left.

## Copy

Angad approved the feel of this text. Most of it was drafted from his Obsidian notes, and the "Whatever the day calls for" line is his own wording.

**What I believe**

- Most fields aren't short of ideas. They're short of tools.
- I follow my gut first, then go find the data.
- You don't learn and then do. You do, and then you learn.

**Where I started**

I started out counting fish with a pencil, floating off the Queensland coast. Every time I looked down at my slate, the current dragged me 30 feet off the line. That problem is what taught me to code.

**What I do**

Now I'm Head of AI at Truflation, building Truman, an agent built for macro. I ended up here after Truflation acquired Trufonomics, the company I founded solo.

**My days**

Whatever the day calls for: hardcore engineering, GTM strategy, creative design, sales calls, index development, and modelling (the forecasting kind, not runway).

**Timeline summary line**

Marine science, bread, prediction markets, AI. Each one gave me a tool.

Do not use private details from his notes, such as money goals or his personal life. Write without em dashes, per his writing preferences.

**What I can build** (no "open to work" language or call to action, per Angad)

- Forecasting models: Macro and other forecasting models, from the data pipeline through to the prediction.
- AI engineering: Agent harnesses, agent automation and end-to-end deployment.
- Web and product: Frontend and backend, built and shipped as one working product.

## Logos

No logo in the header. Truflation's and Trufonomics' logos sit right beside their names in "What I do" and the timeline, so they catch the eye on any sky. Truflation's is a white mark, kept fairly small, inside a `#0407FF` circle. Trufonomics keeps its existing rounded-square logo. The Truflation mark's SVG paths come from Angad's file `truflation logo only.svg`; Trufonomics uses the existing logo in `public/`. The favicon is his initial "A" and the share image is a sky frame with "Hi, I'm Angad." on it, both agreed.

## Timeline

Newest first:

| When | What |
|---|---|
| Apr 2026 to present | Head of AI, Truflation |
| Dec 2025 to Apr 2026 | Founder, Trufonomics |
| 2024 to 2025 | Founder, BetBTC.win |
| 2023 to 2025 | Co-Founder, PurposeFi |
| 2023 to 2024 | Co-Founder, DeTrash |
| 2022 to 2024 | Masters in Marine Biology, James Cook University |
| 2022 to 2023 | Marine Robotics Intern, Flyingfish Tech |
| 2022 | Research Analyst, Blueshift Economy |
| 2020 to 2022 | Founder, Baked |
| 2017 to 2020 | B.Sc(H) Marine Science & Tech, Amity University |

Existing descriptions in `app/page.tsx` carry over for each role. Baked's text: "A home bakery during the pandemic: one oven, 25 to 30 orders a week, and strangers asking if I was the bread guy. It's also when I got into web3, blockchain and ReFi."

Trufonomics' text begins "Founded solo." Baked appears only in this timeline, not in the opening text. Angad will send bread photos later, and they belong with this entry.

## GitHub activity

Keep the contribution grid, small and quiet, and draw it ourselves from Angad's real GitHub contribution data instead of embedding an image. Each square is a see-through tint of the current text colour, in five levels, so it takes on the colours of whichever sky is behind it, as Angad asked. There are no month labels **(Claude's call)**. The data source and caching are left to the builder, but a failure must not break the page.

`app/api/heatmap` isn't used by the site and reads a different repo, so don't assume it's suitable for this chart. Leave the route in place: the reviewer reports his GitHub profile README embeds it **(Claude's call)**.

## Spotify (screensaver mode only)

Playlist: `https://open.spotify.com/embed/playlist/1HhwGBbAHTamfntjxtLPTa?utm_source=generator&theme=0`. It shouldn't block launch if the embed misbehaves.

- A "Music" button in our button system opens the compact 152px Spotify embed with a thin edge, no thick frame, and the same border shimmer on hover as the buttons. Spotify's frame takes over mouse events, so normal CSS hover does not fire on it; the test detects the pointer on an invisible strip just outside the player instead. Spotify's frame can't be restyled from outside, so the design work is everything around it.
- The player loads only when opened, so visitors who don't use it don't load anything from Spotify.
- Hiding the player keeps the music going. Leaving screensaver mode removes the player, which stops it **(Claude's call)**.

Expected limits, partly from Spotify's docs and partly from developer reports, which need testing:

- Browsers such as Safari block autoplay, so a visitor has to press play.
- Embeds sometimes play previews under 30 seconds. The test showed a "Preview" badge in a browser not signed in to Spotify, so expect such visitors to hear clips.
- Shuffle: no documented way to turn it on from a website was found. Angad agreed to launch without it, so the playlist plays in order.
- Spotify's Web Playback SDK requires Premium, so it isn't suitable for general visitors.

## Type

Instrument Sans, which Angad has seen in The Day and the test **(Claude's call, replacing Satoshi)**. Handling of non-Latin greeting scripts is left to the builder. They mustn't cause a large download or a layout jump.

## Also in scope

- Page metadata: add a real Open Graph image, since the current large-image card has none.
- Labels for icon-only links.
- Mobile layouts for both modes and the poster view. These have not been designed or tested yet.
- Remove code and dependencies this work leaves unused, including the Writing feed parser.

## Left to the builder

File and component structure, how the shader is organised, Framer Motion versus CSS for each transition, exact animation timing, the dock's handling of 102 posters, and image optimisation.

## Supplied later by Angad

Bread photos and his real book list.

## Before the build

`.env.local` was tracked in git and its removal is staged but not committed. Commit that first. Angad has been advised to replace the keys it held. The build happens on a separate branch and goes live only after he reviews a private preview.
