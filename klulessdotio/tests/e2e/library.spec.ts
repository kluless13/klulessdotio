import { expect, test, type Page } from "@playwright/test"

const SKY = "?weather=clear&hour=12"
const LIB_URL = /\/library(\?.*)?$/
const tile = (page: Page, slug: string) => page.locator(`.lib-tile[data-slug="${slug}"]`)
const dialog = (page: Page) => page.getByRole("dialog")
const filter = (page: Page, name: string) => page.getByRole("button", { name, exact: true })

test.describe("Library page", () => {
  test("filters show 42 items, 10 fonts or 32 buttons", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    await expect(page.locator(".lib-tile")).toHaveCount(42)
    await filter(page, "Type").click()
    await expect(page.locator(".lib-tile")).toHaveCount(10)
    await filter(page, "Buttons").click()
    await expect(page.locator(".lib-tile")).toHaveCount(32)
    await filter(page, "All").click()
    await expect(page.locator(".lib-tile")).toHaveCount(42)
  })

  test("the list view is remembered across a reload", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    await page.getByRole("button", { name: "List", exact: true }).click()
    await expect(page.locator("main.lib")).toHaveAttribute("data-view", "list")
    await page.reload()
    await expect(page.locator("main.lib")).toHaveAttribute("data-view", "list")
    await expect(page.getByRole("button", { name: "List", exact: true })).toHaveAttribute("aria-pressed", "true")
  })

  test("the top bar shows Writing, Library and Quiet, and marks the current page", async ({ page }) => {
    for (const [path, current] of [["/", ""], ["/writing", "Writing"], ["/library", "Library"]] as const) {
      await page.goto(`${path}${path === "/" ? "?weather=partly&hour=12" : ""}`)
      const bar = page.locator(".site-header, .top-bar").first()
      expect(await bar.locator(".btn").allInnerTexts()).toEqual(["Writing", "Library", "Quiet"])
      for (const name of ["Writing", "Library"]) {
        const link = bar.getByRole("link", { name })
        if (name === current) await expect(link).toHaveAttribute("aria-current", "page")
        else await expect(link).not.toHaveAttribute("aria-current", /.*/)
      }
    }
  })

  test("an unknown item is a 404", async ({ page }) => {
    const response = await page.goto("/library/nope")
    expect(response?.status()).toBe(404)
  })
})

test.describe("Library sheet", () => {
  test("opens on the Geist tile, steps with arrows and wraps", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    await tile(page, "geist").click()
    await expect(dialog(page)).toBeVisible()
    await expect(page).toHaveURL(/\/library\/geist$/)
    await expect(page.getByText("1 of 42")).toBeVisible()
    await page.keyboard.press("ArrowRight")
    await expect(dialog(page)).toHaveAccessibleName("Inter")
    await expect(page.getByText("2 of 42")).toBeVisible()
    await expect(page).toHaveURL(/\/library\/inter$/)
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await expect(dialog(page)).toHaveAccessibleName("Mine")
    await expect(page.getByText("42 of 42")).toBeVisible()
  })

  test("Escape closes the sheet, restores /library and focuses the tile", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    await tile(page, "geist").click()
    await expect(dialog(page)).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog(page)).toHaveCount(0)
    await expect(page).toHaveURL(LIB_URL)
    await expect(tile(page, "geist")).toBeFocused()
  })

  // The shared-layout grow and shrink only runs in a real browser, with motion allowed.
  test("closing right after opening ends with the sheet gone and focus on the tile", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    await tile(page, "geist").click()
    await page.keyboard.press("Escape")
    await expect(dialog(page)).toHaveCount(0)
    await expect(tile(page, "geist")).toBeFocused()
    await expect(page).toHaveURL(LIB_URL)
  })

  test("closing after stepping once ends with the sheet gone and focus on the new tile", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    await tile(page, "geist").click()
    await page.keyboard.press("ArrowRight")
    await expect(dialog(page)).toHaveAccessibleName("Inter")
    await page.getByRole("button", { name: "Close", exact: true }).click()
    await expect(dialog(page)).toHaveCount(0)
    await expect(tile(page, "inter")).toBeFocused()
    await expect(page).toHaveURL(LIB_URL)
  })

  test("loading /library/aqua shows the Aqua sheet and closing goes to /library", async ({ page }) => {
    await page.goto(`/library/aqua${SKY}`)
    await expect(dialog(page)).toHaveAccessibleName("Aqua")
    await page.keyboard.press("Escape")
    await expect(dialog(page)).toHaveCount(0)
    await expect(page).toHaveURL(LIB_URL)
  })

  // Review focus 4: Back after stepping closes the sheet, and Forward reopens the last item shown.
  test("Back after stepping closes the sheet and Forward reopens the last item", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    await tile(page, "geist").click()
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await expect(page.getByText("3 of 42")).toBeVisible()
    const third = await dialog(page).getAttribute("aria-labelledby")
    expect(third).toBeTruthy()
    const name = (await page.locator(`[id="${third}"]`).innerText()).trim()
    await page.goBack()
    await expect(dialog(page)).toHaveCount(0)
    await expect(page).toHaveURL(LIB_URL)
    await page.goForward()
    await expect(dialog(page)).toBeVisible()
    await expect(page.getByText("3 of 42")).toBeVisible()
    await expect(dialog(page)).toHaveAccessibleName(name)
  })

  test("Copy link puts the item's address on the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto(`/library/aqua${SKY}`)
    await dialog(page).getByRole("button", { name: "Share" }).click()
    await page.getByRole("menuitem", { name: "Copy link" }).click()
    await expect(page.getByText("Link copied")).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("https://1tx.dev/library/aqua")
  })
})

// Review focus 5: the sheet on a 390px phone.
test.describe("Library on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test("the grid has two columns", async ({ page }) => {
    await page.goto(`/library${SKY}`)
    const columns = await page.locator(".lib-grid").first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length)
    expect(columns).toBe(2)
  })

  test("the sheet stacks its panels and the arrows stay clear of the title", async ({ page }) => {
    await page.goto(`/library/geist${SKY}`)
    await expect(dialog(page)).toBeVisible()
    await page.waitForTimeout(600)
    const specimen = await page.locator(".lib-sheet-specimen").boundingBox()
    const about = await page.locator(".lib-sheet-about").boundingBox()
    const title = await page.locator(".lib-sheet-name").boundingBox()
    if (!specimen || !about || !title) throw new Error("sheet parts missing")
    expect(about.y).toBeGreaterThanOrEqual(specimen.y + specimen.height - 1)
    for (const label of ["Previous", "Next"]) {
      const arrow = await page.getByRole("button", { name: label, exact: true }).boundingBox()
      if (!arrow) throw new Error(`${label} missing`)
      const overlaps = arrow.x < title.x + title.width && arrow.x + arrow.width > title.x && arrow.y < title.y + title.height && arrow.y + arrow.height > title.y
      expect(overlaps, `${label} covers the title`).toBe(false)
    }
  })

  test("a swipe of 100px steps to the next item", async ({ page }) => {
    await page.goto(`/library/geist${SKY}`)
    await expect(page.getByText("1 of 42")).toBeVisible()
    await page.waitForTimeout(600)
    const frame = await page.locator(".lib-sheet").boundingBox()
    if (!frame) throw new Error("sheet missing")
    const y = frame.y + 90
    const x = frame.x + frame.width / 2
    const cdp = await page.context().newCDPSession(page)
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x + 50, y }] })
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] })
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 50, y }] })
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
    await expect(page.getByText("2 of 42")).toBeVisible()
    await expect(dialog(page)).toHaveAccessibleName("Inter")
  })
})
