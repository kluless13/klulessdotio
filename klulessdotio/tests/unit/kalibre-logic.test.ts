import { describe, expect, it } from "vitest"
import {
  ACCOUNT_SIZES,
  figuresFor,
  formatPounds,
  formatShort,
  liveSizeAt,
  nearestSize,
  positionOf,
  stepSize,
} from "@/lib/kalibre/accounts"
import { rollColumns, rollDirection, DIGIT_STAGGER_MS } from "@/lib/kalibre/odometer"
import { BREACH_INDEX, BREACH_POINT, CANDLES, floorStats } from "@/lib/kalibre/chart"
import {
  DEMO_STORE_KEY,
  MESSAGES,
  checkField,
  checkSignup,
  decideOutcome,
  firstProblem,
  readKnownEmails,
  rememberEmail,
} from "@/lib/kalibre/signup"

describe("account figures", () => {
  it("matches the example figures in the design", () => {
    expect(figuresFor(50_000)).toEqual({
      size: 50_000,
      fee: 299,
      earlyBird: 239,
      saving: 60,
      profitTarget: 4_000,
      dailyLossLimit: 2_000,
      drawdownFloor: 46_000,
    })
    expect(figuresFor(10_000).drawdownFloor).toBe(9_200)
    expect(figuresFor(25_000).earlyBird).toBe(143)
    expect(figuresFor(100_000).profitTarget).toBe(8_000)
  })

  it("places the four sizes at equal steps and snaps to the nearest", () => {
    expect(ACCOUNT_SIZES.map(positionOf)).toEqual([0, 1 / 3, 2 / 3, 1])
    expect(nearestSize(0.1)).toBe(10_000)
    expect(nearestSize(0.5)).toBe(50_000)
    expect(nearestSize(0.9)).toBe(100_000)
    expect(nearestSize(-2)).toBe(10_000)
    expect(nearestSize(5)).toBe(100_000)
  })

  it("shows a live size between stops while dragging", () => {
    expect(liveSizeAt(0)).toBe(10_000)
    expect(liveSizeAt(1)).toBe(100_000)
    expect(liveSizeAt(2 / 3 + 0.12)).toBe(68_000)
    expect(liveSizeAt(1 / 6)).toBe(18_000)
  })

  it("steps with the arrow keys and stops at the ends", () => {
    expect(stepSize(50_000, 1)).toBe(100_000)
    expect(stepSize(100_000, 1)).toBe(100_000)
    expect(stepSize(10_000, -1)).toBe(10_000)
    expect(stepSize(25_000, -1)).toBe(10_000)
  })

  it("formats pounds", () => {
    expect(formatPounds(46_000)).toBe("£46,000")
    expect(formatShort(68_000)).toBe("£68k")
  })
})

describe("odometer", () => {
  it("knows which way the figures roll", () => {
    expect(rollDirection(4_000, 8_000)).toBe("up")
    expect(rollDirection(8_000, 4_000)).toBe("down")
    expect(rollDirection(1, 1)).toBe("none")
  })

  it("moves the ones first and keys columns from the right", () => {
    const columns = rollColumns("£46,000")
    expect(columns.map((column) => column.char).join("")).toBe("£46,000")
    expect(columns.at(-1)).toMatchObject({ key: "c0", delayMs: 0, isDigit: true })
    expect(columns[1]).toMatchObject({ char: "4", delayMs: 4 * DIGIT_STAGGER_MS })
    expect(columns[3]).toMatchObject({ char: ",", isDigit: false, delayMs: 0 })
    expect(columns[0]).toMatchObject({ char: "£", isDigit: false })
  })
})

describe("drawdown chart", () => {
  it("breaches the trailing floor on the first big dip after the peak", () => {
    expect(CANDLES).toHaveLength(32)
    expect(BREACH_INDEX).toBe(19)
    expect(BREACH_POINT.x).toBe(463.1)
  })

  it("gives different figures for each floor", () => {
    expect(floorStats("static")).toMatchObject({ floor: 46_000, room: 8_000, otherRoom: 4_000 })
    expect(floorStats("trailing")).toMatchObject({ floor: 51_800, room: 4_000, otherRoom: null })
  })
})

describe("demo sign-up", () => {
  const valid = { firstName: " Amira ", email: "amira@example.com", region: "Europe" }

  it("accepts a complete form and trims the name", () => {
    const result = checkSignup(valid, false)
    expect(result).toEqual({ ok: true, data: { firstName: "Amira", email: "amira@example.com", region: "Europe" } })
  })

  it("keeps the optional starting point only on the closing form", () => {
    const withStart = { ...valid, startingPoint: "New to trading" }
    expect(checkSignup(withStart, true)).toMatchObject({ ok: true, data: { startingPoint: "New to trading" } })
    expect(checkSignup(withStart, false)).toMatchObject({ ok: true, data: { startingPoint: undefined } })
  })

  it("explains each problem in plain words", () => {
    const result = checkSignup({ firstName: "", email: "amira@example", region: "" }, false)
    expect(result).toEqual({
      ok: false,
      errors: { firstName: MESSAGES.firstName, email: MESSAGES.emailDomain, region: MESSAGES.region },
    })
    expect(checkField("email", { ...valid, email: "" }, false)).toBe(MESSAGES.emailMissing)
    expect(checkField("email", { ...valid, email: "amira" }, false)).toBe(MESSAGES.emailAt)
    expect(checkField("email", valid, false)).toBeUndefined()
  })

  it("points at the first field with a problem", () => {
    expect(firstProblem({ region: "x", email: "y" })).toBe("email")
    expect(firstProblem({})).toBeUndefined()
  })

  it("decides what the pretend send does", () => {
    expect(decideOutcome("amira@example.com", [], true)).toBe("added")
    expect(decideOutcome(" Amira@Example.com", ["amira@example.com"], true)).toBe("already")
    expect(decideOutcome("fail@example.com", [], true)).toBe("failed")
    expect(decideOutcome("amira@example.com", [], false)).toBe("failed")
  })

  it("remembers addresses in this browser only, and survives bad storage", () => {
    window.localStorage.clear()
    rememberEmail(window.localStorage, "Amira@example.com")
    rememberEmail(window.localStorage, "amira@example.com")
    expect(readKnownEmails(window.localStorage)).toEqual(["amira@example.com"])
    window.localStorage.setItem(DEMO_STORE_KEY, "{not json")
    expect(readKnownEmails(window.localStorage)).toEqual([])
    window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(["a@b.co", 4]))
    expect(readKnownEmails(window.localStorage)).toEqual(["a@b.co"])
    expect(readKnownEmails(null)).toEqual([])
    window.localStorage.clear()
    ;["a", "b", "c", "d", "e", "f"].forEach((name) => rememberEmail(window.localStorage, `${name}@x.co`))
    expect(readKnownEmails(window.localStorage)).toEqual(["b@x.co", "c@x.co", "d@x.co", "e@x.co", "f@x.co"])
    const broken = { getItem: () => { throw new Error("blocked") }, setItem: () => { throw new Error("blocked") } }
    expect(() => rememberEmail(broken, "x@y.co")).not.toThrow()
  })
})
