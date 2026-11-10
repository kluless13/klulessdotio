import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const create = vi.fn()
const update = vi.fn()
const addSegment = vi.fn()
const send = vi.fn()
const ctorKey = vi.fn()
vi.mock("resend", () => ({
  Resend: class {
    constructor(key: string) {
      ctorKey(key)
    }
    contacts = { create, update, segments: { add: addSegment } }
    emails = { send }
  },
}))

import { resendProvider } from "@/lib/mail/provider"
import { KIT_EMAIL_SUBJECT } from "@/lib/mail/kit-email"
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
  update.mockReset()
  addSegment.mockReset()
  update.mockResolvedValue(ok)
  addSegment.mockResolvedValue(ok)
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

  it("provider errors carry a safe reason code for the logs", async () => {
    const p = resendProvider(env)
    create.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad", statusCode: 422 } })
    expect((await p.addContact({ email: EMAIL }).catch((e) => e)).code).toBe("validation_error")
    create.mockResolvedValue({ data: null, error: { name: EMAIL, message: "bad", statusCode: 500 } })
    expect((await p.addContact({ email: EMAIL }).catch((e) => e)).code).toBe("provider_error")
    create.mockRejectedValue(new Error(`network ${EMAIL}`))
    expect((await p.addContact({ email: EMAIL }).catch((e) => e)).code).toBe("network")
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

const dup = {
  data: null,
  error: { name: "validation_error", message: "Contact already exists", statusCode: 409 },
}
const kitInput = { email: EMAIL, link: "https://1tx.dev/kit/t", unsubscribeLink: "https://1tx.dev/u?t=1" }

describe("kit mail", () => {
  afterEach(() => vi.useRealTimers())

  it("sendKitEmail sends the subject, both bodies and both unsubscribe headers", async () => {
    send.mockResolvedValue(ok)
    await resendProvider(env).sendKitEmail(kitInput)
    const arg = send.mock.calls[0][0]
    expect(arg.from).toBe(env.MAIL_FROM)
    expect(arg.to).toBe(EMAIL)
    expect(arg.subject).toBe(KIT_EMAIL_SUBJECT)
    expect(arg.html).toContain(kitInput.link)
    expect(arg.text).toContain(kitInput.unsubscribeLink)
    expect(arg.headers).toEqual({
      "List-Unsubscribe": `<${kitInput.unsubscribeLink}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    })
  })

  it("sendKitEmail hides provider errors", async () => {
    send.mockResolvedValue({ data: null, error: { name: "x", message: EMAIL, statusCode: 500 } })
    const e = await resendProvider(env).sendKitEmail(kitInput).catch((err) => err)
    expect(e.message).toBe("mail provider failed")
  })

  it("addContact with segments sends all of them", async () => {
    create.mockResolvedValue(ok)
    await resendProvider(env).addContact({ email: EMAIL, segments: ["a", "b"] })
    expect(create).toHaveBeenCalledWith({
      email: EMAIL,
      unsubscribed: false,
      segments: [{ id: "a" }, { id: "b" }],
    })
  })

  it("a duplicate re-subscribes the contact and re-adds the segments", async () => {
    create.mockResolvedValue(dup)
    await resendProvider(env).addContact({ email: EMAIL, segments: ["a", "b"] })
    expect(update).toHaveBeenCalledWith({ email: EMAIL, unsubscribed: false })
    expect(addSegment).toHaveBeenCalledWith({ email: EMAIL, segmentId: "a" })
    expect(addSegment).toHaveBeenCalledWith({ email: EMAIL, segmentId: "b" })
  })

  it("a duplicate re-adds the segments concurrently, not one after the other", async () => {
    create.mockResolvedValue(dup)
    const release: (() => void)[] = []
    addSegment.mockImplementation(() => new Promise<void>((resolve) => release.push(resolve)))
    const done = resendProvider(env).addContact({ email: EMAIL, segments: ["a", "b", "c"] })
    await vi.waitFor(() => expect(addSegment).toHaveBeenCalledTimes(3))
    release.forEach((r) => r())
    await expect(done).resolves.toBeUndefined()
  })

  it("a duplicate still succeeds when re-adding a segment fails", async () => {
    create.mockResolvedValue(dup)
    addSegment.mockRejectedValue(new Error("already in segment"))
    await expect(
      resendProvider(env).addContact({ email: EMAIL, segments: ["a"] })
    ).resolves.toBeUndefined()
  })

  it("a duplicate fails if the re-subscribe update fails", async () => {
    create.mockResolvedValue(dup)
    update.mockResolvedValue({ data: null, error: { name: "x", message: "bad", statusCode: 500 } })
    await expect(resendProvider(env).addContact({ email: EMAIL })).rejects.toThrow("mail provider failed")
  })

  it("unsubscribe updates the contact", async () => {
    await resendProvider(env).unsubscribe(EMAIL)
    expect(update).toHaveBeenCalledWith({ email: EMAIL, unsubscribed: true })
  })

  it("unsubscribe treats not found as success", async () => {
    update.mockResolvedValue({ data: null, error: { name: "not_found", message: "Contact not found", statusCode: 404 } })
    await expect(resendProvider(env).unsubscribe(EMAIL)).resolves.toBeUndefined()
  })

  it("unsubscribe fails on other errors", async () => {
    update.mockResolvedValue({ data: null, error: { name: "x", message: "boom", statusCode: 500 } })
    await expect(resendProvider(env).unsubscribe(EMAIL)).rejects.toThrow("mail provider failed")
  })

  it("a send that never resolves rejects within the timeout", async () => {
    vi.useFakeTimers()
    send.mockReturnValue(new Promise(() => {}))
    const result = resendProvider(env).sendKitEmail(kitInput).catch((e) => e)
    await vi.advanceTimersByTimeAsync(5000)
    expect((await result).message).toBe("mail provider failed")
  })

  it("a contact call that never resolves rejects within the timeout", async () => {
    vi.useFakeTimers()
    create.mockReturnValue(new Promise(() => {}))
    const result = resendProvider(env).addContact({ email: EMAIL }).catch((e) => e)
    await vi.advanceTimersByTimeAsync(5000)
    const error = await result
    expect(error.message).toBe("mail provider failed")
    expect(error.code).toBe("timeout")
  })
})
