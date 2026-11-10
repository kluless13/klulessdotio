import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"

const seen = vi.hoisted(() => ({ props: null as null | { beforeSend?: (e: { type: "pageview"; url: string }) => unknown } }))
vi.mock("@vercel/analytics/next", () => ({
  Analytics: (props: typeof seen.props) => {
    seen.props = props
    return null
  },
}))

import { SiteAnalytics } from "@/components/SiteAnalytics"
import { redactUrl } from "@/lib/analytics"

afterEach(cleanup)

describe("redactUrl", () => {
  it("hides the token in a kit link", () => {
    expect(redactUrl("https://1tx.dev/kit/abc.def")).toBe("https://1tx.dev/kit/[token]")
    expect(redactUrl("/kit/abc.def")).toBe("/kit/[token]")
    expect(redactUrl("https://1tx.dev/kit/abc.def?hour=12#step-2")).toBe("https://1tx.dev/kit/[token]?hour=12#step-2")
  })

  it("leaves the kit signup page alone", () => {
    expect(redactUrl("https://1tx.dev/kit")).toBe("https://1tx.dev/kit")
    expect(redactUrl("/kit?ref=writing")).toBe("/kit?ref=writing")
  })

  it("drops a token query parameter from any page, keeping the rest", () => {
    expect(redactUrl("https://1tx.dev/unsubscribe?token=x&status=done")).toBe("https://1tx.dev/unsubscribe?status=done")
    expect(redactUrl("/unsubscribe?token=x")).toBe("/unsubscribe")
  })

  it("leaves an unrelated URL exactly as it was", () => {
    const url = "https://1tx.dev/writing/the-99-point-gap?utm_source=x%20y&a=1"
    expect(redactUrl(url)).toBe(url)
    expect(redactUrl("/library/geist")).toBe("/library/geist")
    expect(redactUrl("/kitchen/abc")).toBe("/kitchen/abc")
  })

  it("passes an address it can't read through untouched", () => {
    expect(redactUrl("http://[bad")).toBe("http://[bad")
  })
})

describe("SiteAnalytics", () => {
  it("redacts every event before it is sent", () => {
    render(<SiteAnalytics />)
    expect(seen.props?.beforeSend?.({ type: "pageview", url: "https://1tx.dev/kit/abc.def" })).toEqual({
      type: "pageview",
      url: "https://1tx.dev/kit/[token]",
    })
  })
})
