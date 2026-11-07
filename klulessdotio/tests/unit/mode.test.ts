import { describe, expect, it } from "vitest"
import { readMode, writeMode } from "@/lib/mode"

const memory = () => {
  const store = new Map<string, string>()
  return { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
}
const blocked = {
  getItem: () => { throw new Error("blocked") },
  setItem: () => { throw new Error("blocked") },
}

describe("mode store", () => {
  it("defaults to Noise", () => {
    expect(readMode(memory())).toBe("noise")
    expect(readMode(null)).toBe("noise")
  })
  it("remembers the choice", () => {
    const storage = memory()
    writeMode(storage, "quiet")
    expect(readMode(storage)).toBe("quiet")
  })
  it("ignores unknown values", () => {
    const storage = memory()
    storage.setItem("1tx-mode", "loud")
    expect(readMode(storage)).toBe("noise")
  })
  it("still works when storage is blocked", () => {
    expect(readMode(blocked)).toBe("noise")
    expect(() => writeMode(blocked, "quiet")).not.toThrow()
  })
})
