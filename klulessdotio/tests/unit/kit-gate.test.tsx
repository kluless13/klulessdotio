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
    await screen.findByText("Check your inbox. Your link works for good.")

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

  it("shows the success line and hides the form on a 200", async () => {
    globalThis.fetch = reply(200) as unknown as typeof fetch
    render(<KitGate />)
    submit("reader@example.com")
    expect(await screen.findByText("Check your inbox. Your link works for good.")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Send me the kit" })).toBeNull()
  })

  it("moves focus to the status message once sent, so keyboard users keep their place", async () => {
    globalThis.fetch = reply(200) as unknown as typeof fetch
    render(<KitGate />)
    submit("reader@example.com")
    const status = await screen.findByText("Check your inbox. Your link works for good.")
    await waitFor(() => expect(document.activeElement).toBe(status))
    expect(status.getAttribute("tabindex")).toBe("-1")
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

  it("shows the form copy and no email address, before or after sending", async () => {
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
    await screen.findByText("Check your inbox. Your link works for good.")
    expect(container.textContent).not.toContain("@")
  })
})
