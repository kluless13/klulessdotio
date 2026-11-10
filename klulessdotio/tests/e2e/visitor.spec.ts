import { expect, test, type Page } from "@playwright/test"

const HOME = "/?weather=partly&hour=12"

// Answers /api/visitor without Redis and counts the calls.
async function stubVisitor(page: Page, number = 7) {
  const calls = { count: 0 }
  await page.route("**/api/visitor", async (route) => {
    calls.count += 1
    await route.fulfill({ json: { success: true, data: { number } } })
  })
  return calls
}

test.describe("Visitor counter", () => {
  test("the first visit shows the number, a reload welcomes back without asking again", async ({ page }) => {
    const calls = await stubVisitor(page)
    await page.goto(HOME)
    await expect(page.locator(".visitor-toast")).toContainText("You're visitor")
    await expect(page.locator(".visitor-toast")).toContainText("#7")
    expect(calls.count).toBe(1)
    await page.reload()
    await expect(page.locator(".visitor-toast")).toContainText("Welcome back, visitor")
    await expect(page.locator(".visitor-toast")).toContainText("#7")
    expect(calls.count).toBe(1)
  })

  test("Close hides it for the rest of the session", async ({ page }) => {
    await stubVisitor(page)
    await page.goto(HOME)
    const toast = page.locator(".visitor-toast")
    await expect(toast).toBeVisible()
    await toast.getByRole("button", { name: "Close" }).click()
    await expect(toast).toHaveCount(0)
    await page.reload()
    await page.waitForTimeout(500)
    await expect(toast).toHaveCount(0)
  })

  test("it also shows on the Library", async ({ page }) => {
    await stubVisitor(page)
    await page.goto("/library?weather=clear&hour=12")
    await expect(page.locator(".visitor-toast")).toContainText("#7")
  })

  // The toast sits inside the noise layer, which goes opacity 0 and inert in Quiet.
  test("entering Quiet mode hides it", async ({ page }) => {
    await stubVisitor(page)
    await page.goto(HOME)
    const toast = page.locator(".visitor-toast")
    await expect(toast).toBeVisible()
    await page.getByRole("button", { name: "Quiet" }).click()
    const layer = page.getByTestId("noise")
    await expect(layer).toHaveCSS("opacity", "0")
    await expect(layer).toHaveAttribute("inert", "")
  })
})
