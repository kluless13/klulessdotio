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
    expect(order).toEqual(["Writing", "Library", "Quiet"])
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

test.describe("Post page", () => {
  const PART_1 = "/writing/are-prediction-markets-accurate"
  const PART_2 = "/writing/why-prediction-markets-resolve-no"
  const toneIs = (page: import("@playwright/test").Page, tone: string) => expect(page.locator(".writing")).toHaveAttribute("data-tone", tone)

  test("post renders title, meta line, the short version and body in Newsreader", async ({ page }) => {
    await page.goto(`${PART_1}?weather=clear&hour=12`)
    await expect(page.getByRole("heading", { level: 1, name: "Are prediction markets accurate" })).toBeVisible()
    await expect(page.locator(".post-meta")).toHaveText("9 November 2026 · 1 min read · Prediction markets · Part 1 of 7")
    const short = page.getByRole("region", { name: "The short version" })
    await expect(short).toContainText("A short blurb.")
    const para = page.locator(".post-body p").first()
    await expect(para).toContainText("A prediction market price never sits still.")
    const type = await para.evaluate((el) => {
      const style = getComputedStyle(el)
      return { family: style.fontFamily, size: style.fontSize, lead: style.lineHeight, weight: style.fontWeight }
    })
    expect(type.family).toContain("Newsreader")
    expect(type).toMatchObject({ size: "20px", lead: "32px", weight: "400" })
    await expect(page.locator(".post-body h2").first()).toHaveText("What I looked at")
    await expect(page).toHaveTitle("Are prediction markets accurate · Angad Maniyambath")
    await expect(page.locator('head link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute("href", "https://1tx.dev/writing/rss.xml")
  })

  test("figures render with captions and follow the tone", async ({ page }) => {
    await page.goto(`${PART_1}?weather=clear&hour=12`)
    await toneIs(page, "day")
    const figures = page.locator(".post-body figure")
    await expect(figures).toHaveCount(2)
    await expect(figures.first().locator("figcaption")).toHaveText("Prices against how often things happened.")
    await expect(figures.nth(1).locator("figcaption")).toHaveText("A chart with no dark version")
    await expect(figures.first().locator("img.fig-light")).toBeVisible()
    await expect(figures.first().locator("img.fig-dark")).toBeHidden()
    await expect(figures.first().locator("img.fig-dark")).toHaveAttribute("src", "/writing/_test/fixture-chart-dark.png")
    await expect(figures.nth(1)).toHaveClass(/fig-card/)
    await expect(figures.nth(1).locator("img")).toBeVisible()
    await page.goto(`${PART_1}?weather=clear&hour=22`)
    await toneIs(page, "night")
    await expect(figures.first().locator("img.fig-dark")).toBeVisible()
    await expect(figures.first().locator("img.fig-light")).toBeHidden()
    await expect(figures.nth(1).locator("img")).toBeVisible()
  })

  test("series nav shows next only on part 1 and previous on part 2, where part 3 isn't out", async ({ page }) => {
    await page.goto(PART_1)
    const series = page.getByRole("navigation", { name: "Series" })
    await expect(series).toContainText("Prediction market research")
    await expect(series).toContainText("Part 1 of 7")
    await expect(series.locator(".seg-on")).toHaveCount(1)
    await expect(series.locator(".seg")).toHaveCount(7)
    await expect(series.getByRole("link")).toHaveCount(1)
    await expect(series.getByRole("link", { name: /Next: Why prediction markets resolve no/ })).toHaveAttribute("href", PART_2)
    await page.goto(PART_2)
    await expect(series).toContainText("Part 2 of 7")
    await expect(series.getByRole("link")).toHaveCount(1)
    await expect(series.getByRole("link", { name: /Previous: Are prediction markets accurate/ })).toHaveAttribute("href", PART_1)
    await page.goto("/writing/the-99-point-gap")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The 99 point gap")
    await expect(series).toHaveCount(0)
  })

  test("related shows two cards", async ({ page }) => {
    await page.goto(PART_1)
    const related = page.getByRole("region", { name: "Related" })
    const cards = related.getByRole("link")
    await expect(cards).toHaveCount(2)
    await expect(cards.first()).toHaveAttribute("href", PART_2)
    await expect(cards.first()).toContainText("Why prediction markets resolve no")
    await expect(cards.first()).toContainText("A short blurb.")
    await expect(cards.first()).toContainText("9 Nov 2026 · 1 min read")
  })

  test("share copies the link when Web Share is missing", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "share", { value: undefined, configurable: true })
      const copied: string[] = []
      Object.defineProperty(window, "__copied", { value: copied })
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => void copied.push(text) }, configurable: true })
    })
    await page.goto(PART_1)
    const share = page.getByRole("button", { name: "Share" })
    await share.click()
    await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible()
    expect(await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied)).toEqual([
      "https://1tx.dev/writing/are-prediction-markets-accurate",
    ])
    await expect(page.getByRole("button", { name: "Share" })).toBeVisible({ timeout: 4000 })
  })

  test("share uses Web Share when it exists", async ({ page }) => {
    await page.addInitScript(() => {
      const shared: unknown[] = []
      Object.defineProperty(window, "__shared", { value: shared })
      Object.defineProperty(Navigator.prototype, "share", { value: async (data: unknown) => void shared.push(data), configurable: true })
    })
    await page.goto(PART_1)
    await page.getByRole("button", { name: "Share" }).click()
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: unknown[] }).__shared)).toEqual([
      { title: "Are prediction markets accurate", url: "https://1tx.dev/writing/are-prediction-markets-accurate" },
    ])
  })

  test("json-ld BlogPosting is present", async ({ page }) => {
    await page.goto(PART_1)
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b))
    const posting = blocks.find((d) => d["@type"] === "BlogPosting")
    expect(posting).toMatchObject({
      headline: "Are prediction markets accurate",
      url: "https://1tx.dev/writing/are-prediction-markets-accurate",
      isPartOf: { name: "Prediction market research" },
    })
    const crumbs = blocks.find((d) => d["@type"] === "BreadcrumbList")
    expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual(["Home", "Writing", "Are prediction markets accurate"])
  })

  test("unknown slug is 404", async ({ page }) => {
    const response = await page.goto("/writing/not-a-real-post")
    expect(response?.status()).toBe(404)
  })

  test("opengraph-image returns a 1200x630 png for a post", async ({ request }) => {
    const response = await request.get("/writing/are-prediction-markets-accurate/opengraph-image")
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("image/png")
    const bytes = await response.body()
    expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG")
    expect(bytes.readUInt32BE(16)).toBe(1200)
    expect(bytes.readUInt32BE(20)).toBe(630)
  })

  test("opengraph-image for an unknown slug is 404", async ({ request }) => {
    const response = await request.get("/writing/not-a-real-post/opengraph-image")
    expect(response.status()).toBe(404)
  })
})

test.describe("About", () => {
  test("about renders portrait, bio, Elsewhere with four links including ORCID, and Person json-ld", async ({ page }) => {
    await page.goto("/about?hour=12&weather=clear")
    await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible()
    await expect(page.locator("img.about-photo")).toHaveAttribute("src", /angad\.jpg/)
    await expect(page.locator(".about-bio")).toContainText("Head of AI at Truflation")
    await expect(page.locator(".about-bio")).toContainText("SoftwareX")
    const links = page.getByRole("region", { name: "Elsewhere" }).getByRole("link")
    await expect(links).toHaveCount(4)
    await expect(links.nth(3)).toHaveAttribute("href", "https://orcid.org/0009-0000-0985-4721")
    await expect(page.getByRole("link", { name: /Writing/ }).last()).toBeVisible()
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b))
    expect(blocks.find((d) => d["@type"] === "Person")).toMatchObject({ "@id": "https://1tx.dev/#angad", jobTitle: "Head of AI" })
    expect(blocks.find((d) => d["@type"] === "BreadcrumbList")).toBeTruthy()
  })

  test("home has Person json-ld", async ({ page }) => {
    await page.goto("/?weather=partly&hour=12")
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b))
    expect(blocks.find((d) => d["@type"] === "Person")).toMatchObject({ "@id": "https://1tx.dev/#angad" })
    expect(blocks.find((d) => d["@type"] === "WebSite")).toBeTruthy()
  })
})

test.describe("Email gate", () => {
  const WITH_DOWNLOAD = "/writing/claude-code-notes"
  const ok = { status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) }
  const fail = (status: number, error: string) => ({ status, contentType: "application/json", body: JSON.stringify({ success: false, error }) })

  test("shows success copy after submit", async ({ page }) => {
    let body: unknown
    let contentType: string | undefined
    await page.route("**/api/subscribe", async (route) => {
      body = route.request().postDataJSON()
      contentType = route.request().headers()["content-type"]
      await route.fulfill(ok)
    })
    await page.goto(WITH_DOWNLOAD)
    const gate = page.getByRole("region", { name: "Claude Code starter kit" })
    await expect(gate).toContainText("My CLAUDE.md, rules, hooks and agent setup, ready to copy.")
    await expect(gate).toContainText("I'll email you the link and add you to my list. One click to unsubscribe, any time.")
    await gate.getByLabel("Email").fill("reader@example.com")
    await gate.getByRole("button", { name: "Send it to me" }).click()
    await expect(gate).toContainText("Check your inbox. The link works for 7 days.")
    expect(body).toEqual({ email: "reader@example.com", downloadId: "claude-code-starter-kit", slug: "claude-code-notes", consent: true, company_url: "" })
    expect(contentType).toContain("application/json")
  })

  test("shows the invalid email copy on 400", async ({ page }) => {
    await page.route("**/api/subscribe", (route) => route.fulfill(fail(400, "invalid_email")))
    await page.goto(WITH_DOWNLOAD)
    await page.getByLabel("Email").fill("reader@example.com")
    await page.getByRole("button", { name: "Send it to me" }).click()
    await expect(page.getByText("That email doesn't look right.")).toBeVisible()
  })

  test("shows the right copy for rate limits and server errors", async ({ page }) => {
    await page.route("**/api/subscribe", (route) => route.fulfill(fail(429, "rate_limited")))
    await page.goto(WITH_DOWNLOAD)
    await page.getByLabel("Email").fill("reader@example.com")
    await page.getByRole("button", { name: "Send it to me" }).click()
    await expect(page.getByText("Too many tries. Give it an hour.")).toBeVisible()
    await page.unroute("**/api/subscribe")
    await page.route("**/api/subscribe", (route) => route.abort())
    await page.getByRole("button", { name: "Send it to me" }).click()
    await expect(page.getByText("Something went wrong on my end. Try again in a minute.")).toBeVisible()
  })

  test("disables the button while sending", async ({ page }) => {
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => (release = resolve))
    await page.route("**/api/subscribe", async (route) => {
      await gate
      await route.fulfill(ok)
    })
    await page.goto(WITH_DOWNLOAD)
    await page.getByLabel("Email").fill("reader@example.com")
    const button = page.getByRole("button", { name: "Send it to me" })
    await button.click()
    await expect(button).toBeDisabled()
    release()
    await expect(page.getByText("Check your inbox. The link works for 7 days.")).toBeVisible()
  })

  test("gate is absent on posts without a download", async ({ page }) => {
    await page.goto("/writing/are-prediction-markets-accurate")
    await expect(page.getByRole("button", { name: "Send it to me" })).toHaveCount(0)
    await expect(page.locator(".email-gate")).toHaveCount(0)
  })
})

test.describe("Reading on the sheet", () => {
  test("charts without a dark variant sit on a card at night", async ({ page }) => {
    await page.goto("/writing/are-prediction-markets-accurate?hour=22&weather=clear")
    await expect(page.locator(".writing")).toHaveAttribute("data-tone", "night")
    const card = page.locator(".post-figure.fig-card img")
    await expect(card).toHaveCount(1)
    await expect(card).toBeVisible()
    const style = await card.evaluate((img) => {
      const css = getComputedStyle(img)
      return { background: css.backgroundColor, radius: parseFloat(css.borderTopLeftRadius) }
    })
    expect(style.background).toBe("rgb(255, 255, 255)")
    expect(style.radius).toBeGreaterThan(0)
    const paired = page.locator(".post-figure:not(.fig-card)")
    await expect(paired.locator(".fig-dark")).toBeVisible()
    await expect(paired.locator(".fig-light")).toBeHidden()
  })

  test("at 390px the index, a post and about have no horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const path of ["/writing", "/writing/are-prediction-markets-accurate", "/writing/claude-code-notes", "/about"]) {
      for (const hour of [12, 22]) {
        await page.goto(`${path}?hour=${hour}&weather=clear`)
        const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
        expect(scroll, `${path} at hour ${hour}`).toBeLessThanOrEqual(client)
      }
    }
  })
})
