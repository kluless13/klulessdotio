import { expect, test } from "@playwright/test"

test.describe("KalibreTrades concept", () => {
  test("stays out of search and keeps 1tx.dev's chrome off the page", async ({ page }) => {
    const response = await page.goto("/kalibre")
    expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Get paid on time.")
    await expect(page.getByRole("complementary", { name: "Starter kit" })).toHaveCount(0)
  })

  test("signs up through the hero form and shows what happens next", async ({ page }) => {
    await page.goto("/kalibre")
    const hero = page.locator(".kt-hero-form")
    await hero.getByRole("button", { name: "Get priority access" }).click()
    await expect(hero.getByText("Add your first name.")).toBeVisible()

    await hero.getByLabel("First name").fill("Amira")
    await hero.getByLabel("Email").fill("amira@example.com")
    await hero.getByRole("combobox", { name: /Where are you based/ }).click()
    await hero.getByRole("option", { name: "Europe" }).click()
    await hero.getByRole("button", { name: "Get priority access" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog.getByText("You’re on the list, Amira.")).toBeVisible()
    await dialog.getByRole("button", { name: "Got it" }).click()
    await expect(dialog).toHaveCount(0)
    await expect(hero.getByRole("status")).toContainText("You’re on the list, Amira.")
  })

  test("rolls the figures when the account size changes", async ({ page }) => {
    await page.goto("/kalibre")
    await page.getByRole("button", { name: "£100k" }).click()
    await expect(page.getByRole("slider", { name: "Account size" })).toHaveAttribute("aria-valuenow", "100000")
    await expect(page.locator(".kt-figure .kt-sr").last()).toHaveText("£92,000")
  })

  test("opens and closes the phone menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/kalibre")
    await page.getByRole("button", { name: /Menu/ }).click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await expect(menu).toBeVisible()
    await menu.getByRole("link", { name: /Drawdown/ }).click()
    await expect(menu).toHaveCount(0)
    await expect(page.locator("#drawdown")).toBeInViewport()
  })
})
