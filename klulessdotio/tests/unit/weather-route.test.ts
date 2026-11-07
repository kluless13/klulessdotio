import { afterEach, describe, expect, it, vi } from "vitest"
import { parseForecast, loadWeather } from "@/lib/weather"

afterEach(() => vi.unstubAllGlobals())

const good = { current: { temperature_2m: 27.4, weather_code: 61, cloud_cover: 88 } }

describe("parseForecast", () => {
  it("reads the current weather", () => {
    expect(parseForecast(good)).toEqual({ weather: "rain", temperature: 27.4, cover: 0.88 })
  })
  it("rejects malformed data", () => {
    expect(parseForecast({ current: { weather_code: "x" } })).toBeNull()
    expect(parseForecast(null)).toBeNull()
  })
})

describe("loadWeather", () => {
  it("returns data when the service works", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(good))))
    expect(await loadWeather()).toEqual({ success: true, data: { weather: "rain", temperature: 27.4, cover: 0.88 } })
  })
  it("fails quietly when the service is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })))
    expect(await loadWeather()).toEqual({ success: false, error: "Weather unavailable" })
  })
  it("fails quietly when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline") }))
    expect(await loadWeather()).toEqual({ success: false, error: "Weather unavailable" })
  })
})
