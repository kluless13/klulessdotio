import { expect, test, type Page } from "@playwright/test"
import { signKitToken } from "../../lib/downloads/token"

const SKY = "hour=12&weather=clear"
const SECRET = "e2e-kit-secret"
const PROMPT = "Remind me to check my herbs.\n\n1. Ask which herbs I own.\n2. Ask which window they sit in.\n\nSave the answers in a list called HERBS.md."
const kitPath = (query = SKY) => `/kit/${signKitToken("e2e@example.com", SECRET)}?${query}`

// The kit page is the only place with mono text, so it needs a settled sky before its notes are measured.
async function openKit(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height })
  await page.goto(kitPath())
  await expect(page.locator("aside.kit-note").first()).toBeVisible()
  await expect(page.locator(".note-on[data-inked]").first()).toBeAttached()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
}

test.describe("Kit signup page", () => {
  test("has the title and one-line subtitle, and no reading time", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/kit?${SKY}`)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Talk to it. It does the work.")
    const dek = page.locator(".kit-dek")
    await expect(dek).toHaveText("A free starter kit for getting AI agents to do real work in your tools. No code.")
    expect((await dek.boundingBox())!.height).toBeLessThan(40)
    await expect(page.getByText(/min read/i)).toHaveCount(0)
  })

  test("highlights are inked with SVG strokes", async ({ page }) => {
    await page.goto(`/kit?${SKY}`)
    const mark = page.locator("mark.hl").first()
    await expect(mark).toHaveAttribute("data-inked", "")
    expect(await mark.locator("svg").count()).toBeGreaterThan(0)
  })

  test("submitting an email posts kind kit and shows the sent message", async ({ page }) => {
    let body: Record<string, unknown> | undefined
    await page.route("**/api/subscribe", (route) => {
      body = route.request().postDataJSON()
      return route.fulfill({ status: 200, json: { success: true } })
    })
    await page.goto(`/kit?${SKY}`)
    await page.getByLabel("Email", { exact: true }).fill("reader@example.com")
    await page.getByRole("button", { name: "Send me the kit" }).click()
    await expect(page.locator(".kit-gate-status")).toHaveText("Check your inbox. Your link works for good.")
    expect(body).toMatchObject({ kind: "kit", email: "reader@example.com" })
  })
})

test.describe("Kit page", () => {
  test("a valid link renders the kit with inked highlights, and is kept out of search and referrers", async ({ page }) => {
    const response = await page.goto(kitPath())
    expect(response!.status()).toBe(200)
    expect(response!.headers()["x-robots-tag"]).toContain("noindex")
    expect(response!.headers()["referrer-policy"]).toBe("no-referrer")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Plant watering sample")
    expect(await page.locator("mark.hl").count()).toBeGreaterThan(0)
    const mark = page.locator("mark.hl").first()
    await expect(mark).toHaveAttribute("data-inked", "")
    expect(await mark.locator("svg").count()).toBeGreaterThan(0)
  })

  for (const path of ["/kit/garbage", "/kit/%%%", "/kit/%E0%A4%A", "/kit/a.b.c", `/kit/${"x".repeat(3000)}`]) {
    test(`a bad link ${path.slice(0, 24)} gets the friendly state without a crash`, async ({ page }) => {
      const response = await page.goto(path)
      expect([200, 400, 404]).toContain(response!.status())
      const text = await page.locator("body").innerText()
      expect(text).not.toMatch(/Unhandled|Error:|at .*\(.*:\d+/)
      if (response!.status() === 200) await expect(page.getByText("This link doesn't work")).toBeVisible()
    })
  }

  test("a bad link also offers the signup form", async ({ page }) => {
    await page.goto("/kit/garbage")
    await expect(page.getByText("This link doesn't work")).toBeVisible()
    await expect(page.getByRole("button", { name: "Send me the kit" })).toBeVisible()
  })

  test("desktop: each note sits right of the text, level with its words", async ({ page }) => {
    await openKit(page, 1440, 900)
    const notes = page.locator("aside.kit-note")
    const count = await notes.count()
    expect(count).toBeGreaterThanOrEqual(3)
    for (let i = 0; i < count; i++) {
      const note = notes.nth(i)
      const group = note.locator("xpath=ancestor::*[contains(@class,'kit-noted')][1]")
      const n = await note.getAttribute("data-note")
      const words = group.locator(`.note-on[data-note="${n}"]`)
      const noteBox = (await note.boundingBox())!
      const column = (await group.locator("> :not(aside)").first().boundingBox())!
      const wordsBox = (await words.first().boundingBox())!
      expect(noteBox.x, `note ${i} right of column`).toBeGreaterThanOrEqual(column.x + column.width)
      expect(Math.abs(noteBox.y - wordsBox.y), `note ${i} level with words`).toBeLessThanOrEqual(12)
    }
  })

  test("phone: each note sits under its block and nothing scrolls sideways", async ({ page }) => {
    await openKit(page, 390, 844)
    const notes = page.locator("aside.kit-note")
    const count = await notes.count()
    expect(count).toBeGreaterThanOrEqual(3)
    for (let i = 0; i < count; i++) {
      const note = notes.nth(i)
      const block = (await note.locator("xpath=preceding-sibling::*[not(self::aside)][1]").boundingBox())!
      const noteBox = (await note.boundingBox())!
      expect(noteBox.y, `note ${i} under block`).toBeGreaterThanOrEqual(block.y + block.height - 1)
      expect(noteBox.x + noteBox.width).toBeLessThanOrEqual(390)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })

  test("note underlines are inked", async ({ page }) => {
    await openKit(page, 1440, 900)
    const words = page.locator(".note-on").first()
    await expect(words).toHaveAttribute("data-inked", "")
    expect(await words.locator("svg").count()).toBeGreaterThan(0)
  })

  test("Copy prompt puts the exact prompt on the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto(kitPath())
    await page.getByRole("button", { name: "Copy prompt" }).click()
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(PROMPT)
  })

  test("the booking button falls back to a normal link, and no token reaches Cal", async ({ page }) => {
    const calRequests: string[] = []
    await page.route("https://app.cal.com/**", (route) => route.abort())
    page.on("request", (req) => {
      if (/cal\.com/.test(req.url())) calRequests.push(req.url() + (req.postData() ?? ""))
    })
    await page.route("https://cal.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>cal</title>" }))
    const path = kitPath()
    const token = path.split("/")[2].split("?")[0]
    await page.goto(path)
    const button = page.locator("a.kit-cal").first()
    await expect(button).toHaveAttribute("href", "https://cal.com/angad888/show-me")
    await expect(page.locator(`script[src="https://app.cal.com/embed/embed.js"]`)).toHaveAttribute("data-state", "failed")
    // Navigating proves the click was not prevented
    await Promise.all([page.waitForURL(/cal\.com\/angad888\/show-me/), button.click()])
    expect(calRequests.filter((r) => r.includes(token))).toEqual([])
    expect(calRequests.some((r) => r.includes(encodeURIComponent(token)))).toBe(false)
  })
})

test.describe("Unsubscribe page", () => {
  test("done says the kit link still works", async ({ page }) => {
    await page.goto("/unsubscribe?status=done")
    await expect(page.getByText("You're unsubscribed. Your kit link still works.")).toBeVisible()
  })
})
