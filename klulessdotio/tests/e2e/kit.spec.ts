import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { signKitToken } from "../../lib/downloads/token";
import { parseKit } from "../../lib/kit/parse";

const SKY = "hour=12&weather=clear";
const SECRET = "e2e-kit-secret";
// The prompt text comes from the fixture itself rather than a hand-copied string
const FIXTURE = "tests/fixtures/kit/kit.md";
async function fixturePrompt(): Promise<string> {
  const doc = await parseKit(readFileSync(FIXTURE, "utf8"));
  const block = doc.blocks.find((b) => b.type === "prompt");
  if (!block || block.type !== "prompt")
    throw new Error("fixture has no prompt block");
  return block.text;
}
const kitPath = (query = SKY) =>
  `/kit/${signKitToken("e2e@example.com", SECRET)}?${query}`;

// The kit page is the only place with mono text, so it needs a settled sky before its notes are measured.
async function openKit(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(kitPath());
  await expect(page.locator("aside.kit-note").first()).toBeVisible();
  await expect(page.locator(".note-on[data-inked]").first()).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  // Every underline is drawn, and on desktop every note has been placed level with its words
  await expect(page.locator(".note-on:not([data-inked])")).toHaveCount(0);
  if (width >= 1100)
    await expect(page.locator("aside.kit-note:not([data-placed])")).toHaveCount(
      0,
    );
}

test.describe("Kit signup page", () => {
  test("has the title and one-line subtitle, and no reading time", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/kit?${SKY}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Talk to it. It does the work.",
    );
    const dek = page.locator(".kit-dek");
    await expect(dek).toHaveText(
      "A free starter kit for getting AI agents to do real work in your tools. No code.",
    );
    expect((await dek.boundingBox())!.height).toBeLessThan(40);
    await expect(page.getByText(/min read/i)).toHaveCount(0);
  });

  test("the email form sits right under the title, above the intro", async ({
    page,
  }) => {
    await page.goto(`/kit?${SKY}`);
    const form = await page.locator(".kit-gate").boundingBox();
    const intro = await page.locator(".kit-prose").boundingBox();
    const head = await page.locator(".kit-head").boundingBox();
    expect(form!.y).toBeGreaterThan(head!.y + head!.height - 1);
    expect(form!.y).toBeLessThan(intro!.y);
  });

  test("highlights are inked with SVG strokes", async ({ page }) => {
    await page.goto(`/kit?${SKY}`);
    const mark = page.locator("mark.hl").first();
    await expect(mark).toHaveAttribute("data-inked", "");
    expect(await mark.locator("svg").count()).toBeGreaterThan(0);
  });

  test("submitting an email posts kind kit and shows the sent message", async ({
    page,
  }) => {
    let body: Record<string, unknown> | undefined;
    await page.route("**/api/subscribe", (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({ status: 200, json: { success: true } });
    });
    await page.goto(`/kit?${SKY}`);
    await page.getByLabel("Email", { exact: true }).fill("reader@example.com");
    await page.getByRole("button", { name: "Send me the kit" }).click();
    await expect(
      page.getByRole("heading", { name: "It's on its way." }),
    ).toBeFocused();
    await expect(page.locator(".kit-sent-line")).toHaveText(
      "Sent to reader@example.com. Your link works for good.",
    );
    expect(body).toMatchObject({ kind: "kit", email: "reader@example.com" });
  });
});

test.describe("Kit page", () => {
  test("a valid link renders the kit with inked highlights, and is kept out of search and referrers", async ({
    page,
  }) => {
    const response = await page.goto(kitPath());
    expect(response!.status()).toBe(200);
    expect(response!.headers()["x-robots-tag"]).toContain("noindex");
    expect(response!.headers()["referrer-policy"]).toBe("no-referrer");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Plant watering sample",
    );
    expect(await page.locator("mark.hl").count()).toBeGreaterThan(0);
    const mark = page.locator("mark.hl").first();
    await expect(mark).toHaveAttribute("data-inked", "");
    expect(await mark.locator("svg").count()).toBeGreaterThan(0);
  });

  const BAD_LINKS = [
    "/kit/garbage",
    "/kit/%%%",
    "/kit/%E0%A4%A",
    "/kit/a.b.c",
    `/kit/${"x".repeat(3000)}`,
  ];
  for (const path of BAD_LINKS) {
    test(`a bad link ${path.slice(0, 24)} gets the friendly state without a crash`, async ({
      page,
    }) => {
      const response = await page.goto(path);
      const status = response!.status();
      expect([200, 400, 404], `status ${status}`).toContain(status);
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toBeVisible();
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/Unhandled|Error:|at .*\(.*:\d+/);
      if (status === 200)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "This link doesn't work.",
        );
    });
  }

  test("a bad link also offers the signup form", async ({ page }) => {
    await page.goto("/kit/garbage");
    await expect(page.getByText("This link doesn't work")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send me the kit" }),
    ).toBeVisible();
  });

  test("desktop: each note sits right of the text, level with its words", async ({
    page,
  }) => {
    await openKit(page, 1440, 900);
    const notes = page.locator("aside.kit-note");
    const count = await notes.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await expect(async () => {
      for (let i = 0; i < count; i++) {
        const note = notes.nth(i);
        const group = note.locator(
          "xpath=ancestor::*[contains(@class,'kit-noted')][1]",
        );
        const n = await note.getAttribute("data-note");
        const words = group.locator(`.note-on[data-note="${n}"]`);
        const noteBox = (await note.boundingBox())!;
        const column = (await group
          .locator("> :not(aside)")
          .first()
          .boundingBox())!;
        const wordsBox = (await words.first().boundingBox())!;
        expect(noteBox.x, `note ${i} right of column`).toBeGreaterThanOrEqual(
          column.x + column.width,
        );
        expect(
          Math.abs(noteBox.y - wordsBox.y),
          `note ${i} level with words`,
        ).toBeLessThanOrEqual(12);
      }
    }).toPass();
  });

  test("phone: each note sits under its block and nothing scrolls sideways", async ({
    page,
  }) => {
    await openKit(page, 390, 844);
    const notes = page.locator("aside.kit-note");
    const count = await notes.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await expect(async () => {
      for (let i = 0; i < count; i++) {
        const note = notes.nth(i);
        const block = (await note
          .locator("xpath=preceding-sibling::*[not(self::aside)][1]")
          .boundingBox())!;
        const noteBox = (await note.boundingBox())!;
        expect(noteBox.y, `note ${i} under block`).toBeGreaterThanOrEqual(
          block.y + block.height - 1,
        );
        expect(noteBox.x + noteBox.width).toBeLessThanOrEqual(390);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(390);
    }).toPass();
  });

  test("note underlines are inked", async ({ page }) => {
    await openKit(page, 1440, 900);
    const words = page.locator(".note-on").first();
    await expect(words).toHaveAttribute("data-inked", "");
    expect(await words.locator("svg").count()).toBeGreaterThan(0);
  });

  test("Copy prompt puts the exact prompt on the clipboard", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(kitPath());
    await page.getByRole("button", { name: "Copy prompt" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await fixturePrompt(),
    );
  });

  // The real Cal embed's network isn't exercised here (external). Task 7 observed the popup request as
  // .../show-me/embed?theme=...&embedType=modal with no token; re-check manually at launch.
  test("the booking button falls back to a normal link, and no token reaches Cal", async ({
    page,
  }) => {
    const calRequests: string[] = [];
    await page.route("https://app.cal.com/**", (route) => route.abort());
    page.on("request", (req) => {
      if (/cal\.com/.test(req.url()))
        calRequests.push(req.url() + (req.postData() ?? ""));
    });
    await page.route("https://cal.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<title>cal</title>",
      }),
    );
    const path = kitPath();
    const token = path.split("/")[2].split("?")[0];
    await page.goto(path);
    const button = page.locator("a.kit-cal").first();
    await expect(button).toHaveAttribute(
      "href",
      "https://cal.com/angad888/show-me",
    );
    await expect(
      page.locator(`script[src="https://app.cal.com/embed/embed.js"]`),
    ).toHaveAttribute("data-state", "failed");
    // Navigating proves the click was not prevented
    await Promise.all([
      page.waitForURL(/cal\.com\/angad888\/show-me/),
      button.click(),
    ]);
    expect(calRequests.filter((r) => r.includes(token))).toEqual([]);
  });
});

test.describe("Unsubscribe page", () => {
  test("done says the kit link still works", async ({ page }) => {
    await page.goto("/unsubscribe?status=done");
    await expect(
      page.getByText("You're unsubscribed. Your kit link still works."),
    ).toBeVisible();
  });

  const PRIVATE = { "referrer-policy": "no-referrer", "x-robots-tag": "noindex, nofollow" };

  test("the page that carries the token keeps it from referrers and search", async ({ request }) => {
    const res = await request.get("/unsubscribe?token=abc.def");
    expect(res.status()).toBe(200);
    expect(res.headers()).toMatchObject(PRIVATE);
  });

  test("the unsubscribe link keeps its token from referrers and search, even on its redirect", async ({ request }) => {
    const res = await request.get("/api/unsubscribe/abc.def", { maxRedirects: 0 });
    expect(res.status()).toBe(303);
    expect(res.headers()).toMatchObject(PRIVATE);
  });
});

test.describe("Kit share image", () => {
  test("is served without the private headers that kit links carry", async ({ request }) => {
    const res = await request.get("/kit/og.jpg");
    expect(res.status()).toBe(200);
    expect(res.headers()["x-robots-tag"]).toBeUndefined();
    expect(res.headers()["referrer-policy"]).toBeUndefined();
    const link = await request.get(`/kit/${signKitToken("e2e@example.com", SECRET)}`);
    expect(link.headers()["x-robots-tag"]).toContain("noindex");
  });
});
