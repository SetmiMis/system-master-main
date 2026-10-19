import { expect, test, type Page } from "@playwright/test";

const scene = (page: Page) => page.locator('[aria-roledescription="scene"]').last();
const enter = async (page: Page, how: "with sound" | "silently" = "silently") => {
  await page.goto("/");
  await page.getByRole("button", { name: `Enter ${how}` }).click();
  await expect(page.getByRole("dialog", { name: "Welcome to SETMI INDIA" })).toHaveCount(0, { timeout: 5_000 });
};
const jump = async (page: Page, re: RegExp) => {
  await page.getByRole("button", { name: "All scenes" }).click();
  await page.getByRole("button", { name: re }).click();
};

test("gate opens into the film; the page fits the screen and does not scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Welcome to SETMI INDIA" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Every connection enables");
  await page.getByRole("button", { name: "Enter silently" }).click();
  await expect(page.getByRole("dialog", { name: "Welcome to SETMI INDIA" })).toHaveCount(0, { timeout: 5_000 });
  const o = await page.evaluate(() => ({ x: document.documentElement.scrollWidth - innerWidth, y: document.documentElement.scrollHeight - innerHeight }));
  expect(o.x).toBeLessThanOrEqual(0);
  expect(o.y).toBeLessThanOrEqual(0);
});

test("film waits behind the gate, then auto-advances; pause stops it", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.waitForTimeout(9_000);
  await expect(scene(page)).toHaveAttribute("aria-label", "Welcome");
  await page.getByRole("button", { name: "Enter silently" }).click();
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are", { timeout: 12_000 });
  await page.getByRole("button", { name: "Pause" }).click();
  await page.waitForTimeout(12_000);
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are");
});

test("next, previous, keyboard and the scene list move between scenes", async ({ page }) => {
  await enter(page);
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Next scene" }).click();
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are");
  await page.keyboard.press("ArrowRight");
  await expect(scene(page)).toHaveAttribute("aria-label", "What we supply");
  await page.getByRole("button", { name: "Previous scene" }).click();
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are");
  await jump(page, /Scene 7: How an order moves/);
  await expect(scene(page)).toHaveAttribute("aria-label", "How an order moves");
  await expect(page.getByText("Sales FMS").first()).toBeVisible();
});

test("captions switch between English and Hindi; sound toggles", async ({ page }) => {
  await enter(page);
  await expect(page.getByText("Every connection enables something greater.").last()).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "हिं" }).click();
  await expect(page.getByText("हर कनेक्शन कुछ बड़ा संभव बनाता है।")).toBeVisible();
  await page.getByRole("button", { name: "Captions on" }).click();
  await expect(page.getByRole("button", { name: "Captions off" })).toBeVisible();
  await page.getByRole("button", { name: "Sound off" }).click();
  await expect(page.getByRole("button", { name: "Sound on" })).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion: the film starts paused after the gate", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/");
  await page.getByRole("button", { name: "Enter silently" }).click();
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  await page.waitForTimeout(9_000);
  await expect(scene(page)).toHaveAttribute("aria-label", "Welcome");
  await ctx.close();
});

test("3D scenes (connector, customer map) load without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await jump(page, /Scene 5: Inside a connector/);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await jump(page, /Scene 6: Our customers/);
  await expect(page.getByText("customers on the map")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Next scene" }).click();
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test("trust scenes: certificate, registrations, marketplaces, rating", async ({ page }) => {
  await enter(page);
  await page.getByRole("button", { name: "Pause" }).click();
  await jump(page, /Scene 9: Verified quality/);
  await expect(page.getByText("IN/66820947/4632")).toBeVisible();
  await expect(page.getByText("07AIJPK2678P1ZI")).toBeVisible();
  await expect(page.getByText("UDYAM-DL-01-0016520")).toBeVisible();
  await expect(page.getByRole("link", { name: /Find us on GeM/ })).toHaveAttribute("href", "https://gem.gov.in");
  await jump(page, /Scene 10: What customers say/);
  await expect(page.getByText(/Rated 4\.9 on Google by 301 customers/).first()).toBeVisible();
});

test("systems come from the database and link out; dashboard shows no sample numbers", async ({ page }) => {
  await enter(page);
  await page.getByRole("button", { name: "Pause" }).click();
  await jump(page, /Scene 8: Our systems/);
  await expect(page.getByRole("link", { name: /Sales FMS/ })).toHaveAttribute("href", "https://sales-fms.vercel.app");
  await page.goto("/systems");
  await expect(page.getByRole("link", { name: /Purchase FMS/ })).toHaveAttribute("href", "https://setmi-purchase-fms.vercel.app");
  await page.goto("/dashboard");
  await expect(page.getByText("We do not show sample numbers.")).toBeVisible();
});

test("product pages resolve, list live store products and link to setmiindia.com", async ({ page, request }) => {
  await page.goto("/products");
  await page.getByRole("link", { name: /Couplers/ }).first().click();
  await expect(page).toHaveURL(/\/products\/couplers$/);
  expect(await page.getByRole("link", { name: /Full range/ }).getAttribute("href")).toBe("https://setmiindia.com/product-category/connectors/couplers/");
  await expect(page.getByRole("heading", { name: /products in Couplers/ })).toBeVisible();
  expect((await request.get("/products/does-not-exist")).status()).toBe(404);
});

test("FAQ page opens an answer", async ({ page }) => {
  await page.goto("/faq");
  await page.getByText("How can I request a quotation?").click();
  await expect(page.getByText("tell us the items and quantities")).toBeVisible();
});

test("enquiry page preselects the category; API validates and rejects honeypot", async ({ page, request }) => {
  await page.goto("/enquiry?category=cables");
  await expect(page.getByLabel("Product area")).toHaveValue("cables");
  expect((await request.post("/api/enquiry", { data: { category: "x", name: "A", contact: "1", message: "" } })).status()).toBe(400);
  expect((await request.post("/api/enquiry", { data: { category: "x", name: "Bot", contact: "bot@x.com", message: "spam spam", website: "http://x" } })).status()).toBe(400);
});

test("expo gallery opens the lightbox", async ({ page }) => {
  await page.goto("/expo");
  await page.getByRole("button", { name: "Open expo photo 1 of 20" }).click();
  await expect(page.getByRole("dialog", { name: "Expo photo viewer" })).toBeVisible();
  await expect(page.getByText("1 / 20")).toBeVisible();
});

test("admin requires sign-in and is not indexable; no secrets or private IDs in HTML", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /admin");
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/service_role|sb_secret_|259810239363|9810239363/);
});
