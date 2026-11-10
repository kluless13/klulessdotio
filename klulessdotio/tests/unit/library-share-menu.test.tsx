import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ShareMenu } from "@/components/library/ShareMenu"

function renderMenu(overrides: Partial<Parameters<typeof ShareMenu>[0]> = {}) {
  const props = { slug: "weighted", title: "Weighted", onClose: vi.fn(), onCopied: vi.fn(), ...overrides }
  render(<ShareMenu {...props} />)
  return props
}

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
  return writeText
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  Reflect.deleteProperty(navigator, "share")
  Reflect.deleteProperty(navigator, "clipboard")
})

describe("ShareMenu", () => {
  it("hides More options where there is no share sheet", () => {
    renderMenu()
    expect(screen.getByRole("menuitem", { name: /Copy link/ })).toBeTruthy()
    expect(screen.getByText("1tx.dev/library/weighted")).toBeTruthy()
    expect(screen.queryByText("More options")).toBeNull()
  })

  it("offers the device's share sheet where there is one", async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "share", { value: share, configurable: true })
    const props = renderMenu()
    expect(screen.getByText("Your device's share sheet")).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByRole("menuitem", { name: /More options/ }))
    })
    expect(share).toHaveBeenCalledWith({ title: "Weighted", url: "https://1tx.dev/library/weighted" })
    expect(props.onClose).toHaveBeenCalled()
  })

  it("copies the item's full address and reports it", async () => {
    const writeText = stubClipboard()
    const props = renderMenu()
    await act(async () => {
      fireEvent.click(screen.getByRole("menuitem", { name: /Copy link/ }))
    })
    expect(writeText).toHaveBeenCalledWith("https://1tx.dev/library/weighted")
    expect(props.onCopied).toHaveBeenCalled()
    expect(props.onClose).toHaveBeenCalled()
  })

  it("closes on Escape without the key reaching the sheet", () => {
    const parent = vi.fn()
    const onClose = vi.fn()
    render(
      <div onKeyDown={parent}>
        <ShareMenu slug="weighted" title="Weighted" onClose={onClose} onCopied={vi.fn()} />
      </div>,
    )
    const windowListener = vi.fn()
    window.addEventListener("keydown", windowListener)
    fireEvent.keyDown(screen.getByRole("menuitem", { name: /Copy link/ }), { key: "Escape" })
    window.removeEventListener("keydown", windowListener)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(parent).not.toHaveBeenCalled()
    expect(windowListener).not.toHaveBeenCalled()
  })

  it("moves focus to its first item when it opens", () => {
    renderMenu()
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: /Copy link/ }))
  })

  it("closes on a click outside, but not on a click inside", () => {
    const props = renderMenu()
    fireEvent.pointerDown(screen.getByText("1tx.dev/library/weighted"))
    expect(props.onClose).not.toHaveBeenCalled()
    fireEvent.pointerDown(document.body)
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })
})
