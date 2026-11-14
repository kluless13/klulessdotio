/** The demo sign-up: what the forms ask, how answers are checked and what a send pretends to do. Nothing leaves the browser. */
import { z } from "zod"

export const REGIONS = [
  "United Kingdom",
  "Europe",
  "Middle East and Africa",
  "Asia Pacific",
  "North America",
  "Latin America",
  "Elsewhere",
] as const

export const STARTING_POINTS = [
  "New to trading",
  "Trading for under a year",
  "Trading for 1 to 3 years",
  "Trading for 3 years or more",
  "Already funded with another firm",
] as const

export type Region = (typeof REGIONS)[number]
export type StartingPoint = (typeof STARTING_POINTS)[number]

export const MESSAGES = {
  firstName: "Add your first name.",
  emailMissing: "Add your email.",
  emailAt: "This email needs an @.",
  emailDomain: "This email looks incomplete. Check the part after the @.",
  region: "Choose where you're based.",
} as const

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const signupSchema = z.object({
  firstName: z.string().trim().min(1, MESSAGES.firstName).max(60),
  email: z
    .string()
    .trim()
    .max(254)
    .superRefine((value, ctx) => {
      const message = emailProblem(value)
      if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message })
    }),
  region: z.enum(REGIONS, { errorMap: () => ({ message: MESSAGES.region }) }),
  startingPoint: z.enum(STARTING_POINTS).optional(),
})

export type Signup = z.infer<typeof signupSchema>
export type SignupField = keyof Signup
export type SignupErrors = Partial<Record<SignupField, string>>

export interface SignupInput {
  readonly firstName: string
  readonly email: string
  readonly region: string
  readonly startingPoint?: string
}

function emailProblem(value: string): string | null {
  if (value.length === 0) return MESSAGES.emailMissing
  if (!value.includes("@")) return MESSAGES.emailAt
  if (!EMAIL.test(value)) return MESSAGES.emailDomain
  return null
}

export type SignupCheck = { readonly ok: true; readonly data: Signup } | { readonly ok: false; readonly errors: SignupErrors }

export function checkSignup(input: SignupInput, askStartingPoint: boolean): SignupCheck {
  const candidate = {
    firstName: input.firstName,
    email: input.email,
    region: input.region,
    startingPoint: askStartingPoint && input.startingPoint ? input.startingPoint : undefined,
  }
  const result = signupSchema.safeParse(candidate)
  if (result.success) return { ok: true, data: result.data }
  const errors = result.error.issues.reduce<SignupErrors>((found, issue) => {
    const field = issue.path[0] as SignupField
    return found[field] ? found : { ...found, [field]: issue.message }
  }, {})
  return { ok: false, errors }
}

/** Checks one field as someone leaves it, using the same rules as the full check */
export function checkField(field: SignupField, input: SignupInput, askStartingPoint: boolean): string | undefined {
  const result = checkSignup(input, askStartingPoint)
  return result.ok ? undefined : result.errors[field]
}

/** The order a person meets the fields, so focus can jump to the first one with a problem */
export const FIELD_ORDER: readonly SignupField[] = ["firstName", "email", "region", "startingPoint"]

export function firstProblem(errors: SignupErrors): SignupField | undefined {
  return FIELD_ORDER.find((field) => errors[field])
}

export type SendOutcome = "added" | "already" | "failed"

/** Lets the demo show every state: an address already used in this browser is "already on the list", and anything sent while offline, or to fail@ any address, fails. */
export function decideOutcome(email: string, knownEmails: readonly string[], online: boolean): SendOutcome {
  const normalised = email.trim().toLowerCase()
  if (!online || normalised.startsWith("fail@")) return "failed"
  return knownEmails.includes(normalised) ? "already" : "added"
}

export const DEMO_STORE_KEY = "kalibre-demo-signups"

/** Only the most recent few addresses are kept, so a shared demo laptop doesn't build up a list */
export const DEMO_STORE_LIMIT = 5

export function readKnownEmails(storage: Pick<Storage, "getItem"> | null): readonly string[] {
  try {
    const raw = storage?.getItem(DEMO_STORE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []
  } catch {
    return []
  }
}

export function rememberEmail(storage: Pick<Storage, "getItem" | "setItem"> | null, email: string): void {
  try {
    const known = readKnownEmails(storage)
    const normalised = email.trim().toLowerCase()
    if (!known.includes(normalised)) storage?.setItem(DEMO_STORE_KEY, JSON.stringify([...known, normalised].slice(-DEMO_STORE_LIMIT)))
  } catch {
    // Storage is blocked: the demo just won't remember this address
  }
}
