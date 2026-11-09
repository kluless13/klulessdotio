import { expect, test } from "@playwright/test"

// Runs against tests/fixtures/posts/valid (WRITING_CONTENT_DIR in playwright.config.ts)
const GROUPS = ["AI and building", "Prediction markets", "Thinking"]
const groupTitles = (page: import("@playwright/test").Page) => page.locator("[data-category] h2").allInnerTexts()

test.describe("Writing index", () => {
  test("home shows a Writing button that opens /writing", async ({ page }) => {
    await page.goto("/?weather=partly&hour=12")
    const header = page.locator(".site-header")
    const writing = header.getByRole("link", { name: "Writing" })
    await expect(writing).toBeVisible()
    const order = await header.locator(".btn").allInnerTexts()
    expect(order).toEqual(["Writing", "Quiet"])
    await writing.click()
    await expect(page).toHaveURL(/\/writing$/)
    await expect(page.getByRole("heading", { level: 1, name: "Writing" })).toBeVisible()
  })

  test("the home footer links to About", async ({ page }) => {
    await page.goto("/?weather=partly&hour=12")
    await expect(page.locator(".foot").getByRole("link", { name: "About" })).toHaveAttribute("href", "/about")
  })

  test("/writing shows groups in order with rows showing title, short, date and minutes", async ({ page }) => {
    await page.goto("/writing")
    await expect(page.getByText("Things I looked into, and what I found.")).toBeVisible()
    expect((await groupTitles(page)).map((t) => t.replace(/\s*\d+$/, ""))).toEqual(GROUPS)
    const markets = page.locator('[data-category="Prediction markets"]')
    await expect(markets.locator("h2")).toContainText("2")
    const rows = markets.getByRole("link")
    await expect(rows).toHaveCount(2)
    const first = rows.first()
    await expect(first).toHaveAttribute("href", "/writing/are-prediction-markets-accurate")
    await expect(first).toContainText("Are prediction markets accurate")
    await expect(first).toContainText("A short blurb.")
    await expect(first).toContainText("Part 1 of 7")
    await expect(first).toContainText("9 Nov 2026")
    await expect(first).toContainText("1 min read")
    await expect(rows.nth(1)).toContainText("Part 2 of 7")
    const featured = page.locator(".featured")
    await expect(featured).toContainText("Prediction market research")
    await expect(featured.getByRole("link", { name: "Start with part 1" })).toHaveAttribute("href", "/writing/are-prediction-markets-accurate")
    await expect(featured).toContainText("2 posts, about 2 minutes")
    const footer = page.locator("footer")
    for (const [name, href] of [["About", "/about"], ["Writing", "/writing"], ["RSS", "/writing/rss.xml"]]) {
      await expect(footer.getByRole("link", { name, exact: true })).toHaveAttribute("href", href)
    }
    await expect(footer).toContainText("© 2026 Angad Maniyambath")
  })

  test("filter hides other groups and updates the URL", async ({ page }) => {
    await page.goto("/writing?hour=12")
    const filter = page.getByRole("group", { name: "Filter by category" })
    const buttons = await filter.getByRole("button").allInnerTexts()
    expect(buttons).toEqual(["All", ...GROUPS])
    await filter.getByRole("button", { name: "Thinking" }).click()
    await expect(filter.getByRole("button", { name: "Thinking" })).toHaveAttribute("aria-pressed", "true")
    await expect(page.locator('[data-category="Thinking"]')).toBeVisible()
    await expect(page.locator('[data-category="Prediction markets"]')).toBeHidden()
    await expect(page.locator('[data-category="AI and building"]')).toBeHidden()
    await expect(page).toHaveURL(/\?hour=12&category=Thinking$/)
    const length = await page.evaluate(() => history.length)
    await filter.getByRole("button", { name: "All" }).click()
    expect(await groupTitles(page)).toHaveLength(3)
    await expect(page).toHaveURL(/\/writing\?hour=12$/)
    expect(await page.evaluate(() => history.length)).toBe(length)
  })

  test("?category=Thinking opens filtered", async ({ page }) => {
    await page.goto("/writing?category=Thinking")
    await expect(page.locator('[data-category="Prediction markets"]')).toBeHidden()
    await expect(page.locator('[data-category="Thinking"]')).toBeVisible()
    await expect(page.getByRole("button", { name: "Thinking" })).toHaveAttribute("aria-pressed", "true")
  })

  test("Quiet from /writing lands on home in quiet mode", async ({ page }) => {
    await page.goto("/writing")
    const quiet = page.getByRole("link", { name: "Quiet" })
    await expect(quiet).toBeVisible()
    await expect(page.getByRole("link", { name: "Writing" }).first()).toHaveAttribute("aria-current", "page")
    await quiet.click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId("quiet-caption")).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem("1tx-mode"))).toBe("quiet")
  })

  test("/writing links the RSS feed in the head and has BreadcrumbList json-ld", async ({ page }) => {
    await page.goto("/writing")
    await expect(page).toHaveTitle("Writing · Angad Maniyambath")
    await expect(page.locator('head link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute("href", "https://1tx.dev/writing/rss.xml")
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", "https://1tx.dev/writing")
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const crumbs = blocks.map((b) => JSON.parse(b)).find((d) => d["@type"] === "BreadcrumbList")
    expect(crumbs.itemListElement.map((i: { name: string; item: string }) => [i.name, i.item])).toEqual([
      ["Home", "https://1tx.dev"],
      ["Writing", "https://1tx.dev/writing"],
    ])
  })
})

test.describe("Writing index without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("with JavaScript disabled all groups are visible", async ({ page }) => {
    await page.goto("/writing?category=Thinking")
    for (const name of GROUPS) await expect(page.locator(`[data-category="${name}"]`)).toBeVisible()
    await expect(page.locator('[data-category] a[href^="/writing/"]')).toHaveCount(4)
  })
})
