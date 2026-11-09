export const BIO: readonly string[] = [
  "I'm Angad Maniyambath. I'm Head of AI at Truflation. I'm building Truman, an agent built for macro, and working on Truflation Predict, prediction markets on economic data.",
  "My background is marine science. I did a masters at James Cook University in Townsville, with fieldwork on reefs. In late 2022 I started teaching myself to code. Since then I've built FishTally, which uses vision models to count fish in video. It's published in SoftwareX.",
  "Now I research prediction markets. The series in Writing comes from 686,272 Kalshi trades and about 248,000 Polymarket traders. I also forecast CPI and PCE.",
  "I call myself a generalist. Marine science, code, markets, macro. If you want it in three words: I am stateless.",
]

export type ElsewhereLink = { label: string; handle: string; href: string }

export const ELSEWHERE: readonly ElsewhereLink[] = [
  { label: "X", handle: "@onetrillionx", href: "https://twitter.com/onetrillionx" },
  { label: "GitHub", handle: "kluless13", href: "https://github.com/kluless13" },
  { label: "LinkedIn", handle: "angad-maniyambath", href: "https://www.linkedin.com/in/angad-maniyambath-b019293a7/" },
  { label: "ORCID", handle: "0009-0000-0985-4721", href: "https://orcid.org/0009-0000-0985-4721" },
]

export const POINTERS: readonly { label: string; line: string; href: string }[] = [
  { label: "Writing", line: "Research and essays, mostly on prediction markets.", href: "/writing" },
]
