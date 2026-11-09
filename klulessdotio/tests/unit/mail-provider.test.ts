import { describe, it, expect, vi, beforeEach } from "vitest"

const create = vi.fn()
const send = vi.fn()
const ctorKey = vi.fn()
vi.mock("resend", () => ({
  Resend: class {
    constructor(key: string) {
      ctorKey(key)
    }
    contacts = { create }
    emails = { send }
  },
}))

import { resendProvider } from "@/lib/mail/provider"
import { downloadEmailHtml, downloadEmailText } from "@/lib/mail/download-email"

const env = {
  RESEND_API_KEY: "k",
  RESEND_SEGMENT_ID: "seg1",
  MAIL_FROM: "Angad <a@1tx.dev>",
}
const EMAIL = "secret.person@example.com"
const ok = { data: { id: "x" }, error: null }

beforeEach(() => {
  create.mockReset()
  send.mockReset()
  ctorKey.mockReset()
})

describe("resendProvider", () => {
  it("adds the contact and sends the email", async () => {
    create.mockResolvedValue(ok)
    send.mockResolvedValue(ok)
    const p = resendProvider(env)
    await p.addContact({ email: EMAIL, downloadId: "d", slug: "s" })
    expect(create).toHaveBeenCalledWith({
      email: EMAIL,
      unsubscribed: false,
      segments: [{ id: "seg1" }],
    })
    await p.sendDownloadEmail({ email: EMAIL, title: "Kit", link: "https://x/y" })
    const arg = send.mock.calls[0][0]
    expect(arg.from).toBe(env.MAIL_FROM)
    expect(arg.to).toBe(EMAIL)
    expect(arg.subject).toBe("Your download: Kit")
    expect(arg.text).toContain("https://x/y")
  })

  it("creates the contact without segments when no segment id", async () => {
    create.mockResolvedValue(ok)
    await resendProvider({ ...env, RESEND_SEGMENT_ID: undefined }).addContact({
      email: EMAIL, downloadId: "d", slug: "s",
    })
    expect(create).toHaveBeenCalledWith({ email: EMAIL, unsubscribed: false })
  })

  it("existing contact counts as success", async () => {
    create.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Contact already exists", statusCode: 409 },
    })
    await expect(
      resendProvider(env).addContact({ email: EMAIL, downloadId: "d", slug: "s" })
    ).resolves.toBeUndefined()
  })

  it("duplicate detected by message alone counts as success", async () => {
    create.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Already exists", statusCode: null },
    })
    await expect(
      resendProvider(env).addContact({ email: EMAIL, downloadId: "d", slug: "s" })
    ).resolves.toBeUndefined()
  })

  it("strips line breaks from the subject", async () => {
    send.mockResolvedValue(ok)
    await resendProvider(env).sendDownloadEmail({ email: EMAIL, title: "A\r\nBcc: x", link: "l" })
    expect(send.mock.calls[0][0].subject).toBe("Your download: A Bcc: x")
  })

  it("provider errors never include the email", async () => {
    create.mockResolvedValue({
      data: null,
      error: { name: "application_error", message: `bad ${EMAIL}`, statusCode: 500 },
    })
    send.mockRejectedValue(new Error(`network ${EMAIL}`))
    const p = resendProvider(env)
    const e1 = await p.addContact({ email: EMAIL, downloadId: "d", slug: "s" }).catch((e) => e)
    const e2 = await p.sendDownloadEmail({ email: EMAIL, title: "T", link: "l" }).catch((e) => e)
    for (const e of [e1, e2]) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe("mail provider failed")
      expect(e.message).not.toContain(EMAIL)
    }
  })

  it("reads the api key from Resend alone", async () => {
    create.mockResolvedValue(ok)
    await resendProvider({ Resend: "alias-key", MAIL_FROM: "a" }).addContact({ email: EMAIL, downloadId: "d", slug: "s" })
    expect(ctorKey).toHaveBeenCalledWith("alias-key")
  })

  it("RESEND_API_KEY wins when both are set, empty counts as unset", async () => {
    create.mockResolvedValue(ok)
    const input = { email: EMAIL, downloadId: "d", slug: "s" }
    await resendProvider({ RESEND_API_KEY: "main", Resend: "alias" }).addContact(input)
    expect(ctorKey).toHaveBeenLastCalledWith("main")
    await resendProvider({ RESEND_API_KEY: "", Resend: "alias" }).addContact(input)
    expect(ctorKey).toHaveBeenLastCalledWith("alias")
  })

  it("throws naming both names when neither key is set", async () => {
    await expect(
      resendProvider({ MAIL_FROM: "a" }).addContact({ email: EMAIL, downloadId: "d", slug: "s" })
    ).rejects.toThrow(/RESEND_API_KEY \(or Resend\)/)
  })

  it("throws a clear error when required env is missing", async () => {
    const p = resendProvider({ MAIL_FROM: "a" })
    await expect(p.addContact({ email: EMAIL, downloadId: "d", slug: "s" })).rejects.toThrow(
      /RESEND_API_KEY/
    )
    await expect(
      resendProvider({ RESEND_API_KEY: "k" }).sendDownloadEmail({ email: EMAIL, title: "T", link: "l" })
    ).rejects.toThrow(/MAIL_FROM/)
  })
})

describe("download email", () => {
  it("email copy has no em dashes and escapes html", () => {
    const html = downloadEmailHtml('A <b>"Kit"</b>', "https://x/y?a=1&b=2")
    const text = downloadEmailText("Kit", "https://x/y")
    expect(html).not.toContain("—")
    expect(text).not.toContain("—")
    expect(html).not.toContain("<b>")
    expect(html).toContain("&amp;b=2")
    expect(text).toContain("Here's the Kit you asked for.")
    expect(text).toContain("The link works for 7 days.")
    expect(text).toContain("Angad")
  })
})
