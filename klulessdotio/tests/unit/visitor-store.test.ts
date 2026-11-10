import { describe, expect, it } from "vitest"
import { isClosed, markClosed, readVisitor, writeVisitor } from "@/lib/visitor-store"

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) }
}
const throwing = {
  getItem: () => {
    throw new Error("blocked")
  },
  setItem: () => {
    throw new Error("blocked")
  },
}

describe("visitor store", () => {
  it("round trips a number", () => {
    const s = memory()
    writeVisitor(s, 42)
    expect(s.data["1tx-visitor"]).toBe("42")
    expect(readVisitor(s)).toBe(42)
  })

  it.each(["abc", "0", "-3", "1.5", ""])("reads %j as null", (raw) => {
    expect(readVisitor(memory({ "1tx-visitor": raw }))).toBeNull()
  })

  it("reads missing as null", () => {
    expect(readVisitor(memory())).toBeNull()
  })

  it("tracks the closed flag", () => {
    const s = memory()
    expect(isClosed(s)).toBe(false)
    markClosed(s)
    expect(s.data["1tx-visitor-closed"]).toBe("1")
    expect(isClosed(s)).toBe(true)
  })

  it("is safe when storage throws", () => {
    expect(readVisitor(throwing)).toBeNull()
    expect(() => writeVisitor(throwing, 3)).not.toThrow()
    expect(isClosed(throwing)).toBe(false)
    expect(() => markClosed(throwing)).not.toThrow()
  })

  it("is safe with null storage", () => {
    expect(readVisitor(null)).toBeNull()
    expect(() => writeVisitor(null, 3)).not.toThrow()
    expect(isClosed(null)).toBe(false)
    expect(() => markClosed(null)).not.toThrow()
  })
})
