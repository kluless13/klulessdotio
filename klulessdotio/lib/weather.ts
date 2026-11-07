import { z } from "zod"
import { LAT, LON, type Weather, weatherFromCode } from "@/lib/sky/model"

export interface CurrentWeather {
  weather: Weather
  temperature: number
  cover: number
}

export type WeatherResponse = { success: true; data: CurrentWeather } | { success: false; error: string }

const ForecastSchema = z.object({
  current: z.object({ temperature_2m: z.number(), weather_code: z.number(), cloud_cover: z.number() }),
})

const FORECAST_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,cloud_cover&timezone=Asia%2FKolkata&forecast_days=1`
export const WEATHER_CACHE_SECONDS = 900

export function parseForecast(raw: unknown): CurrentWeather | null {
  const parsed = ForecastSchema.safeParse(raw)
  if (!parsed.success) return null
  const { temperature_2m, weather_code, cloud_cover } = parsed.data.current
  return { weather: weatherFromCode(weather_code), temperature: temperature_2m, cover: cloud_cover / 100 }
}

const UNAVAILABLE: WeatherResponse = { success: false, error: "Weather unavailable" }

export async function loadWeather(): Promise<WeatherResponse> {
  try {
    const response = await fetch(FORECAST_URL, { next: { revalidate: WEATHER_CACHE_SECONDS } })
    if (!response.ok) return UNAVAILABLE
    const data = parseForecast(await response.json())
    return data ? { success: true, data } : UNAVAILABLE
  } catch (error) {
    console.error("Weather request failed", error)
    return UNAVAILABLE
  }
}
