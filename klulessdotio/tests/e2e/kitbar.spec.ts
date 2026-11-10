import { expect, test } from "@playwright/test"
import { signKitToken } from "../../lib/downloads/token"

const bar = (page: import("@playwright/test").Page) => page.getByRole("complementary", { name: "Starter kit" })

test.beforeEach(async ({ page }) => {
  await page.route("**/api/visitor", (route) => route.fulfill({ json: { success: true, data: { number: 7 } } }))
})

test("the kit bar shows above the top bar on every page but the kit's own", async ({ page }) => {
  for (const path of ["/", "/writing", "/library", "/writing/claude-code-notes", "/about"]) {
    await page.goto(`${path}?hour=12&weather=clear`)
    await expect(bar(page), path).toBeVisible()
    await expect(bar(page).getByText("A free starter kit for getting AI to do real work in your tools.")).toBeVisible()
    const box = await bar(page).boundingBox()
    expect(box, path).toMatchObject({ y: 0, height: 60 })
  }
  for (const path of ["/kit", `/kit/${signKitToken("e2e@example.com", "e2e-kit-secret")}`]) {
    await page.goto(path)
    await expect(page.locator(".kit").first()).toBeVisible()
    await expect(bar(page), path).toHaveCount(0)
  }
})

test("the bar replaces the old line on /writing", async ({ page }) => {
  await page.goto("/writing")
  await expect(bar(page)).toBeVisible()
  await expect(page.locator(".w-kit-line")).toHaveCount(0)
  await expect(page.getByText("New: a free")).toHaveCount(0)
})

test("the button goes to the signup page", async ({ page }) => {
  await page.goto("/writing")
  const link = bar(page).getByRole("link", { name: "Get the free kit" })
  await expect(link).toHaveAttribute("href", "/kit")
  await link.click()
  await expect(page).toHaveURL(/\/kit$/)
  await expect(bar(page)).toHaveCount(0)
})

test("closing the bar keeps it closed, with no flash on the next load", async ({ page }) => {
  await page.goto("/writing")
  await bar(page).getByRole("button", { name: "Close" }).click()
  await expect(bar(page)).toHaveCount(0)
  expect(await page.evaluate(() => window.localStorage.getItem("1tx-kitbar-dismissed"))).toBe("1")

  // Hidden in the server-rendered page before React runs, not removed after
  await page.route("**/_next/static/**/*.js", (route) => route.abort())
  await page.reload()
  await expect(page.locator(".top-bar")).toBeVisible()
  await expect(page.locator(".kitbar")).toBeHidden()
  await page.unroute("**/_next/static/**/*.js")

  await page.goto("/")
  await expect(page.locator(".site-header")).toBeVisible()
  await expect(page.locator(".kitbar")).toBeHidden()
})

test("the bar is reachable by keyboard", async ({ page }) => {
  await page.goto("/writing")
  await page.locator("body").focus()
  await page.keyboard.press("Tab")
  await expect(bar(page).getByRole("link", { name: "Get the free kit" })).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(bar(page).getByRole("button", { name: "Close" })).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(bar(page)).toHaveCount(0)
})

test("Quiet and the posters hide the bar on the home page", async ({ page }) => {
  await page.goto("/?hour=12&weather=clear")
  await expect(bar(page)).toBeVisible()
  await page.getByRole("button", { name: "Quiet" }).click()
  await expect(page.locator(".kitbar")).toBeHidden()
  await page.reload()
  await expect(page.locator(".quiet")).toBeVisible()
  await expect(page.locator(".kitbar")).toBeHidden()

  await page.evaluate(() => window.localStorage.setItem("1tx-mode", "noise"))
  await page.goto("/?hour=12&weather=clear")
  await expect(bar(page)).toBeVisible()
  await page.getByTestId("open-posters").click()
  await expect(page.locator(".kitbar")).toBeHidden()
})

test("on a phone the bar is at most 64px tall with no sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const path of ["/", "/writing"]) {
    await page.goto(`${path}?hour=12&weather=clear`)
    await expect(bar(page).getByText("Free starter kit: get AI doing real work in your tools.")).toBeVisible()
    await expect(bar(page).getByRole("link", { name: "Get the kit" })).toBeVisible()
    const box = (await bar(page).boundingBox())!
    expect(box.height, path).toBeLessThanOrEqual(64)
    expect(box.width, path).toBe(390)
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(390)
  }
})
