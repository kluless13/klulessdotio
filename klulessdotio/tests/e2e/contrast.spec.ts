import { expect, test } from "@playwright/test"
import { WEATHER_KEYS, contrast, inkVars, skyView } from "../../lib/sky/model"

const hex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t)

// Samples the whole screen, including where the top buttons sit. Storm is measured at the peak of a lightning flash.
test("text and buttons stay readable across every half hour in all weather", async ({ page }) => {
  await page.goto("/?weather=clear&hour=12")
  await page.waitForFunction(() => "__skyAudit" in window)
  const states = await page.evaluate((weathers) => {
    const audit = (window as unknown as { __skyAudit: (h: number, w: string, x: number[], y: number[], n: number, flash?: number) => number[][] }).__skyAudit
    return weathers.flatMap((weather) =>
      Array.from({ length: 48 }, (_, i) => ({ weather, hour: i / 2, pixels: audit(i / 2, weather, [0.03, 0.97], [0.03, 0.97], 5, weather === "storm" ? 1 : 0) })),
    )
  }, [...WEATHER_KEYS])
  expect(states).toHaveLength(288)

  const failures: string[] = []
  for (const { weather, hour, pixels } of states) {
    const vars = inkVars(skyView({ hour, weather, date: new Date() }).light)
    const ink = hex(vars["--ink"])
    const surface = mix(hex(vars["--b-top"]), hex(vars["--b-bot"]), 0.5)
    for (const sky of pixels) {
      if (contrast(ink, sky) < 4.5) failures.push(`${weather} ${hour} text ${contrast(ink, sky).toFixed(2)}`)
      if (contrast(mix(sky, ink, 0.92), sky) < 4.5) failures.push(`${weather} ${hour} soft`)
      if (contrast(surface, sky) < 3) failures.push(`${weather} ${hour} button ${contrast(surface, sky).toFixed(2)}`)
    }
  }
  expect(failures.slice(0, 10)).toEqual([])
})
