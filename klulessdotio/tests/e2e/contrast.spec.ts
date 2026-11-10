import { expect, test, type Page } from "@playwright/test"
import { signKitToken } from "../../lib/downloads/token"
import { WEATHER_KEYS, contrast, inkVars, skyView } from "../../lib/sky/model"

const hex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t)

// Samples the whole screen, including where the top buttons sit. Storm is measured at the peak of a lightning flash.
test("text and buttons stay readable across every half hour in all weather", async ({ page }) => {
  await page.goto("/?weather=clear&hour=12")
  await page.waitForFunction(() => "__skyAudit" in window)
  const states = await page.evaluate((weathers) => {
    const audit = (window as unknown as { __skyAudit: (h: number, w: string, x: number[], y: number[], n: number, flash?: number) => number[][] }).__skyAudit
    return weathers.flatMap((weather) =>
      Array.from({ length: 48 }, (_, i) => ({ weather, hour: i / 2, pixels: audit(i / 2, weather, [0.03, 0.97], [0.03, 0.97], 5, weather === "storm" ? 1 : 0) })),
    )
  }, [...WEATHER_KEYS])
  expect(states).toHaveLength(288)

  const failures: string[] = []
  for (const { weather, hour, pixels } of states) {
    const vars = inkVars(skyView({ hour, weather, date: new Date() }).light)
    const ink = hex(vars["--ink"])
    const surface = mix(hex(vars["--b-top"]), hex(vars["--b-bot"]), 0.5)
    for (const sky of pixels) {
      if (contrast(ink, sky) < 4.5) failures.push(`${weather} ${hour} text ${contrast(ink, sky).toFixed(2)}`)
      if (contrast(mix(sky, ink, 0.92), sky) < 4.5) failures.push(`${weather} ${hour} soft`)
      if (contrast(surface, sky) < 3) failures.push(`${weather} ${hour} button ${contrast(surface, sky).toFixed(2)}`)
    }
  }
  expect(failures.slice(0, 10)).toEqual([])
})

type Rgba = [number, number, number, number]

// Runs in the page: for every text element on the sheet, composites the text and every background up to the sheet
// over each sampled sky colour and returns the worst ratio.
function measureSheet({ skies, selector }: { skies: number[][]; selector: string }) {
  const parse = (value: string): Rgba => {
    const m = value.match(/rgba?\(([^)]+)\)/)
    if (!m) return [0, 0, 0, 0]
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return [r, g, b, a]
  }
  const over = (top: Rgba, under: number[]) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3]))
  const lum = (c: number[]) => {
    const [r, g, b] = c.map((v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a: number[], b: number[]) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
  const sheet = document.querySelector(selector) as HTMLElement
  const results: { label: string; worst: number }[] = []
  const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT)
  const seen = new Set<Element>()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement
    if (!el || seen.has(el) || !node.textContent?.trim()) continue
    seen.add(el)
    if (getComputedStyle(el).display === "none" || el.closest(".btn, .lx")) continue // buttons and library exhibits draw on gradients and have their own check
    const layers: Rgba[] = []
    for (let cur: Element | null = el; cur; cur = cur === sheet ? null : cur.parentElement) layers.push(parse(getComputedStyle(cur).backgroundColor))
    const text = parse(getComputedStyle(el).color)
    const worst = Math.min(
      ...skies.map((sky) => {
        let bg = sky
        for (const layer of [...layers].reverse()) bg = over(layer, bg)
        return ratio(over(text, bg), bg)
      }),
    )
    results.push({ label: `${el.tagName.toLowerCase()}.${el.className} "${(el.textContent ?? "").trim().slice(0, 30)}"`, worst })
  }
  return results
}

// Hides the sheet (or just what sits on it), screenshots what's behind and returns its darkest and lightest sampled pixels.
async function sampleSky(page: Page, selector = ".sheet", hide = selector): Promise<number[][]> {
  const style = await page.addStyleTag({ content: `${hide}, .visitor-toast{visibility:hidden!important}` })
  const box = await page.locator(selector).boundingBox()
  const view = page.viewportSize()
  if (!box || !view) throw new Error("sheet not found")
  // Tall regions (the whole Library) are sampled over the part that is on screen.
  const y = Math.max(0, box.y)
  const clip = { x: Math.max(0, box.x), y, width: Math.min(box.width, view.width), height: Math.min(box.height, 700, view.height - y) }
  const shot = (await page.screenshot({ clip })).toString("base64")
  return page.evaluate(async (data) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob())
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(bitmap, 0, 0)
    const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let dark = [255, 255, 255]
    let light = [0, 0, 0]
    const sum = (c: number[]) => c[0] + c[1] + c[2]
    for (let i = 0; i < px.length; i += 4 * 7) {
      const c = [px[i], px[i + 1], px[i + 2]]
      if (sum(c) < sum(dark)) dark = c
      if (sum(c) > sum(light)) light = c
    }
    return [dark, light]
  }, shot).finally(() => style.evaluate((el) => (el as Element).remove()))
}

test.describe("Reading sheet contrast", () => {
  for (const [tone, hour] of [["day", 12], ["night", 22]] as const) {
    test(`post text and soft text on the sheet pass 4.5:1 in ${tone}`, async ({ page }) => {
      for (const path of ["/writing/claude-code-notes", "/writing/are-prediction-markets-accurate"]) {
        await page.goto(`${path}?hour=${hour}&weather=clear`)
        await expect(page.locator(".writing")).toHaveAttribute("data-tone", tone)
        await page.waitForTimeout(1000) // let the sheet colour transition settle
        const skies = await sampleSky(page)
        const results = await page.evaluate(measureSheet, { skies, selector: ".sheet" })
        expect(results.length).toBeGreaterThan(10)
        // The sheet has both an ink and a soft colour in use, so both are covered by the element sweep
        expect(new Set(results.map((r) => r.label.split(" ")[0])).size).toBeGreaterThan(3)
        const failing = results.filter((r) => r.worst < 4.5).map((r) => `${r.label} ${r.worst.toFixed(2)}`)
        expect(failing, `${tone} ${path}`).toEqual([])
      }
    })
  }
})

test.describe("Library contrast", () => {
  for (const [tone, hour] of [["day", 12], ["night", 22]] as const) {
    test(`library head and sheets pass 4.5:1 in ${tone}`, async ({ page }) => {
      await page.route("**/api/visitor", (route) => route.fulfill({ json: { success: true, data: { number: 7 } } }))
      await page.goto(`/library?hour=${hour}&weather=clear`)
      await expect(page.locator(".library")).toHaveAttribute("data-tone", tone)
      await page.waitForTimeout(1000)
      const head = await page.evaluate(measureSheet, { skies: await sampleSky(page, ".lib-head"), selector: ".lib-head" })
      expect(head.length).toBeGreaterThan(2)
      expect(head.filter((r) => r.worst < 4.5).map((r) => `${r.label} ${r.worst.toFixed(2)}`), `${tone} head`).toEqual([])

      for (const view of ["Grid", "List"]) {
        await page.getByRole("button", { name: view, exact: true }).click()
        await page.waitForTimeout(300)
        const body = await page.evaluate(measureSheet, { skies: await sampleSky(page, ".lib-sections"), selector: ".lib-sections" })
        // Tile names and kinds, section headings and counts, for every tile in the page.
        expect(body.length, `${tone} ${view} text count`).toBeGreaterThan(40)
        expect(body.filter((r) => r.worst < 4.5).map((r) => `${r.label} ${r.worst.toFixed(2)}`), `${tone} ${view} sections`).toEqual([])
      }

      for (const slug of ["geist", "aqua"]) {
        await page.goto(`/library/${slug}?hour=${hour}&weather=clear`)
        await expect(page.locator(".library")).toHaveAttribute("data-tone", tone)
        await page.waitForTimeout(1000)
        const results = await page.evaluate(measureSheet, { skies: await sampleSky(page, ".lib-sheet"), selector: ".lib-sheet" })
        expect(results.length).toBeGreaterThan(5)
        const failing = results.filter((r) => r.worst < 4.5).map((r) => `${r.label} ${r.worst.toFixed(2)}`)
        expect(failing, `${tone} ${slug}`).toEqual([])
      }
    })
  }
})

// The toast's lead text is a 66% mix of the button ink, so it is measured over both ends of the button gradient.
test.describe("Visitor toast contrast", () => {
  for (const [tone, hour] of [["day", 12], ["night", 22]] as const) {
    test(`the muted lead passes 4.5:1 in ${tone}`, async ({ page }) => {
      await page.route("**/api/visitor", (route) => route.fulfill({ json: { success: true, data: { number: 7 } } }))
      await page.goto(`/?hour=${hour}&weather=clear`)
      await expect(page.locator(".visitor-lead")).toHaveText("You're visitor")
      await page.waitForTimeout(1000)
      const worst = await page.locator(".visitor-lead").evaluate((lead) => {
        const toast = lead.closest(".visitor-toast") as HTMLElement
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 1
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!
        const rgba = (css: string) => {
          ctx.clearRect(0, 0, 1, 1)
          ctx.fillStyle = "#000"
          ctx.fillStyle = css
          ctx.fillRect(0, 0, 1, 1)
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
          return [r, g, b, a / 255]
        }
        const over = (top: number[], under: number[]) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3]))
        const lum = (c: number[]) => {
          const [r, g, b] = c.map((v) => {
            const x = v / 255
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
          })
          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }
        const ratio = (a: number[], b: number[]) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
        const vars = getComputedStyle(toast)
        const text = rgba(getComputedStyle(lead).color)
        return Math.min(
          ...["--b-top", "--b-bot"].map((name) => {
            const bg = over(rgba(vars.getPropertyValue(name).trim()), [255, 255, 255])
            return ratio(over(text, bg), bg)
          }),
        )
      })
      expect(worst).toBeGreaterThanOrEqual(4.5)
    })
  }
})

test.describe("Kit contrast", () => {
  for (const [tone, hour] of [["day", 12], ["night", 22]] as const) {
    test(`the signup page and the kit pass 4.5:1 in ${tone}`, async ({ page }) => {
      const token = signKitToken("e2e@example.com", "e2e-kit-secret")
      for (const [name, path] of [["kit signup", "/kit"], ["kit page", `/kit/${token}`]] as const) {
        await page.goto(`${path}?hour=${hour}&weather=clear`)
        await expect(page.locator(".kit").first()).toHaveAttribute("data-tone", tone)
        await expect(page.locator("mark.hl:not([data-inked])")).toHaveCount(0)
        // Poll until the sheet colour transition has settled and the measured text passes
        await expect(async () => {
          const skies = await sampleSky(page, ".kit-sheet")
          const results = await page.evaluate(measureSheet, { skies, selector: ".kit-sheet" })
          expect(results.length).toBeGreaterThan(10)
          const failing = results.filter((r) => r.worst < 4.5).map((r) => `${r.label} ${r.worst.toFixed(2)}`)
          expect(failing, `${tone} ${name}`).toEqual([])
        }).toPass({ timeout: 10000 })
      }
    })
  }
})

// The bar is the same sky strip by day and night, so its words are measured over the strip itself, wide and narrow.
test.describe("Kit bar contrast", () => {
  for (const [tone, hour] of [["day", 12], ["night", 22]] as const) {
    test(`the kit bar text passes 4.5:1 in ${tone}`, async ({ page }) => {
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 800 })
        await page.goto(`/writing?hour=${hour}&weather=clear`)
        await expect(page.locator(".writing")).toHaveAttribute("data-tone", tone)
        const skies = await sampleSky(page, ".kitbar", ".kitbar-content, .kitbar-close")
        const results = await page.evaluate(measureSheet, { skies, selector: ".kitbar-line" })
        expect(results.length, `${tone} ${width}`).toBeGreaterThan(0)
        const failing = results.filter((r) => r.worst < 4.5).map((r) => `${r.label} ${r.worst.toFixed(2)}`)
        expect(failing, `${tone} ${width}`).toEqual([])

        // The button's label over every stop of its yellow face, at rest and on hover
        const cta = page.locator(".kitbar-cta")
        await page.mouse.move(0, 400)
        expect(await cta.evaluate(measureFace), `${tone} ${width} button`).toBeGreaterThanOrEqual(4.5)
        await cta.hover()
        await expect(cta).toHaveCSS("background-image", /255, 229, 130/)
        expect(await cta.evaluate(measureFace), `${tone} ${width} button hover`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})

// Runs in the page: the worst ratio of an element's text over each colour stop of its background gradient.
function measureFace(el: Element) {
  const rgb = (css: string) => (css.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number)
  const lum = (c: number[]) => {
    const [r, g, b] = c.map((v) => {
      const x = v / 255
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a: number[], b: number[]) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
  const style = getComputedStyle(el)
  const stops = (style.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []).map(rgb)
  if (stops.length < 2) throw new Error(`no gradient on ${el.className}`)
  const text = rgb(style.color)
  return Math.min(...stops.map((stop) => ratio(text, stop)))
}
