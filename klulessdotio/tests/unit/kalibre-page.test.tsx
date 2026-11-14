import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { joinList, leaveList } from "@/components/kalibre/listStore"
import { Nav } from "@/components/kalibre/Nav"
import { Steps } from "@/components/kalibre/Steps"
import { Accounts, Community, Footer, Hero, Priority } from "@/components/kalibre/Sections"
import { NextStepsModal } from "@/components/kalibre/NextStepsModal"
import { Select } from "@/components/kalibre/Select"

type ObserverCallback = (entries: { isIntersecting: boolean; target: Element }[]) => void
const observers: { callback: ObserverCallback; targets: Element[] }[] = []

class FakeObserver {
  private readonly record: { callback: ObserverCallback; targets: Element[] }
  constructor(callback: ObserverCallback) {
    this.record = { callback, targets: [] }
    observers.push(this.record)
  }
  observe(target: Element) {
    this.record.targets.push(target)
  }
  disconnect() {}
  unobserve() {}
}

let coarse = false

beforeEach(() => {
  observers.length = 0
  coarse = false
  vi.stubGlobal("IntersectionObserver", FakeObserver)
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({ matches: coarse && query.includes("coarse"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
})

afterEach(() => {
  cleanup()
  act(() => leaveList())
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.documentElement.style.overflow = ""
})

describe("Nav", () => {
  it("marks the section being read, and nothing between sections", () => {
    render(
      <>
        <Nav />
        <section id="drawdown" />
      </>,
    )
    const section = document.getElementById("drawdown") as Element
    act(() => observers.forEach(({ callback }) => callback([{ isIntersecting: true, target: section }])))
    expect(screen.getByRole("link", { name: "Drawdown" }).getAttribute("aria-current")).toBe("true")
    act(() => observers.forEach(({ callback }) => callback([{ isIntersecting: false, target: section }])))
    expect(screen.getByRole("link", { name: "Drawdown" }).getAttribute("aria-current")).toBeNull()
  })

  it("opens the phone menu, locks the page and closes again", () => {
    vi.useFakeTimers()
    render(<Nav />)
    fireEvent.click(screen.getByRole("button", { name: /Menu/ }))
    const menu = screen.getByRole("dialog", { name: "Menu" })
    expect(document.documentElement.style.overflow).toBe("hidden")
    expect(within(menu).getAllByRole("link")).toHaveLength(7)
    fireEvent.keyDown(menu, { key: "Escape" })
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"))
    })
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull()
    expect(document.documentElement.style.overflow).toBe("")
    act(() => vi.advanceTimersByTime(10))
    // Focus goes back to the button that opened it
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Menu/ }))
  })

  it("closes the menu when a link is tapped and takes focus to that section", () => {
    vi.useFakeTimers()
    render(
      <>
        <Nav />
        <section id="community" />
      </>,
    )
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    fireEvent.click(screen.getByRole("button", { name: /Menu/ }))
    const menu = screen.getByRole("dialog", { name: "Menu" })
    fireEvent.click(within(menu).getByRole("link", { name: /Community/ }))
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"))
      vi.advanceTimersByTime(100)
    })
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull()
    expect(document.activeElement?.id).toBe("community")
    expect(scrollIntoView).toHaveBeenCalled()
  })

  it("keeps keyboard focus inside the open menu", () => {
    render(<Nav />)
    fireEvent.click(screen.getByRole("button", { name: /Menu/ }))
    const menu = screen.getByRole("dialog", { name: "Menu" })
    const close = within(menu).getByRole("button", { name: "Close menu" })
    const mail = within(menu).getByRole("link", { name: "hello@kalibretrades.com" })
    mail.focus()
    fireEvent.keyDown(menu, { key: "Tab" })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(menu, { key: "Tab", shiftKey: true })
    expect(document.activeElement).toBe(mail)
  })
})

describe("Steps", () => {
  it("climbs the bars to £100k on hover and settles back on £50k", () => {
    vi.useFakeTimers()
    render(<Steps />)
    const card = screen.getByText("Pick your account size").closest("article") as HTMLElement
    const lit = () => Array.from(card.querySelectorAll(".kt-bar")).findIndex((bar) => bar.hasAttribute("data-lit"))
    expect(lit()).toBe(2)
    fireEvent.pointerEnter(card)
    act(() => vi.advanceTimersByTime(500))
    expect(lit()).toBe(3)
    fireEvent.pointerLeave(card)
    expect(lit()).toBe(2)
  })

  it("plays the candles and lifts the halftone card on hover", () => {
    render(<Steps />)
    const candles = screen.getByText("Trade the evaluation").closest("article") as HTMLElement
    fireEvent.pointerEnter(candles)
    expect(candles.querySelector(".kt-candles-fg")?.hasAttribute("data-play")).toBe(true)
    const funded = screen.getByText("Get funded").closest("article") as HTMLElement
    fireEvent.pointerEnter(funded)
    expect(funded.hasAttribute("data-active")).toBe(true)
    expect(funded.querySelector(".kt-halftone-ripple")).not.toBeNull()
  })

  it("plays once on scroll into view on a phone", () => {
    coarse = true
    vi.useFakeTimers()
    render(<Steps />)
    const card = screen.getByText("Pick your account size").closest("article") as HTMLElement
    act(() => observers.forEach(({ callback, targets }) => callback(targets.map((target) => ({ isIntersecting: true, target })))))
    expect(card.hasAttribute("data-active")).toBe(true)
    act(() => vi.advanceTimersByTime(2000))
    expect(Array.from(card.querySelectorAll(".kt-bar")).findIndex((bar) => bar.hasAttribute("data-lit"))).toBe(2)
  })
})

describe("page sections", () => {
  it("renders the hero, accounts, community, closing form and footer copy", () => {
    render(
      <>
        <Hero />
        <Accounts />
        <Community />
        <Priority />
        <Footer />
      </>,
    )
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Get paid on time.")
    expect(screen.getByRole("heading", { name: "Choose your account size" })).toBeTruthy()
    expect(screen.getByRole("link", { name: /Join Discord/ }).getAttribute("href")).toBe("#register")
    expect(screen.getAllByRole("combobox", { name: /Where are you based/ })).toHaveLength(2)
    expect(screen.getByText(/A concept site for KalibreTrades/)).toBeTruthy()
    expect(screen.getAllByRole("link", { name: "Privacy notice" }).every((link) => link.getAttribute("href") === "/kalibre/privacy")).toBe(true)
  })
})

describe("hero once listed", () => {
  it("drops the form heading when someone is already on the list", () => {
    render(<Hero />)
    expect(screen.getByRole("heading", { name: "Get priority access" })).toBeTruthy()
    act(() => joinList({ firstName: "Sam", email: "sam@example.com", outcome: "added" }))
    expect(screen.queryByRole("heading", { name: "Get priority access" })).toBeNull()
    expect(screen.getByRole("status").textContent).toContain("You’re on the list, Sam.")
  })
})

describe("NextStepsModal", () => {
  it("closes on Escape and keeps focus inside", () => {
    const onClose = vi.fn()
    render(<NextStepsModal firstName="Amira" email="amira@example.com" onClose={onClose} />)
    const dialog = screen.getByRole("dialog")
    const ok = screen.getByRole("button", { name: "Got it" })
    const close = screen.getByRole("button", { name: "Close" })
    expect(document.activeElement).toBe(ok)
    fireEvent.keyDown(dialog, { key: "Tab" })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true })
    expect(document.activeElement).toBe(ok)
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe("Select on a phone", () => {
  it("uses the phone's own picker", () => {
    coarse = true
    const onChange = vi.fn()
    render(<Select id="r" label="Where are you based?" placeholder="Select your region" options={["Europe", "Elsewhere"]} value="" onChange={onChange} />)
    const native = screen.getByLabelText(/Where are you based/) as HTMLSelectElement
    expect(native.tagName).toBe("SELECT")
    fireEvent.change(native, { target: { value: "Europe" } })
    expect(onChange).toHaveBeenCalledWith("Europe")
  })
})
