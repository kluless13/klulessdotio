import { describe, expect, it, vi } from "vitest"
import { readView, writeView } from "@/lib/library/view-pref"

const KEY = "1tx-library-view"

function memory(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe("readView", () => {
  it("defaults to grid without storage", () => {
    expect(readView(null)).toBe("grid")
  })

  it("defaults to grid when nothing is stored", () => {
    expect(readView(memory())).toBe("grid")
  })

  it("reads a stored list back as list", () => {
    expect(readView(memory({ [KEY]: "list" }))).toBe("list")
  })

  it("reads a stored grid back as grid", () => {
    expect(readView(memory({ [KEY]: "grid" }))).toBe("grid")
  })

  it("reads a garbage value as grid", () => {
    expect(readView(memory({ [KEY]: "tiles, please" }))).toBe("grid")
  })

  it("reads as grid when getItem throws", () => {
    const blocked = {
      getItem: () => {
        throw new Error("SecurityError")
      },
    }
    expect(readView(blocked)).toBe("grid")
  })
})

describe("writeView", () => {
  it("stores the view under the library key", () => {
    const storage = memory()
    writeView(storage, "list")
    expect(storage.getItem(KEY)).toBe("list")
    expect(readView(storage)).toBe("list")
  })

  it("does nothing without storage", () => {
    expect(() => writeView(null, "list")).not.toThrow()
  })

  it("does not throw when setItem throws", () => {
    const setItem = vi.fn(() => {
      throw new Error("QuotaExceededError")
    })
    expect(() => writeView({ setItem }, "list")).not.toThrow()
    expect(setItem).toHaveBeenCalledWith(KEY, "list")
  })
})
