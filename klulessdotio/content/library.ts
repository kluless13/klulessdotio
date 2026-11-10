import { slugify } from "@/lib/library/slug"
import type { ButtonItem, Era, FontItem, SiteLink, Weight } from "@/lib/library/types"

const w = (name: string, value: number): Weight => ({ name, value })

const THIN_TO_BLACK: readonly Weight[] = [
  w("Thin", 100), w("ExtraLight", 200), w("Light", 300), w("Regular", 400), w("Medium", 500),
  w("SemiBold", 600), w("Bold", 700), w("ExtraBold", 800), w("Black", 900),
]
const pick = (...values: number[]): readonly Weight[] => THIN_TO_BLACK.filter((x) => values.includes(x.value))

function font(f: Omit<FontItem, "kind" | "slug">): FontItem {
  return { kind: "font", slug: slugify(f.name), ...f }
}

export const FONTS: readonly FontItem[] = [
  font({ name: "Geist", category: "Sans serif", by: "Vercel", note: "Simple and elegant.", weights: THIN_TO_BLACK, link: "https://vercel.com/font" }),
  font({ name: "Inter", category: "Sans serif", by: "Rasmus Andersson", note: "The quiet workhorse.", weights: THIN_TO_BLACK, link: "https://rsms.me/inter/" }),
  font({
    name: "Helvetica", category: "Sans serif", by: "Max Miedinger", note: "Still cool.", weights: pick(400, 700),
    link: "https://www.fonts.com/font/linotype/helvetica",
    systemNote: "Shown in your device's Helvetica. Without it, you'll see Arial.",
  }),
  font({ name: "Satoshi", category: "Sans serif", by: "Indian Type Foundry", note: "Nice.", weights: pick(300, 400, 500, 700, 900), link: "https://www.fontshare.com/fonts/satoshi" }),
  font({ name: "Switzer", category: "Sans serif", by: "Jérémie Fontana", note: "Swiss, but softer.", weights: pick(100, 200, 300, 400, 500, 600, 700, 800, 900), link: "https://www.fontshare.com/fonts/switzer" }),
  font({ name: "General Sans", category: "Sans serif", by: "Frode Helland", note: "Geometric, a little warm.", weights: pick(200, 300, 400, 500, 600, 700), link: "https://www.fontshare.com/fonts/general-sans" }),
  font({ name: "Averia Serif Libre", category: "Serif", by: "Dan Sayers", note: "The serif on my older posters.", weights: pick(300, 400, 700), link: "https://fonts.google.com/specimen/Averia+Serif+Libre" }),
  font({ name: "Newsreader", category: "Serif", by: "Production Type", note: "Already on my bookshelf spines.", weights: pick(200, 300, 400, 500, 600, 700, 800), link: "https://fonts.google.com/specimen/Newsreader" }),
  font({ name: "EB Garamond", category: "Serif", by: "Georg Duffner and Octavio Pardo", note: "Old book feel.", weights: pick(400, 500, 600, 700, 800), link: "https://fonts.google.com/specimen/EB+Garamond" }),
  font({ name: "Fraunces", category: "Serif", by: "Undercase Type", note: "A serif with a bit of wobble.", weights: THIN_TO_BLACK, link: "https://fonts.google.com/specimen/Fraunces" }),
]

const EXA: SiteLink = { label: "Visit exa.ai", href: "https://exa.ai" }
const GITHUB: SiteLink = { label: "Visit GitHub", href: "https://github.com" }
const APPLE: SiteLink = { label: "Visit apple.com", href: "https://www.apple.com" }
const STRIPE: SiteLink = { label: "Visit stripe.com", href: "https://stripe.com" }
const SHADCN: SiteLink = { label: "Visit shadcn/ui", href: "https://ui.shadcn.com" }

function button(
  era: Era,
  name: string,
  source: string,
  note: string,
  how: readonly string[],
  css: string,
  link?: SiteLink,
): ButtonItem {
  return { kind: "button", slug: slugify(name), name, era, source, note, how, css: css.trim(), ...(link ? { link } : {}) }
}

const WEIGHTED_SHADOW = `inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 -3px 0 rgba(0, 0, 60, 0.28),
    0 2px 4px rgba(20, 30, 120, 0.35)`

export const BUTTONS: readonly ButtonItem[] = [
  button("Weighted", "Weighted", "Seen on exa.ai", "Feels like it has weight when you press it.", [
    "A darker lip under the face gives it weight.",
    "A thin light line along the top catches the light.",
    "Pressing drops the lip and sinks it by a pixel.",
  ], `
.weighted {
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid #1a2fb8;
  background: linear-gradient(180deg, #3a55ff 0%, #2340f0 100%);
  color: #fff;
  box-shadow: ${WEIGHTED_SHADOW};
}
.weighted:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 60, 0.35);
}`, EXA),
  button("Weighted", "Weighted, light", "After exa.ai", "The quiet partner, with a little key cap.", [
    "A pale face with a soft grey lip under it.",
    "A hairline border keeps the edge crisp.",
    "A small key cap beside the label shows the shortcut.",
  ], `
.weighted-light {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #d6d8de;
  background: linear-gradient(180deg, #fff 0%, #f6f7f9 100%);
  color: #14161f;
  box-shadow: inset 0 -2px 0 #e4e6eb, 0 1px 2px rgba(20, 22, 31, 0.08);
}
.weighted-light kbd {
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid #e6e7ec;
  background: #fafafb;
  box-shadow: inset 0 -1px 0 #e1e3e8;
}`, EXA),
  button("Weighted", "Weighted, dark", "After exa.ai", "Same weight, darker.", [
    "A dark face over a near-black lip.",
    "A faint light line along the top edge.",
    "A black border pulls it off the page.",
  ], `
.weighted-dark {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #000;
  background: linear-gradient(180deg, #2c2d33 0%, #17181c 100%);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -3px 0 rgba(0, 0, 0, 0.55),
    0 2px 4px rgba(0, 0, 0, 0.3);
}`, EXA),
  button("Weighted", "Weighted icon", "After exa.ai", "One job, one key.", [
    "The same weighted face, cut to a square.",
    "One icon in the middle does the whole job.",
    "The lip and the top line match the full button.",
  ], `
.weighted-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #1a2fb8;
  background: linear-gradient(180deg, #3a55ff 0%, #2340f0 100%);
  color: #fff;
  box-shadow: ${WEIGHTED_SHADOW};
}`, EXA),
  button("Weighted", "Keycaps", "Command bars", "Shortcuts that look like real keys.", [
    "Each key is a small square with a thick lip.",
    "A light gradient makes the top look slightly domed.",
    "Keys sit side by side with a small gap.",
  ], `
.keycap {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  border: 1px solid #d3d6dc;
  background: linear-gradient(180deg, #fff 0%, #f1f2f5 100%);
  color: #2a2d36;
  box-shadow: inset 0 -3px 0 #dadde3, 0 1px 1px rgba(20, 22, 31, 0.08);
}`),
  button("Weighted", "Segmented", "After exa.ai", "Pick one and it sits up.", [
    "The options share one sunken track.",
    "The chosen option is a raised card with a lip.",
    "The others stay flat and grey.",
  ], `
.segmented {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: #e9ebef;
  box-shadow: inset 0 1px 2px rgba(20, 22, 31, 0.1);
}
.segmented .on {
  border-radius: 9px;
  background: linear-gradient(180deg, #fff 0%, #f7f8fa 100%);
  box-shadow: inset 0 -2px 0 #e2e4e9, 0 1px 2px rgba(20, 22, 31, 0.12);
}`, EXA),

  button("Retro desktops", "Platinum", "Mac OS 8", "Retro. Every edge drawn by hand.", [
    "A grey face with a white edge top left and a dark edge bottom right.",
    "A one pixel black outline.",
    "A heavy black ring marks the default button.",
  ], `
.platinum {
  padding: 4px 22px;
  min-width: 68px;
  border-radius: 5px;
  border: 1px solid #000;
  background: linear-gradient(180deg, #f2f2f2 0%, #d4d4d4 100%);
  color: #000;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #8a8a8a;
}
.platinum-default {
  padding: 3px;
  border: 2px solid #000;
  border-radius: 8px;
}`),
  button("Retro desktops", "Bevel", "Windows 95 and 98", "Light from the top left, always.", [
    "Flat grey with square corners.",
    "Four stacked inner lines make the raised edge.",
    "White and light grey on the top left, black and dark grey on the bottom right.",
  ], `
.bevel {
  padding: 5px 20px;
  background: #c3c3c3;
  color: #000;
  box-shadow:
    inset 1px 1px 0 #fff,
    inset -1px -1px 0 #000,
    inset 2px 2px 0 #dfdfdf,
    inset -2px -2px 0 #808080;
}`),
  button("Retro desktops", "Luna", "Windows XP", "Cream face, orange glow on hover.", [
    "A cream face that fades to warm grey at the bottom.",
    "A dark blue outline with tight corners.",
    "Two inner rings, pale then orange, make the glow.",
  ], `
.luna {
  padding: 5px 22px;
  min-width: 76px;
  border-radius: 3px;
  border: 1px solid #003c74;
  background: linear-gradient(180deg, #fff 0%, #f4f3ee 40%, #e3e0d6 85%, #d6d0c5 100%);
  color: #000;
  box-shadow: inset 0 0 0 1px #ffe7a2, inset 0 0 0 2px #f8b330;
}
.luna:hover {
  box-shadow: inset 0 0 0 1px #ffe7a2, inset 0 0 0 2px #f8b330, 0 0 4px rgba(248, 179, 48, 0.6);
}`),
  button("Retro desktops", "Luna start", "Windows XP", "The most clicked green button there was.", [
    "A green gradient with a lighter band across the top.",
    "Square on the left and rounded on the right.",
    "A bold italic label with a small dark shadow.",
  ], `
.luna-start {
  padding: 4px 22px 4px 12px;
  border-radius: 0 14px 14px 0;
  background: linear-gradient(180deg, #6cc46c 0%, #3c9a3c 12%, #318f31 50%, #2a812a 88%, #1f621f 100%);
  color: #fff;
  font: italic 700 18px "Trebuchet MS", sans-serif;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  box-shadow: inset -2px 0 3px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}`),
  button("Retro desktops", "Aero", "Windows Vista and 7", "Glass that glows blue.", [
    "A pale blue gradient with a hard split at the middle.",
    "A steel blue outline with small corners.",
    "A white inner line makes it look like glass.",
  ], `
.aero {
  padding: 5px 24px;
  min-width: 76px;
  border-radius: 3px;
  border: 1px solid #3c7fb1;
  background: linear-gradient(180deg, #eaf6fd 0%, #d9f0fc 50%, #bee6fd 51%, #a7d9f5 100%);
  color: #000;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}`),
  button("Retro desktops", "Aqua", "Mac OS X, 2001", "Glassy, a bit of jelly.", [
    "A fully rounded blue pill.",
    "A white gloss band covers the top half.",
    "A light glow along the bottom edge gives it the jelly look.",
  ], `
.aqua {
  padding: 7px 28px;
  border-radius: 999px;
  border: 1px solid #1b4e9e;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.35) 46%, rgba(255, 255, 255, 0) 50%),
    linear-gradient(180deg, #8ec5ff 0%, #3d8cf0 50%, #2a78e6 52%, #7cc0ff 100%);
  color: #0b1a33;
  box-shadow: 0 2px 4px rgba(0, 30, 80, 0.35), inset 0 -2px 4px rgba(160, 220, 255, 0.6);
}`),
  button("Retro desktops", "Aqua, graphite", "Mac OS X, 2001", "Aqua with the colour turned down.", [
    "The same pill and gloss as Aqua.",
    "The blues are swapped for greys.",
    "A grey outline and a lighter shadow.",
  ], `
.aqua-graphite {
  padding: 7px 28px;
  border-radius: 999px;
  border: 1px solid #5b6573;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.35) 46%, rgba(255, 255, 255, 0) 50%),
    linear-gradient(180deg, #dce2e8 0%, #a3acb7 50%, #8f99a6 52%, #cdd5de 100%);
  color: #111;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}`),
  button("Retro desktops", "Aqua help", "Mac OS X", "The little glass question mark.", [
    "A small blue circle with the Aqua gloss.",
    "A single question mark sits in the middle.",
    "The same outline and shadow as the full Aqua button.",
  ], `
.aqua-help {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid #1b4e9e;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.35) 46%, rgba(255, 255, 255, 0) 50%),
    linear-gradient(180deg, #8ec5ff 0%, #3d8cf0 50%, #2a78e6 52%, #7cc0ff 100%);
  box-shadow: 0 2px 4px rgba(0, 30, 80, 0.35);
}`),
  button("Retro desktops", "Traffic lights", "Mac OS X", "Three drops of gel.", [
    "Three small circles in a row.",
    "A radial gradient, light at the top, makes each one a drop.",
    "A bright inner edge and a small shadow finish them.",
  ], `
.light {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  background: radial-gradient(circle at 50% 30%, #ffb3ae 0%, #ff5f57 45%, #c83a31 100%);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 1px 1px rgba(0, 0, 0, 0.15);
}
.light.yellow { background: radial-gradient(circle at 50% 30%, #ffe3a3 0%, #febc2e 45%, #c98e12 100%); }
.light.green { background: radial-gradient(circle at 50% 30%, #b8f0ae 0%, #28c840 45%, #1a8f2b 100%); }`),

  button("Web 2.0 and early iPhone", "Glossy download", "Web 2.0, around 2006", "Big, green, shiny, impossible to miss.", [
    "A bright green gradient with a hard split at the middle.",
    "A white line along the top edge adds shine.",
    "A dark green label shadow keeps the text readable.",
  ], `
.download {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  border-radius: 9px;
  border: 1px solid #3f8a2a;
  background: linear-gradient(180deg, #a8e86e 0%, #74c94f 50%, #55b437 51%, #82d85e 100%);
  color: #fff;
  text-shadow: 0 -1px 0 rgba(0, 60, 0, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.25);
}`),
  button("Web 2.0 and early iPhone", "Bootstrap 2", "Bootstrap, 2012", "The button half the web wore for a while.", [
    "A blue gradient from light to dark.",
    "A thin dark border and a small corner radius.",
    "A faint light line along the top.",
  ], `
.bootstrap2 {
  padding: 4px 14px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  background: linear-gradient(180deg, #08c 0%, #04c 100%);
  color: #fff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
}`),
  button("Web 2.0 and early iPhone", "Gel switch", "Early iPhone", "On, with a shine.", [
    "A rounded blue track with a gloss band on the top half.",
    "The track is sunken, with a shadow on the inside.",
    "A round grey knob with a gradient sits at the end.",
  ], `
.gel-switch {
  display: flex;
  align-items: center;
  padding: 1px;
  border-radius: 999px;
  border: 1px solid #1e5bb8;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.35) 46%, rgba(255, 255, 255, 0) 50%),
    linear-gradient(180deg, #3d8cf0 0%, #1e6fe0 100%);
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.3);
}
.gel-switch .knob {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid #9aa0a8;
  background: linear-gradient(180deg, #fff 0%, #dadde1 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}`),
  button("Web 2.0 and early iPhone", "Glossy bar button", "Early iPhone", "Shiny, a little serious.", [
    "Steel blue with a lighter band over the top half.",
    "A small corner radius and a dark blue border.",
    "White bold text with a dark shadow above it.",
  ], `
.bar-button {
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid #2c4a73;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0) 51%),
    linear-gradient(180deg, #7fa0cb 0%, #4d72a8 50%, #3f659c 51%, #5f84b9 100%);
  color: #fff;
  font: 700 13px Helvetica, sans-serif;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 1px 0 rgba(255, 255, 255, 0.3);
}`),

  button("Flat and Material", "Text button", "iOS 7, 2013", "No button at all. Just the word, in blue.", [
    "No background, border or shadow.",
    "Only blue text sets it apart from the words around it.",
    "A little padding keeps the tap target comfortable.",
  ], `
.text-button {
  padding: 4px 8px;
  background: none;
  border: 0;
  color: #007aff;
  font: 500 17px "Helvetica Neue", Helvetica, sans-serif;
}`),
  button("Flat and Material", "Raised", "Material Design, 2014", "Paper lifted off the page.", [
    "A solid blue block with a tiny corner radius.",
    "Two soft shadows lift it off the surface.",
    "Spaced capital letters in the label.",
  ], `
.raised {
  padding: 10px 16px;
  border-radius: 2px;
  background: #2196f3;
  color: #fff;
  font: 500 14px Roboto, sans-serif;
  letter-spacing: 0.06em;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.24), 0 0 2px rgba(0, 0, 0, 0.12);
}`),
  button("Flat and Material", "Floating action", "Material Design, 2014", "One round button for the main thing.", [
    "A 56px pink circle.",
    "One white plus icon in the middle.",
    "A deeper shadow floats it above everything else.",
  ], `
.fab {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #ff4081;
  color: #fff;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2), 0 1px 18px rgba(0, 0, 0, 0.12);
}`),

  button("Modern", "shadcn/ui", "shadcn/ui", "The classics: default, secondary, outline, ghost.", [
    "Four flat variants that share one size and radius.",
    "Default is near black, secondary is light grey.",
    "Outline adds a hairline border, and ghost has no background.",
  ], `
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font: 500 14px Inter, sans-serif;
}
.btn-default { background: #18181b; color: #fafafa; }
.btn-secondary { background: #f4f4f5; color: #18181b; }
.btn-outline {
  background: #fff;
  color: #18181b;
  border: 1px solid #e4e4e7;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.btn-ghost { background: none; color: #18181b; }`, SHADCN),
  button("Modern", "Primer green", "GitHub", "Calm green, tiny shadow.", [
    "A flat green with a faint dark border.",
    "A one pixel shadow underneath.",
    "A 6px corner radius and a semibold label.",
  ], `
.primer-green {
  padding: 5px 16px;
  border-radius: 6px;
  border: 1px solid rgba(31, 35, 40, 0.15);
  background: #1f883d;
  color: #fff;
  font: 600 14px "Helvetica Neue", Helvetica, sans-serif;
  box-shadow: 0 1px 0 rgba(31, 35, 40, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}`, GITHUB),
  button("Modern", "Blue pill", "apple.com", "Flat, blue, perfectly round.", [
    "A flat blue fill with no border or shadow.",
    "The corners are rounded all the way.",
    "A plain regular weight label.",
  ], `
.blue-pill {
  padding: 8px 18px;
  border-radius: 980px;
  background: #0071e3;
  color: #fff;
  font: 400 15px "Helvetica Neue", Helvetica, sans-serif;
}`, APPLE),
  button("Modern", "Purple pill", "stripe.com", "With the little arrow.", [
    "A flat purple pill.",
    "A small chevron follows the label.",
    "Slightly less padding on the right so the arrow sits close.",
  ], `
.purple-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px 7px 16px;
  border-radius: 999px;
  background: #635bff;
  color: #fff;
  font: 600 15px Inter, sans-serif;
}`, STRIPE),
  button("Modern", "Neo-brutalist", "Around 2021", "Thick border, hard shadow.", [
    "A flat yellow fill with a thick black border.",
    "A hard black shadow with no blur, offset down and right.",
    "A bold label in black.",
  ], `
.brutalist {
  padding: 10px 20px;
  border-radius: 4px;
  border: 2px solid #000;
  background: #ffe14d;
  color: #000;
  font: 700 16px "Space Grotesk", sans-serif;
  box-shadow: 4px 4px 0 #000;
}`),

  button("Soft and glass", "Neumorphic", "2019 to 2020", "Pushed out of the surface.", [
    "The button is the same colour as the page behind it.",
    "A dark shadow on one side and a light one on the other lift it.",
    "Pressed, the shadows move inside and it sinks.",
  ], `
.neumorphic {
  padding: 12px 22px;
  border-radius: 14px;
  background: #e0e5ec;
  color: #4a5568;
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #fff;
}
.neumorphic:active {
  box-shadow: inset 5px 5px 10px #a3b1c6, inset -5px -5px 10px #fff;
}`),
  button("Soft and glass", "Clay", "Around 2022", "Soft, puffy, pressable.", [
    "A purple fill with large rounded corners.",
    "A dark inner shadow bottom right and a light one top left puff it up.",
    "A soft coloured shadow underneath.",
  ], `
.clay {
  padding: 12px 24px;
  border-radius: 20px;
  background: #9b7bff;
  color: #fff;
  font-weight: 700;
  box-shadow:
    inset -4px -4px 8px rgba(60, 20, 160, 0.35),
    inset 4px 4px 8px rgba(255, 255, 255, 0.5),
    8px 10px 18px rgba(110, 70, 220, 0.3);
}`),
  button("Soft and glass", "Frosted glass", "Glassmorphism, 2020", "A frosted pane over colour.", [
    "An almost clear fill with a thin light border.",
    "A backdrop blur frosts whatever sits behind it.",
    "A bright line along the top and a deep soft shadow.",
  ], `
.glass {
  padding: 10px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18px) saturate(160%) brightness(1.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 10px 30px rgba(0, 0, 0, 0.35);
}`),
  button("Soft and glass", "Liquid glass", "Apple, 2025", "Clear glass with bright edges that bend the light.", [
    "A fully rounded pill that is almost clear.",
    "Bright inner edges on the top left and bottom right catch the light.",
    "A soft glow inside the top and a deep shadow below.",
  ], `
.liquid-glass {
  position: relative;
  isolation: isolate;
  padding: 11px 24px 11px 20px;
  border-radius: 999px;
  color: #fff;
  box-shadow:
    inset 1px 1.5px 0 -0.5px rgba(255, 255, 255, 0.7),
    inset -1px -1px 0 -0.5px rgba(255, 255, 255, 0.25),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.16),
    inset 0 12px 16px -12px rgba(255, 255, 255, 0.4),
    0 1px 1px rgba(0, 0, 0, 0.3),
    0 12px 32px rgba(0, 0, 0, 0.4);
}
.liquid-glass::before,
.liquid-glass::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
}
.liquid-glass::before {
  backdrop-filter: blur(0.5px) brightness(1.06) saturate(110%);
}
.liquid-glass::after {
  backdrop-filter: blur(1.5px) brightness(1.45) saturate(108%) hue-rotate(-8deg);
  mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, transparent 66%, rgba(0, 0, 0, 0.7) 90%, #000 100%);
}`),

  button("Mine", "Mine", "1tx.dev", "Where all of the above ended up. The border shimmers on hover.", [
    "A navy gradient by day and white by night.",
    "A 10px rounded rectangle with a thin light line along the top.",
    "On hover a bright band sweeps around the border.",
  ], `
.mine {
  padding: 10px 15px;
  border-radius: 10px;
  background: linear-gradient(180deg, #2b3650 0%, #141b2c 100%);
  color: #fff;
  font: 500 14px "Instrument Sans", sans-serif;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 1px 2px rgba(0, 0, 0, 0.28),
    0 8px 18px rgba(0, 0, 0, 0.16);
}
.mine-shimmer {
  padding: 1.5px;
  border-radius: 11.5px;
  background: linear-gradient(105deg, #3c4c78 0%, #3c4c78 22%, #fff 40%, #3c4c78 58%, #3c4c78 100%);
}`),
]
