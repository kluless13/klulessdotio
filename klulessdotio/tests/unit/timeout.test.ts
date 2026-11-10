import { describe, it, expect, vi, afterEach } from "vitest"
import { withTimeout } from "@/lib/timeout"

afterEach(() => vi.useRealTimers())

describe("withTimeout", () => {
  it("resolves when the promise settles before the deadline", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 1000)).resolves.toBe("ok")
  })

  it("passes through the promise's own rejection", async () => {
    await expect(withTimeout(Promise.reject(new Error("boom")), 1000)).rejects.toThrow("boom")
  })

  it("rejects with timeout after the deadline", async () => {
    vi.useFakeTimers()
    const pending = withTimeout(new Promise<never>(() => {}), 5000)
    const assertion = expect(pending).rejects.toThrow("timeout")
    await vi.advanceTimersByTimeAsync(5000)
    await assertion
  })

  it("clears its timer on success and on failure", async () => {
    vi.useFakeTimers()
    await withTimeout(Promise.resolve(1), 1000)
    expect(vi.getTimerCount()).toBe(0)
    await withTimeout(Promise.reject(new Error("x")), 1000).catch(() => {})
    expect(vi.getTimerCount()).toBe(0)
  })
})
