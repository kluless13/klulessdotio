import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { KitGate } from "@/components/kit/KitGate"

const realFetch = globalThis.fetch

function reply(status: number, body: Record<string, unknown> = {}) {
  return vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => body }))
}

function submit(email: string) {
  fireEvent.change(screen.getByPlaceholderText("Your email"), { target: { value: email } })
  fireEvent.click(screen.getByRole("button", { name: "Send me the kit" }))
}

afterEach(() => {
  cleanup()
  globalThis.fetch = realFetch
})

describe("KitGate", () => {
  it("posts the kit payload to the subscribe API", async () => {
    const fetchMock = reply(200)
    globalThis.fetch = fetchMock as unknown as typeof fetch
    render(<KitGate />)
    submit("  reader@example.com ")
    await screen.findByRole("heading", { name: "It's on its way." })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("/api/subscribe")
    expect(init.method).toBe("POST")
    expect(JSON.parse(String(init.body))).toEqual({
      kind: "kit",
      kit: "starter-kit",
      email: "reader@example.com",
      consent: true,
      company_url: "",
    })
  })

  it("shows the sent state with the reader's own address and hides the form on a 200", async () => {
    globalThis.fetch = reply(200) as unknown as typeof fetch
    render(<KitGate />)
    submit("reader@example.com")
    expect(await screen.findByRole("heading", { name: "It's on its way." })).toBeTruthy()
    expect(screen.getByText("Sent to reader@example.com. Your link works for good.")).toBeTruthy()
    expect(screen.getByText("Not in your inbox? Check Promotions and drag it to Primary.")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Send me the kit" })).toBeNull()
    expect(screen.queryByRole("heading", { name: "Unlock it for free" })).toBeNull()
  })

  it("moves focus to the sent heading, so keyboard and screen reader users hear it", async () => {
    globalThis.fetch = reply(200) as unknown as typeof fetch
    render(<KitGate />)
    submit("reader@example.com")
    const heading = await screen.findByRole("heading", { name: "It's on its way." })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(heading.getAttribute("tabindex")).toBe("-1")
  })

  it("shows a sending state while the request is in flight", async () => {
    let finish: (value: unknown) => void = () => undefined
    globalThis.fetch = vi.fn(
      () => new Promise((resolve) => (finish = resolve))
    ) as unknown as typeof fetch
    render(<KitGate />)
    submit("reader@example.com")
    const button = await screen.findByRole("button", { name: "Sending" })
    expect(button.getAttribute("aria-disabled")).toBe("true")
    fireEvent.click(button)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("textbox", { name: "Email" }).hasAttribute("readonly")).toBe(true)
    finish({ ok: true, status: 200, json: async () => ({}) })
    expect(await screen.findByRole("heading", { name: "It's on its way." })).toBeTruthy()
  })

  it("Try again brings the form back with the address kept and focused", async () => {
    globalThis.fetch = reply(200) as unknown as typeof fetch
    render(<KitGate />)
    submit("reader@example.com")
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }))
    const input = screen.getByRole("textbox", { name: "Email" }) as HTMLInputElement
    expect(input.value).toBe("reader@example.com")
    await waitFor(() => expect(document.activeElement).toBe(input))
    expect(screen.getByRole("button", { name: "Send me the kit" })).toBeTruthy()
  })

  it("shows the rate-limited message on a 429", async () => {
    globalThis.fetch = reply(429, { error: "rate_limited" }) as unknown as typeof fetch
    render(<KitGate />)
    submit("reader@example.com")
    expect(await screen.findByText("Too many tries. Give it an hour.")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Send me the kit" })).toBeTruthy()
  })

  it("shows the invalid email and server messages", async () => {
    globalThis.fetch = reply(400, { error: "invalid_email" }) as unknown as typeof fetch
    render(<KitGate />)
    submit("nope@nope")
    expect(await screen.findByText("That email doesn't look right.")).toBeTruthy()

    globalThis.fetch = vi.fn(async () => {
      throw new Error("offline")
    }) as unknown as typeof fetch
    fireEvent.click(screen.getByRole("button", { name: "Send me the kit" }))
    expect(await screen.findByText("Something went wrong on my end. Try again in a minute.")).toBeTruthy()
  })

  it("keeps the honeypot out of the accessibility tree and the tab order", () => {
    const { container } = render(<KitGate />)
    const trap = container.querySelector<HTMLInputElement>('input[name="company_url"]')
    expect(trap).not.toBeNull()
    expect(trap?.tabIndex).toBe(-1)
    expect(trap?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it("shows the form copy and no email address before sending, and only the reader's after", async () => {
    globalThis.fetch = reply(200) as unknown as typeof fetch
    const { container } = render(<KitGate />)
    expect(screen.getByRole("heading", { name: "Unlock it for free" })).toBeTruthy()
    expect(
      screen.getByText(
        "Pop in your email and I'll send you the link. You'll also get my occasional posts on working with agents. One click to unsubscribe, any time."
      )
    ).toBeTruthy()
    expect(screen.getByText("The link arrives by email, usually within a minute.")).toBeTruthy()
    expect(container.textContent).not.toContain("@")
    expect(container.querySelector('[placeholder*="@"]')).toBeNull()

    submit("reader@example.com")
    await screen.findByRole("heading", { name: "It's on its way." })
    const addresses = container.textContent?.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? []
    expect(addresses).toEqual(["reader@example.com"])
  })
})
