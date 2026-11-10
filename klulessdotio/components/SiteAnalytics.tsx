"use client"

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next"
import { redactUrl } from "@/lib/analytics"

const beforeSend = (event: BeforeSendEvent): BeforeSendEvent => ({ ...event, url: redactUrl(event.url) })

/** Vercel Web Analytics, with kit and unsubscribe tokens taken out of every address before it's sent. */
export function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />
}
