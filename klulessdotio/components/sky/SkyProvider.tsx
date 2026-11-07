"use client"

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { WEATHER, WEATHER_KEYS, type SkyView, type Weather, formatHour, inkVars, istHour, skyView } from "@/lib/sky/model"
import type { WeatherResponse } from "@/lib/weather"

interface Sky {
  hour: number
  weather: Weather
  cover: number | null
  view: SkyView
  statusLine: string
}

const Context = createContext<Sky | null>(null)

const PreviewSchema = z.object({
  weather: z.enum(WEATHER_KEYS as [Weather, ...Weather[]]).optional(),
  hour: z.coerce.number().min(0).max(24).optional(),
})

/** `?weather=rain&hour=21` previews any sky, so every state can be reviewed whatever it's doing outside. */
function readPreview(): { weather?: Weather; hour?: number } {
  const params = new URLSearchParams(window.location.search)
  const parsed = PreviewSchema.safeParse({ weather: params.get("weather") ?? undefined, hour: params.get("hour") ?? undefined })
  return parsed.success ? parsed.data : {}
}

interface Live {
  hour: number
  weather: Weather
  known: boolean
  temperature: number | null
  cover: number | null
}

const NOON_CLEAR: Live = { hour: 12, weather: "clear", known: false, temperature: null, cover: null }

export function SkyProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<Live>(NOON_CLEAR)

  useEffect(() => {
    const preview = readPreview()
    const tick = () => setLive((current) => ({ ...current, hour: preview.hour ?? istHour() }))
    tick()
    const timer = window.setInterval(tick, 30000)
    if (preview.weather) {
      setLive((current) => ({ ...current, weather: preview.weather as Weather, known: true }))
      return () => window.clearInterval(timer)
    }
    const controller = new AbortController()
    fetch("/api/weather", { signal: controller.signal })
      .then((response) => response.json() as Promise<WeatherResponse>)
      .then((body) => {
        if (body.success) setLive((current) => ({ ...current, ...body.data, known: true }))
      })
      .catch(() => {
        // Without weather the sky stays clear and the status line leaves it out
      })
    return () => {
      window.clearInterval(timer)
      controller.abort()
    }
  }, [])

  const value = useMemo<Sky>(() => {
    const view = skyView({ hour: live.hour, weather: live.weather, date: new Date() })
    const words = live.known ? `, ${WEATHER[live.weather].label.toLowerCase()}` : ""
    const temperature = live.temperature === null ? "" : `, ${Math.round(live.temperature)}°C`
    return { hour: live.hour, weather: live.weather, cover: live.cover, view, statusLine: `${formatHour(live.hour)} in Coimbatore${words}${temperature}` }
  }, [live])

  useEffect(() => {
    for (const [name, colour] of Object.entries(inkVars(value.view.light))) document.documentElement.style.setProperty(name, colour)
  }, [value.view.light])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useSky(): Sky {
  const sky = useContext(Context)
  if (!sky) throw new Error("useSky must be used inside SkyProvider")
  return sky
}
