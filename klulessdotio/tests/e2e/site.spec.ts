import { expect, test } from "@playwright/test"

const DAY = "/?weather=partly&hour=12"

test.describe("Noise", () => {
  test("shows sections in the agreed order and keeps things closed until found", async ({ page }) => {
    await page.goto(DAY)
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Hi, I'm Angad.")
    const labels = await page.locator("main h2").allTextContents()
    expect(labels).toEqual(["What I believe", "What I do", "What I can build", "Things I've made", "What I've been up to"])
    await expect(page.getByText("Head of AI, Truflation")).toHaveCount(0)
    await expect(page.getByRole("link", { name: "Telegram" })).toHaveCount(0)
    await expect(page.getByRole("link", { name: "Published in SoftwareX, 2026" })).toHaveAttribute("href", /S2352711026001366/)
    await expect(page.getByText("Writing")).toHaveCount(0)
  })

  test("Say hello opens the four ways to reach out, with no email", async ({ page }) => {
    await page.goto(DAY)
    await page.getByRole("button", { name: "Say hello" }).click()
    for (const name of ["Telegram", "LinkedIn", "X", "GitHub"]) await expect(page.getByRole("link", { name, exact: true })).toBeVisible()
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0)
  })

  test("Say hello closes smoothly in reverse instead of disappearing", async ({ page }) => {
    await page.goto(DAY)
    const button = page.getByRole("button", { name: "Say hello" })
    await button.click()
    await expect(page.locator(".reach-link")).toHaveCount(4)
    await expect.poll(() => page.locator(".reach-link").last().evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(36)
    const samples = await page.evaluate(async () => {
      const links = Array.from(document.querySelectorAll<HTMLElement>(".reach-link"))
      const first = links[0]
      const last = links[3]
      document.querySelector<HTMLButtonElement>('.say-hello > button')?.click()
      const out: Array<{ first: number; last: number }> = []
      const start = performance.now()
      while (performance.now() - start < 260) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
        out.push({ first: first.getBoundingClientRect().width, last: last.getBoundingClientRect().width })
      }
      return out
    })
    expect(samples.some((s) => s.last < s.first - 1)).toBe(true)
    expect(samples.some((s) => s.first > 1 && s.first < 36.5 || s.last > 1 && s.last < 36.5)).toBe(true)
    await expect(page.locator(".reach-link")).toHaveCount(0)
  })

  test("How I got here opens the timeline, including Baked", async ({ page }) => {
    await page.goto(DAY)
    await page.getByRole("button", { name: "How I got here" }).click()
    await expect(page.getByText("Founder, Baked")).toBeVisible()
    await expect(page.locator(".what-text", { hasText: "Founded solo." })).toBeVisible()
  })

  test("old pages redirect home", async ({ page }) => {
    for (const path of ["/writing", "/portfolio"]) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/$/)
    }
  })

  test("the watermark appears only near the bottom", async ({ page }) => {
    await page.goto(DAY)
    const opacity = () => page.locator(".scene-edge").evaluate((el) => Number(getComputedStyle(el).opacity))
    await page.waitForTimeout(500)
    expect(await opacity()).toBeLessThan(0.05)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }))
    await expect.poll(opacity).toBeGreaterThan(0.95)
  })

  test("after sunset the night image shows", async ({ page }) => {
    await page.goto("/?weather=clear&hour=21")
    await expect(page.locator(".scene-photo")).toHaveAttribute("src", "/weather/clear-night-7.jpg")
    await page.goto("/?weather=rain&hour=21")
    await expect(page.locator(".scene-photo")).toHaveAttribute("src", "/weather/stormy-night-6.jpg")
    await page.goto("/?weather=rain&hour=12")
    await expect(page.locator(".scene-photo")).toHaveAttribute("src", "/weather/stormy-evening-5.jpg")
  })
})

test.describe("Posters", () => {
  test("keyboard users can move through posters and close the view", async ({ page }) => {
    await page.goto(DAY)
    const opener = page.getByTestId("open-posters")
    await opener.focus()
    await page.keyboard.press("Enter")
    const dialog = page.getByRole("dialog", { name: "Posters" })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText("1 of 102")).toBeVisible()
    await page.keyboard.press("ArrowRight")
    await expect(dialog.getByText("2 of 102")).toBeVisible()
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await expect(dialog.getByText("102 of 102")).toBeVisible()
    await expect(dialog.getByText("Older personal experiments, not official work.")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  })

  test("group links and the dock move between posters", async ({ page }) => {
    await page.goto(DAY)
    await page.getByTestId("open-posters").click()
    const dialog = page.getByRole("dialog", { name: "Posters" })
    await dialog.getByRole("button", { name: "Bobbin", exact: true }).click()
    await expect(dialog.getByText("Case study")).toBeVisible()
    await expect(dialog.getByText("Jeff", { exact: false })).toBeVisible()
    await dialog.getByRole("button", { name: "cesr index 1" }).click()
    await expect(dialog.getByRole("heading", { name: "CESR index" })).toBeVisible()
  })

  test("swiping changes the poster", async ({ page }) => {
    await page.goto(DAY)
    await page.getByTestId("open-posters").click()
    const dialog = page.getByRole("dialog", { name: "Posters" })
    const poster = dialog.locator(".stage-poster")
    await expect(poster).toBeVisible()
    await page.waitForTimeout(500)
    const box = await poster.boundingBox()
    if (!box) throw new Error("No poster")
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 8 })
    await page.mouse.up()
    await expect(dialog.getByText("2 of 102")).toBeVisible()
  })
})

test.describe("Dock", () => {
  const expectNotClipped = async (page: import("@playwright/test").Page, name: string) => {
    const thumb = page.getByRole("button", { name, exact: true })
    await thumb.hover()
    await page.waitForTimeout(350)
    const box = await thumb.boundingBox()
    const strip = await page.locator(".dock-strip").boundingBox()
    if (!box || !strip) throw new Error("Dock not found")
    expect(box.y - 2).toBeGreaterThanOrEqual(strip.y)
    expect(box.y + box.height).toBeLessThanOrEqual(strip.y + strip.height)
  }

  test("a magnified poster stays fully inside the dock in the poster view", async ({ page }) => {
    await page.goto(DAY)
    await page.getByTestId("open-posters").click()
    await expectNotClipped(page, "nvda earnings 1")
  })

  test("a magnified poster stays fully inside the dock in Quiet", async ({ page }) => {
    await page.goto(DAY)
    await page.getByRole("button", { name: "Quiet" }).click()
    await page.getByRole("button", { name: "bigmac index" }).click()
    await expectNotClipped(page, "bigmac index")
  })
})

test.describe("Quiet", () => {
  test("switches modes and remembers the choice", async ({ page }) => {
    await page.goto(DAY)
    await page.getByRole("button", { name: "Quiet" }).click()
    await expect(page.getByTestId("quiet-caption")).toHaveText("Poster of the day")
    await expect(page.getByRole("button", { name: "Music" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Books" })).toBeVisible()
    await page.reload()
    await expect(page.getByRole("button", { name: "Noise" })).toBeVisible()
    await page.getByRole("button", { name: "Noise" }).click()
    await expect(page.getByRole("button", { name: "Quiet" })).toBeVisible()
    await page.reload()
    await expect(page.getByRole("button", { name: "Quiet" })).toBeVisible()
  })

  test("the dock swaps the poster in place", async ({ page }) => {
    await page.goto(DAY)
    await page.getByRole("button", { name: "Quiet" }).click()
    await page.getByRole("button", { name: "bigmac index" }).click()
    await expect(page.getByTestId("quiet-caption")).toHaveText("Big Mac index")
    await expect(page.getByRole("button", { name: "Noise" })).toBeVisible()
  })

  test("music loads only when opened, keeps playing when hidden and goes when leaving Quiet", async ({ page }) => {
    await page.route("https://open.spotify.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "" }))
    await page.goto(DAY)
    await page.getByRole("button", { name: "Quiet" }).click()
    await expect(page.locator("iframe")).toHaveCount(0)
    await page.getByRole("button", { name: "Music" }).click()
    await expect(page.locator("iframe")).toHaveCount(1)
    await page.getByRole("button", { name: "Hide player" }).click()
    await expect(page.locator("iframe")).toHaveCount(1)
    await page.getByRole("button", { name: "Books" }).click()
    await expect(page.locator("iframe")).toHaveCount(1)
    await page.getByRole("button", { name: "Noise" }).click()
    await expect(page.locator("iframe")).toHaveCount(0)
  })

  test("books only appear in Quiet, can be dragged and opened", async ({ page }) => {
    await page.goto(DAY)
    await expect(page.locator(".book")).toHaveCount(0)
    await page.getByRole("button", { name: "Quiet" }).click()
    await page.getByRole("button", { name: "Books" }).click()
    const book = page.locator('.book[data-slug="the-mom-test"]')
    await expect(book).toBeVisible()
    await page.waitForTimeout(400)
    const before = await book.boundingBox()
    if (!before) throw new Error("No book")
    await page.mouse.move(before.x + before.width / 2, before.y + 60)
    await page.mouse.down()
    await page.mouse.move(before.x + 280, before.y + 40, { steps: 14 })
    await page.waitForTimeout(500)
    await page.mouse.up()
    await page.waitForTimeout(800)
    const after = await book.boundingBox()
    if (!after) throw new Error("No book")
    expect(Math.abs(after.x - before.x)).toBeGreaterThan(60)

    const neighbour = page.locator('.book[data-slug="zero-to-one"]')
    const spot = await neighbour.boundingBox()
    if (!spot) throw new Error("No book")
    await page.mouse.click(spot.x + spot.width / 2, spot.y + spot.height / 2)
    const card = page.getByRole("dialog")
    await expect(card.getByRole("heading", { name: "Zero to One" })).toBeVisible()
    await expect(card.getByRole("img", { name: "Cover of Zero to One" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(card).toHaveCount(0)

    await neighbour.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
  })
})

test.describe("When things go wrong", () => {
  test("a weather failure leaves a working page with no weather words", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.route("**/api/weather", (route) => route.abort())
    await page.goto("/?hour=12")
    await page.getByRole("button", { name: "Quiet" }).click()
    await expect(page.locator(".status")).toHaveText(/^\d\d:\d\d in Coimbatore$/)
    expect(errors).toEqual([])
  })

  test("no GitHub data hides the activity section", async ({ page }) => {
    await page.route("**/api/contributions", (route) => route.fulfill({ json: { success: false, error: "x" } }))
    await page.goto(DAY)
    await expect(page.getByRole("heading", { name: "What I've been up to" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "How I got here" })).toBeVisible()
  })

  test("without WebGL a gradient stands in and text stays visible", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        return type.includes("webgl") ? null : (original as (...args: unknown[]) => unknown).call(this, type, ...rest)
      } as typeof original
    })
    await page.goto(DAY)
    await expect(page.getByTestId("sky-canvas")).toBeHidden()
    const wash = await page.locator(".sky-wash").evaluate((el) => getComputedStyle(el).backgroundImage)
    expect(wash).toContain("linear-gradient")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("reduced motion stops the greeting and still shows the sky", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(DAY)
    await page.waitForTimeout(6500)
    await expect(page.locator(".greeting span")).toHaveText("Hi, I'm Angad.")
  })
})

test.describe("Phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test("no sideways scroll in any view, and titles fit their spines", async ({ page }) => {
    const noSideways = async () => {
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
      expect(sw).toBeLessThanOrEqual(cw)
    }
    await page.goto(DAY)
    await page.getByRole("button", { name: "Say hello" }).click()
    await page.getByRole("button", { name: "How I got here" }).click()
    await noSideways()
    await page.getByTestId("open-posters").click()
    await expect(page.getByRole("dialog", { name: "Posters" })).toBeVisible()
    await noSideways()
    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Quiet" }).click()
    await expect(page.getByTestId("quiet-caption")).toBeVisible()
    await noSideways()
    await page.getByRole("button", { name: "Books" }).click()
    await expect(page.locator(".book").first()).toBeVisible()
    await noSideways()
    const clipped = await page.locator(".book span").evaluateAll((spans) => spans.filter((s) => s.scrollHeight > s.clientHeight + 1).map((s) => s.textContent))
    expect(clipped).toEqual([])
  })
})
