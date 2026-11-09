export const COVER_BOX = { width: 396, height: 438 } as const

export type CoverSize = { width: number; height?: number }

/**
 * Size for the cover inside the share image panel. A PNG header gives the real
 * dimensions, so it is scaled to fit the box. Other formats get the box width only,
 * so the height follows the image and nothing is stretched (the panel clips overflow).
 */
export function fitCover(bytes: Buffer): CoverSize {
  const isPng = bytes.length > 24 && bytes.subarray(1, 4).toString("ascii") === "PNG"
  if (!isPng) return { width: COVER_BOX.width }
  const w = bytes.readUInt32BE(16)
  const h = bytes.readUInt32BE(20)
  if (!w || !h) return { width: COVER_BOX.width }
  const scale = Math.min(COVER_BOX.width / w, COVER_BOX.height / h)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}
