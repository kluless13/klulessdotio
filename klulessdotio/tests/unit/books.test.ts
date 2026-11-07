import fs from "node:fs"
import { describe, expect, it } from "vitest"
import { BOOKS, fitBook } from "@/lib/books"

describe("books", () => {
  it("has a cover file for each book", () => {
    expect(BOOKS.length).toBeGreaterThan(0)
    for (const book of BOOKS) expect(fs.existsSync(`public/covers/${book.slug}.jpg`)).toBe(true)
  })
  it("keeps sizes on wide screens and slims spines on phones", () => {
    expect(fitBook(BOOKS[0], true)).toEqual(BOOKS[0])
    const small = fitBook(BOOKS[0], false)
    expect(small.w).toBeLessThan(BOOKS[0].w)
    expect(small.h).toBeLessThan(BOOKS[0].h)
    expect(small.size).toBeGreaterThanOrEqual(10)
  })
})
