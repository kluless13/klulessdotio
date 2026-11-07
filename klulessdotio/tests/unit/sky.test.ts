import { describe, expect, it } from "vitest"
import { contrast, formatHour, inkVars, palette, sceneFor, skyView, sunAt, weatherFromCode } from "@/lib/sky/model"

const DAY = new Date("2026-11-08T06:00:00Z")

describe("weatherFromCode", () => {
  it.each([
    [0, "clear"], [1, "partly"], [2, "partly"], [3, "overcast"], [45, "fog"], [48, "fog"],
    [51, "rain"], [67, "rain"], [71, "overcast"], [77, "overcast"], [80, "rain"], [86, "rain"], [95, "storm"], [99, "storm"],
  ])("maps code %i to %s", (code, weather) => {
    expect(weatherFromCode(code)).toBe(weather)
  })
})

describe("sunAt", () => {
  it("puts the sun high at Coimbatore noon and below the horizon at midnight", () => {
    expect(sunAt(12.2, DAY).elevation).toBeGreaterThan(50)
    expect(sunAt(0, DAY).elevation).toBeLessThan(-40)
  })
})

describe("skyView", () => {
  it("is light only with the sun above -1.5 degrees and no rain or storm", () => {
    expect(skyView({ hour: 12, weather: "clear", date: DAY }).light).toBe(true)
    expect(skyView({ hour: 12, weather: "fog", date: DAY }).light).toBe(true)
    expect(skyView({ hour: 12, weather: "rain", date: DAY }).light).toBe(false)
    expect(skyView({ hour: 12, weather: "storm", date: DAY }).light).toBe(false)
    expect(skyView({ hour: 21, weather: "clear", date: DAY }).light).toBe(false)
  })

  it("counts as after sunset once the sun is below the horizon", () => {
    expect(skyView({ hour: 12, weather: "clear", date: DAY }).afterSunset).toBe(false)
    expect(skyView({ hour: 21, weather: "clear", date: DAY }).afterSunset).toBe(true)
  })
})

describe("sceneFor", () => {
  it.each([
    ["clear", false, "early-morning-1-0"], ["partly", false, "stormy-midday-4"], ["overcast", false, "stormy-morning-2"],
    ["fog", false, "misty-morning-1-1"], ["rain", false, "stormy-evening-5"], ["storm", false, "stormy-evening-3"],
    ["clear", true, "clear-night-7"], ["partly", true, "clear-night-7"], ["overcast", true, "clear-night-7"],
    ["fog", true, "clear-night-7"], ["rain", true, "stormy-night-6"], ["storm", true, "stormy-night-6"],
  ] as const)("%s, after sunset %s, uses %s", (weather, afterSunset, image) => {
    expect(sceneFor(weather, afterSunset)).toBe(`/weather/${image}.jpg`)
  })
})

describe("colour helpers", () => {
  it("measures contrast", () => {
    expect(contrast([0, 0, 0], [1, 1, 1])).toBeCloseTo(21, 0)
    expect(contrast([1, 1, 1], [1, 1, 1])).toBeCloseTo(1, 5)
  })

  it("gives palettes for any elevation, clamped at the ends", () => {
    expect(palette(-90)).toEqual(palette(-18))
    expect(palette(90)).toEqual(palette(65))
    expect(palette(10)).toHaveLength(6)
  })

  it("uses the opposite tone for buttons", () => {
    expect(inkVars(true)["--ink"]).toBe("#101a2e")
    expect(inkVars(true)["--b-top"]).toBe("#2b3650")
    expect(inkVars(false)["--ink"]).toBe("#ffffff")
    expect(inkVars(false)["--b-top"]).toBe("#ffffff")
  })

  it("formats hours", () => {
    expect(formatHour(7.5)).toBe("07:30")
    expect(formatHour(23.99)).toBe("23:59")
  })
})
