export const LAT = 11.0168
export const LON = 76.9558

export type Weather = "clear" | "partly" | "overcast" | "fog" | "rain" | "storm"
export type Rgb = readonly number[]

export const WEATHER_KEYS: readonly Weather[] = ["clear", "partly", "overcast", "fog", "rain", "storm"]

export const WEATHER: Record<Weather, { label: string; cover: number; rain: number; fog: number; gray: number; dark: number }> = {
  clear: { label: "Clear", cover: 0.04, rain: 0, fog: 0, gray: 0, dark: 0 },
  partly: { label: "Some cloud", cover: 0.46, rain: 0, fog: 0, gray: 0.05, dark: 0 },
  overcast: { label: "Overcast", cover: 0.97, rain: 0, fog: 0, gray: 0.7, dark: 0.08 },
  fog: { label: "Mist", cover: 0.6, rain: 0, fog: 0.75, gray: 0.6, dark: 0.03 },
  rain: { label: "Rain", cover: 0.96, rain: 0.6, fog: 0.18, gray: 0.85, dark: 0.25 },
  storm: { label: "Storm", cover: 1, rain: 1, fog: 0.25, gray: 0.95, dark: 0.48 },
}

// Sky colours keyed by sun elevation in degrees: [elevation, top, middle, horizon, cloud lit, cloud shadow, sun]
const KEYS: ReadonlyArray<readonly [number, string, string, string, string, string, string]> = [
  [-18, "#04060f", "#080d20", "#121a36", "#262e44", "#0a0d18", "#aebcd8"],
  [-9, "#081230", "#142348", "#35406c", "#2a2f4a", "#10142a", "#c9d4e8"],
  [-4, "#132a5c", "#3f5a8c", "#d98a68", "#7d6a80", "#272a4a", "#ffb37a"],
  [0, "#2c5a9a", "#86a3c6", "#f7b583", "#f4b596", "#6a5a78", "#ffc78a"],
  [6, "#3f80c4", "#9cc4e4", "#fbdcb0", "#ffe6cc", "#93889a", "#ffe2b0"],
  [20, "#2f7ed2", "#79b5e8", "#cfe6f4", "#ffffff", "#93a4bb", "#fff6e0"],
  [65, "#1f6bc6", "#5fa6e6", "#bcdcf3", "#ffffff", "#9aabc2", "#ffffff"],
]

const hex = (value: string): number[] => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
const mix = (a: Rgb, b: Rgb, t: number): number[] => a.map((v, i) => v + (b[i] - v) * t)
const smooth = (t: number): number => t * t * (3 - 2 * t)
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t))

export function palette(elevation: number): number[][] {
  const first = KEYS[0][0]
  const last = KEYS[KEYS.length - 1][0]
  const e = Math.max(first, Math.min(last, elevation))
  const index = KEYS.findIndex((key, i) => i === KEYS.length - 2 || e <= KEYS[i + 1][0])
  const t = smooth((e - KEYS[index][0]) / (KEYS[index + 1][0] - KEYS[index][0]))
  return [1, 2, 3, 4, 5, 6].map((n) => mix(hex(KEYS[index][n] as string), hex(KEYS[index + 1][n] as string), t))
}

function dayOfYear(date: Date): number {
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5)
}

export function sunAt(hourIST: number, date: Date): { elevation: number; hourAngle: number } {
  const n = dayOfYear(date)
  const rad = Math.PI / 180
  const b = (2 * Math.PI * (n - 81)) / 364
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const decl = -23.44 * Math.cos((2 * Math.PI * (n + 10)) / 365) * rad
  const solar = hourIST + ((LON - 82.5) * 4 + eot) / 60
  const angle = (solar - 12) * 15 * rad
  const sinE = Math.sin(LAT * rad) * Math.sin(decl) + Math.cos(LAT * rad) * Math.cos(decl) * Math.cos(angle)
  return { elevation: Math.asin(sinE) / rad, hourAngle: angle / rad }
}

export function istHour(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date)
  const get = (type: string): number => Number(parts.find((part) => part.type === type)?.value ?? 0)
  return (get("hour") % 24) + get("minute") / 60
}

export function formatHour(hour: number): string {
  const minutes = Math.floor((hour % 24) * 60)
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
}

/** WMO weather codes as used by Open-Meteo. Snow isn't expected in Coimbatore and falls back to overcast. */
export function weatherFromCode(code: number): Weather {
  if (code >= 95) return "storm"
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 86)) return "rain"
  if (code >= 71 && code <= 77) return "overcast"
  if (code === 45 || code === 48) return "fog"
  if (code === 3) return "overcast"
  if (code === 1 || code === 2) return "partly"
  return "clear"
}

export interface SkyView {
  sun: { elevation: number; hourAngle: number }
  base: (typeof WEATHER)[Weather]
  light: boolean
  afterSunset: boolean
  night: number
  colours: number[][]
}

export function skyView({ hour, weather, date }: { hour: number; weather: Weather; date: Date }): SkyView {
  const sun = sunAt(hour, date)
  return {
    sun,
    base: WEATHER[weather],
    light: sun.elevation > -1.5 && weather !== "rain" && weather !== "storm",
    afterSunset: sun.elevation <= -0.833,
    night: 1 - smooth(clamp01((sun.elevation + 9) / 9)),
    colours: palette(sun.elevation),
  }
}

/** Where the sun or moon's glow sits on screen, in 0 to 1 coordinates. */
export function glowPosition(view: SkyView): readonly [number, number] {
  if (view.night > 0.5) {
    const angle = view.sun.hourAngle > 0 ? view.sun.hourAngle - 180 : view.sun.hourAngle + 180
    return [0.5 + (angle / 100) * 0.42, 0.2 + Math.abs(Math.cos((angle * Math.PI) / 180)) * 0.55]
  }
  const x = 0.5 + Math.max(-1.25, Math.min(1.25, view.sun.hourAngle / 100)) * 0.42
  return [x, 0.2 + Math.max(-0.2, view.sun.elevation / 72) * 0.72]
}

/** Text follows the sky's tone, and buttons always take the opposite tone so they never melt into it. */
export function inkVars(light: boolean): Record<string, string> {
  return {
    "--ink": light ? "#101a2e" : "#ffffff",
    "--soft": light ? "rgba(16,26,46,.92)" : "rgba(255,255,255,.92)",
    "--line": light ? "rgba(16,26,46,.18)" : "rgba(255,255,255,.2)",
    "--edge": light ? "rgba(16,26,46,.16)" : "rgba(255,255,255,.24)",
    "--hi": light ? "rgba(255,255,255,.62)" : "rgba(255,255,255,.26)",
    "--lo": light ? "rgba(255,255,255,.26)" : "rgba(255,255,255,.06)",
    "--b-top": light ? "#2b3650" : "#ffffff",
    "--b-bot": light ? "#141b2c" : "#dfe5ee",
    "--b-ink": light ? "#ffffff" : "#141b2c",
    "--b-ring": light ? "rgba(255,255,255,.2)" : "rgba(5,8,18,.45)",
    "--b-shine": light ? "rgba(255,255,255,.22)" : "#ffffff",
    "--g-light": "#ffffff",
    "--g-dark": light ? "#3c4c78" : "#566788",
  }
}

const DAY_SCENES: Record<Weather, string> = {
  clear: "early-morning-1-0",
  partly: "stormy-midday-4",
  overcast: "stormy-morning-2",
  fog: "misty-morning-1-1",
  rain: "stormy-evening-5",
  storm: "stormy-evening-3",
}

export function sceneFor(weather: Weather, afterSunset: boolean): string {
  if (!afterSunset) return `/weather/${DAY_SCENES[weather]}.jpg`
  return weather === "rain" || weather === "storm" ? "/weather/stormy-night-6.jpg" : "/weather/clear-night-7.jpg"
}

/** A flat gradient for browsers that can't run the shader. */
export function fallbackGradient(view: SkyView): string {
  const toCss = (colour: Rgb): string => `rgb(${colour.map((v) => Math.round(v * 255)).join(",")})`
  const [top, mid, hor] = view.colours
  const shade = view.light ? 1 : Math.min(0.42, 1 - view.base.dark)
  const dim = (colour: Rgb): string => toCss(colour.map((v) => (view.light ? Math.max(v, 0.55) : v * shade)))
  return `linear-gradient(180deg, ${dim(top)}, ${dim(mid)} 58%, ${dim(hor)})`
}

function relativeLuminance(colour: Rgb): number {
  const f = (v: number): number => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  return 0.2126 * f(colour[0]) + 0.7152 * f(colour[1]) + 0.0722 * f(colour[2])
}

export function contrast(a: Rgb, b: Rgb): number {
  const x = relativeLuminance(a)
  const y = relativeLuminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
