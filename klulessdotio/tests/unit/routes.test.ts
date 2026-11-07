import { afterEach, describe, expect, it, vi } from "vitest"
import { GET as getContributions, dynamic as contributionsMode } from "@/app/api/contributions/route"
import { GET as getWeather, dynamic as weatherMode } from "@/app/api/weather/route"

afterEach(() => vi.unstubAllGlobals())

describe("API routes", () => {
  it("are never saved as static pages, so failures can't stick", () => {
    expect(weatherMode).toBe("force-dynamic")
    expect(contributionsMode).toBe("force-dynamic")
  })

  it("answer 200 with a short cache when the weather service fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("x", { status: 500 })))
    const response = await getWeather()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: false, error: "Weather unavailable" })
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=60")
  })

  it("cache good weather for 15 minutes", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ current: { temperature_2m: 20, weather_code: 0, cloud_cover: 1 } }))))
    const response = await getWeather()
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900")
  })

  it("answer 200 with a short cache when GitHub fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("x", { status: 500 })))
    const response = await getContributions()
    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300")
  })
})
