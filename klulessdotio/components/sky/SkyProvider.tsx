"use client"

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { WEATHER, WEATHER_KEYS, type SkyView, type Weather, formatHour, inkVars, istHour, skyView } from "@/lib/sky/model"
import type { WeatherResponse } from "@/lib/weather"

export interface Sky {
  /** False until the real time is known, so nothing gets drawn for the wrong time of day. */
  ready: boolean
  hour: number
  weather: Weather
  cover: number | null
  view: SkyView
  statusLine: string
}

const Context = createContext<Sky | null>(null)
const WEATHER_REFRESH_MS = 15 * 60 * 1000

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
  ready: boolean
  hour: number
  weather: Weather
  known: boolean
  temperature: number | null
  cover: number | null
}

const NOON_CLEAR: Live = { ready: false, hour: 12, weather: "clear", known: false, temperature: null, cover: null }

export function SkyProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<Live>(NOON_CLEAR)

  useEffect(() => {
    const preview = readPreview()
    const tick = () => setLive((current) => ({ ...current, ready: true, hour: preview.hour ?? istHour() }))
    tick()
    const clock = window.setInterval(tick, 30000)
    if (preview.weather) {
      setLive((current) => ({ ...current, weather: preview.weather as Weather, known: true }))
      return () => window.clearInterval(clock)
    }
    const controller = new AbortController()
    let fetchedAt = 0
    const refresh = () => {
      if (document.hidden || Date.now() - fetchedAt < WEATHER_REFRESH_MS) return
      fetchedAt = Date.now()
      fetch("/api/weather", { signal: controller.signal })
        .then((response) => response.json() as Promise<WeatherResponse>)
        .then((body) => {
          if (body.success) setLive((current) => ({ ...current, ...body.data, known: true }))
        })
        .catch(() => {
          // Without weather the sky carries on with what it last knew
        })
    }
    refresh()
    const weatherTimer = window.setInterval(refresh, WEATHER_REFRESH_MS)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      window.clearInterval(clock)
      window.clearInterval(weatherTimer)
      document.removeEventListener("visibilitychange", refresh)
      controller.abort()
    }
  }, [])

  const value = useMemo<Sky>(() => {
    const view = skyView({ hour: live.hour, weather: live.weather, date: new Date() })
    const words = live.known ? `, ${WEATHER[live.weather].label.toLowerCase()}` : ""
    const temperature = live.temperature === null ? "" : `, ${Math.round(live.temperature)}°C`
    return { ready: live.ready, hour: live.hour, weather: live.weather, cover: live.cover, view, statusLine: `${formatHour(live.hour)} in Coimbatore${words}${temperature}` }
  }, [live])

  useEffect(() => {
    if (!value.ready) return
    for (const [name, colour] of Object.entries(inkVars(value.view.light))) document.documentElement.style.setProperty(name, colour)
  }, [value.ready, value.view.light])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useSky(): Sky {
  const sky = useContext(Context)
  if (!sky) throw new Error("useSky must be used inside SkyProvider")
  return sky
}
