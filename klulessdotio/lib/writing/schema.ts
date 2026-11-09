import { z } from "zod"
import { CATEGORIES } from "./types"

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")

export const frontMatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(160),
  short: z.string().min(1),
  date: isoDate,
  updated: isoDate.optional(),
  category: z.enum(CATEGORIES),
  series: z.object({ id: z.string().min(1), part: z.number().int().min(1) }).optional(),
  download: z.string().min(1).optional(),
  related: z.array(z.string().min(1)).optional(),
  cover: z.string().min(1).optional(),
})

export type FrontMatter = z.infer<typeof frontMatterSchema>

/** gray-matter parses bare YAML dates into Date objects; turn them back into ISO strings. */
export function normaliseDates(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data }
  for (const key of ["date", "updated"]) {
    const v = out[key]
    if (v instanceof Date) out[key] = v.toISOString().slice(0, 10)
  }
  return out
}
