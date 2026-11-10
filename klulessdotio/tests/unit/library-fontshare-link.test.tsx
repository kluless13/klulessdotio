import { afterEach, describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { cleanup, fireEvent, render } from "@testing-library/react"
const { stub } = vi.hoisted(() => ({
  stub: (name: string) => ({ style: { fontFamily: name }, variable: "" }),
}))

vi.mock("next/font/google", () => ({
  Inter: () => stub("Inter Stub"),
  Averia_Serif_Libre: () => stub("Averia Stub"),
  Newsreader: () => stub("Newsreader Stub"),
  EB_Garamond: () => stub("EB Garamond Stub"),
  Fraunces: () => stub("Fraunces Stub"),
}))
vi.mock("geist/font/sans", () => ({ GeistSans: stub("Geist Stub") }))

import { FontshareLink } from "@/components/library/FontshareLink"
import { FONTSHARE_STYLESHEET } from "@/lib/library/fonts"

afterEach(cleanup)

describe("FontshareLink", () => {
  it("starts print-only so it does not block rendering, then applies to all media once loaded", () => {
    const { container } = render(<FontshareLink />)
    const link = container.querySelector<HTMLLinkElement>('link[rel="stylesheet"]')
    expect(link?.getAttribute("href")).toBe(FONTSHARE_STYLESHEET)
    expect(link?.media).toBe("print")
    fireEvent.load(link as HTMLLinkElement)
    expect(link?.media).toBe("all")
  })

  it("keeps a noscript fallback with the plain stylesheet", () => {
    // The browser renders no noscript children on the client, so check what the server sends.
    const html = renderToStaticMarkup(<FontshareLink />)
    expect(html).toMatch(/<noscript><link rel="stylesheet" href="[^"]*fontshare[^"]*"\/><\/noscript>/)
  })
})
