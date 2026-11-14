import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { leaveList } from "@/components/kalibre/listStore"
import { SignupForm } from "@/components/kalibre/SignupForm"
import { AccountSlider } from "@/components/kalibre/AccountSlider"
import { Drawdown } from "@/components/kalibre/Drawdown"
import { Caroline } from "@/components/kalibre/Caroline"
import { Odometer } from "@/components/kalibre/Odometer"
import { ListCta } from "@/components/kalibre/ListCta"
import { menuKeyAction } from "@/components/kalibre/Select"
import { DEMO_STORE_KEY, MESSAGES } from "@/lib/kalibre/signup"

class StubObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

beforeEach(() => {
  window.localStorage.clear()
  vi.stubGlobal("IntersectionObserver", StubObserver)
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
})

afterEach(() => {
  cleanup()
  act(() => leaveList())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

function chooseRegion(region: string) {
  fireEvent.click(screen.getByRole("combobox", { name: /Where are you based/ }))
  fireEvent.click(screen.getByRole("option", { name: region }))
}

function fillHero(email: string) {
  type("First name", "Amira")
  type("Email", email)
  chooseRegion("Europe")
}

describe("SignupForm", () => {
  it("explains every missing answer and moves focus to the first one", () => {
    render(<SignupForm idPrefix="t" askStartingPoint={false} />)
    fireEvent.click(screen.getByRole("button", { name: "Get priority access" }))
    expect(screen.getByText(MESSAGES.firstName)).toBeTruthy()
    expect(screen.getByText(MESSAGES.emailMissing)).toBeTruthy()
    expect(screen.getByText(MESSAGES.region)).toBeTruthy()
    expect(document.activeElement?.id).toBe("t-firstName")
  })

  it("clears an error as soon as it is fixed, and checks a field on leaving it", () => {
    render(<SignupForm idPrefix="t" askStartingPoint={false} />)
    fireEvent.click(screen.getByRole("button", { name: "Get priority access" }))
    type("First name", "A")
    expect(screen.queryByText(MESSAGES.firstName)).toBeNull()
    type("Email", "amira")
    fireEvent.blur(screen.getByLabelText("Email"))
    expect(screen.getByText(MESSAGES.emailAt)).toBeTruthy()
  })

  it("sends, shows the list confirmation and opens the what's-next window", () => {
    vi.useFakeTimers()
    render(<SignupForm idPrefix="t" askStartingPoint={false} />)
    fillHero("amira@example.com")
    fireEvent.click(screen.getByRole("button", { name: "Get priority access" }))
    expect(screen.getByRole("button", { name: /Sending/ })).toBeTruthy()
    act(() => vi.advanceTimersByTime(1300))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByText("You’re on the list, Amira.")).toBeTruthy()
    expect(within(dialog).getByText(/amira@example.com/)).toBeTruthy()
    fireEvent.click(within(dialog).getByRole("button", { name: "Got it" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByRole("status").textContent).toContain("You’re on the list, Amira.")
    expect(window.localStorage.getItem(DEMO_STORE_KEY)).toContain("amira@example.com")
  })

  it("says so kindly when the address is already on the list, and lets you try another", () => {
    vi.useFakeTimers()
    window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(["amira@example.com"]))
    render(<SignupForm idPrefix="t" askStartingPoint={false} />)
    fillHero("amira@example.com")
    fireEvent.click(screen.getByRole("button", { name: "Get priority access" }))
    act(() => vi.advanceTimersByTime(1300))
    expect(screen.getByText("You’re already on the list.")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Use a different email" }))
    expect((screen.getByLabelText("First name") as HTMLInputElement).value).toBe("Amira")
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("")
  })

  it("keeps the answers and offers a retry when the send fails", () => {
    vi.useFakeTimers()
    render(<SignupForm idPrefix="t" askStartingPoint />)
    fillHero("fail@example.com")
    fireEvent.click(screen.getByRole("combobox", { name: /Starting point/ }))
    fireEvent.click(screen.getByRole("option", { name: "New to trading" }))
    fireEvent.click(screen.getByRole("button", { name: "Get priority access" }))
    act(() => vi.advanceTimersByTime(1300))
    expect(screen.getByRole("alert").textContent).toContain("didn’t go through")
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy()
    act(() => vi.advanceTimersByTime(10))
    expect(document.activeElement?.id).toBe("t-submit")
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("fail@example.com")
  })

  it("lets the region menu be used from the keyboard", () => {
    render(<SignupForm idPrefix="t" askStartingPoint={false} />)
    const trigger = screen.getByRole("combobox", { name: /Where are you based/ })
    fireEvent.keyDown(trigger, { key: "ArrowDown" })
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    fireEvent.keyDown(trigger, { key: "ArrowDown" })
    fireEvent.keyDown(trigger, { key: "Enter" })
    expect(trigger.textContent).toContain("Europe")
    fireEvent.keyDown(trigger, { key: "ArrowDown" })
    fireEvent.keyDown(trigger, { key: "End" })
    fireEvent.keyDown(trigger, { key: "Escape" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(trigger.textContent).toContain("Europe")
  })
})

describe("shared list state", () => {
  it("updates the other form and every priority button after one sign-up", () => {
    vi.useFakeTimers()
    render(
      <>
        <ListCta className="kt-btn--gold" />
        <div data-testid="hero">
          <SignupForm idPrefix="hero" askStartingPoint={false} />
        </div>
        <div data-testid="closing">
          <SignupForm idPrefix="closing" askStartingPoint />
        </div>
      </>,
    )
    expect(screen.getByRole("link", { name: "Get priority access" })).toBeTruthy()
    const closing = within(screen.getByTestId("closing"))
    fireEvent.change(closing.getByLabelText("First name"), { target: { value: "Sam" } })
    fireEvent.change(closing.getByLabelText("Email"), { target: { value: "sam@example.com" } })
    fireEvent.click(closing.getByRole("combobox", { name: /Where are you based/ }))
    fireEvent.click(closing.getByRole("option", { name: "Elsewhere" }))
    fireEvent.click(closing.getByRole("button", { name: "Get priority access" }))
    act(() => vi.advanceTimersByTime(1300))
    expect(within(screen.getByTestId("hero")).getByRole("status").textContent).toContain("You’re on the list, Sam.")
    expect(screen.queryByRole("link", { name: "Get priority access" })).toBeNull()
    expect(screen.getAllByText("You’re on the list").length).toBe(1)
    // Only the form that was used opens the what's-next window
    expect(screen.getAllByRole("dialog")).toHaveLength(1)
  })

  it("shows the already-on-the-list note in both forms, and lets the first finished send win", () => {
    vi.useFakeTimers()
    window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(["sam@example.com"]))
    render(
      <>
        <div data-testid="hero">
          <SignupForm idPrefix="hero" askStartingPoint={false} />
        </div>
        <div data-testid="closing">
          <SignupForm idPrefix="closing" askStartingPoint />
        </div>
      </>,
    )
    const fill = (scope: ReturnType<typeof within>, name: string, email: string) => {
      fireEvent.change(scope.getByLabelText("First name"), { target: { value: name } })
      fireEvent.change(scope.getByLabelText("Email"), { target: { value: email } })
      fireEvent.click(scope.getByRole("combobox", { name: /Where are you based/ }))
      fireEvent.click(scope.getByRole("option", { name: "Europe" }))
      fireEvent.click(scope.getByRole("button", { name: "Get priority access" }))
    }
    fill(within(screen.getByTestId("closing")), "Sam", "sam@example.com")
    act(() => vi.advanceTimersByTime(200))
    fill(within(screen.getByTestId("hero")), "Kit", "kit@example.com")
    act(() => vi.advanceTimersByTime(1300))
    expect(screen.getAllByText("You’re already on the list.")).toHaveLength(2)
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.queryByText(/Kit/)).toBeNull()
    act(() => vi.advanceTimersByTime(10))
    expect(document.activeElement?.id).toBe("closing-result")
  })
})

describe("menu keys", () => {
  it("follows the select-only pattern", () => {
    expect(menuKeyAction("ArrowDown", false, -1, 7)).toEqual({ kind: "open" })
    expect(menuKeyAction("x", false, -1, 7)).toEqual({ kind: "none" })
    expect(menuKeyAction("ArrowUp", true, 0, 7)).toEqual({ kind: "move", to: 0 })
    expect(menuKeyAction("End", true, 0, 7)).toEqual({ kind: "move", to: 6 })
    expect(menuKeyAction("Tab", true, 3, 7)).toEqual({ kind: "choose", index: 3, keepFocus: false })
    expect(menuKeyAction("Tab", true, -1, 7)).toEqual({ kind: "close" })
    expect(menuKeyAction("Enter", true, -1, 7)).toEqual({ kind: "none" })
    expect(menuKeyAction("q", true, 2, 7)).toEqual({ kind: "none" })
  })
})

describe("AccountSlider", () => {
  it("changes size from the labels and the arrow keys", () => {
    render(<AccountSlider />)
    const slider = screen.getByRole("slider", { name: "Account size" })
    expect(slider.getAttribute("aria-valuenow")).toBe("50000")
    fireEvent.click(screen.getByRole("button", { name: "£10k" }))
    expect(slider.getAttribute("aria-valuenow")).toBe("10000")
    expect(screen.getAllByText("£9,200").length).toBeGreaterThan(0)
    fireEvent.keyDown(slider, { key: "End" })
    expect(slider.getAttribute("aria-valuetext")).toBe("£100,000")
    fireEvent.keyDown(slider, { key: "ArrowLeft" })
    expect(slider.getAttribute("aria-valuenow")).toBe("50000")
    fireEvent.keyDown(slider, { key: "Home" })
    expect(slider.getAttribute("aria-valuenow")).toBe("10000")
  })
})

describe("Drawdown", () => {
  it("switches floors and swaps the figures", () => {
    render(<Drawdown />)
    expect(screen.getAllByText("£46,000").length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole("radio", { name: "Trailing floor" }))
    expect(screen.getByRole("radio", { name: "Trailing floor" }).getAttribute("aria-checked")).toBe("true")
    expect(screen.getAllByText("£51,800").length).toBeGreaterThan(0)
    fireEvent.keyDown(screen.getByRole("radio", { name: "Trailing floor" }), { key: "ArrowLeft" })
    expect(screen.getByRole("radio", { name: "Static floor" }).getAttribute("aria-checked")).toBe("true")
  })
})

describe("Caroline", () => {
  it("opens the books list and links each book to Amazon", () => {
    render(<Caroline />)
    const button = screen.getByRole("button", { name: /Read her books/ })
    expect(screen.queryByText("Sovereign Signals")).toBeNull()
    fireEvent.click(button)
    expect(button.getAttribute("aria-expanded")).toBe("true")
    const link = screen.getByText("Sovereign Signals").closest("a")
    expect(link?.getAttribute("href")).toContain("amazon.co.uk")
    expect(link?.getAttribute("target")).toBe("_blank")
  })

  it("names each degree on its logo", () => {
    render(<Caroline />)
    const oxford = screen.getByRole("button", { name: "MA, University of Oxford" })
    fireEvent.focus(oxford)
    expect(oxford.closest("li")?.hasAttribute("data-open")).toBe(true)
  })
})

describe("Odometer", () => {
  it("gives screen readers the plain figure", () => {
    render(<Odometer text="£4,000" />)
    expect(screen.getByText("£4,000").className).toBe("kt-sr")
  })
})
