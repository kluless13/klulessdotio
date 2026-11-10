// @vitest-environment jsdom
import { StrictMode } from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { VisitorToast } from "@/components/VisitorToast"

const ok = (number: number) => ({ ok: true, json: async () => ({ success: true, data: { number } }) })

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.style.removeProperty("--toast-offset-bottom-left")
})

describe("VisitorToast", () => {
  it("never fetches or renders when localStorage access throws", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("blocked")
    })
    const { container } = render(<VisitorToast />)
    await Promise.resolve()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(container.innerHTML).toBe("")
  })

  it("posts exactly once under StrictMode and shows the number", async () => {
    const fetchMock = vi.fn(async () => ok(7))
    vi.stubGlobal("fetch", fetchMock)
    render(
      <StrictMode>
        <VisitorToast />
      </StrictMode>
    )
    await screen.findByText("#7")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("/api/visitor")
    expect(init.method).toBe("POST")
    expect(init.body).toBe("{}")
    expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json")
    expect(screen.getByText("You're visitor")).toBeTruthy()
    expect(window.localStorage.getItem("1tx-visitor")).toBe("7")
  })

  it("welcomes back a stored visitor without fetching", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    window.localStorage.setItem("1tx-visitor", "42")
    render(<VisitorToast />)
    expect(screen.getByText("Welcome back, visitor")).toBeTruthy()
    expect(screen.getByText("#42")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("renders nothing and stores nothing when fetch rejects", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("offline")
    })
    vi.stubGlobal("fetch", fetchMock)
    const { container } = render(<VisitorToast />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    await Promise.resolve()
    expect(container.innerHTML).toBe("")
    expect(window.localStorage.getItem("1tx-visitor")).toBeNull()
  })

  it("renders nothing and stores nothing on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, json: async () => ({ success: false }) })))
    const { container } = render(<VisitorToast />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await Promise.resolve()
    expect(container.innerHTML).toBe("")
    expect(window.localStorage.getItem("1tx-visitor")).toBeNull()
  })

  it("renders nothing and does not fetch when closed this session", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    window.sessionStorage.setItem("1tx-visitor-closed", "1")
    const { container } = render(<VisitorToast />)
    expect(container.innerHTML).toBe("")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("hides on Close and sets the session flag", () => {
    window.localStorage.setItem("1tx-visitor", "42")
    const { container } = render(<VisitorToast />)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(container.innerHTML).toBe("")
    expect(window.sessionStorage.getItem("1tx-visitor-closed")).toBe("1")
  })

  it("sets the stacking offset while visible and removes it on close", () => {
    window.localStorage.setItem("1tx-visitor", "42")
    render(<VisitorToast />)
    expect(document.documentElement.style.getPropertyValue("--toast-offset-bottom-left")).toMatch(/px$/)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(document.documentElement.style.getPropertyValue("--toast-offset-bottom-left")).toBe("")
  })
})
