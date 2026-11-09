import { describe, expect, it } from "vitest"
import { COVER_BOX, fitCover } from "@/lib/writing/og-cover"

function png(width: number, height: number): Buffer {
  const b = Buffer.alloc(33)
  b.write("\x89PNG\r\n\x1a\n", 0, "latin1")
  b.writeUInt32BE(width, 16)
  b.writeUInt32BE(height, 20)
  return b
}

describe("fitCover", () => {
  it("fits a wide png by width", () => {
    expect(fitCover(png(1520, 1264))).toEqual({ width: 396, height: 329 })
  })
  it("fits a tall png by height", () => {
    expect(fitCover(png(600, 1400))).toEqual({ width: 188, height: 438 })
  })
  it("leaves height unset for a jpeg so it is not stretched", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...new Array(40).fill(0)])
    expect(fitCover(jpeg)).toEqual({ width: COVER_BOX.width })
  })
  it("falls back to width only for a png with a zero size", () => {
    expect(fitCover(png(0, 0))).toEqual({ width: COVER_BOX.width })
  })
})
