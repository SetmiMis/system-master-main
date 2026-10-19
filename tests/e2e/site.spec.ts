import { expect, test } from "@playwright/test";

const scene = (page: import("@playwright/test").Page) => page.locator('[aria-roledescription="scene"]').last();

test("home film opens on the first scene, fits the screen and does not scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Every connection enables");
  const { overflowX, overflowY } = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - innerWidth,
    overflowY: document.documentElement.scrollHeight - innerHeight,
  }));
  expect(overflowX).toBeLessThanOrEqual(0);
  expect(overflowY).toBeLessThanOrEqual(0);
});

test("film auto-advances, and pause stops it", async ({ page }) => {
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are", { timeout: 12_000 });
  await page.getByRole("button", { name: "Pause" }).click();
  await page.waitForTimeout(10_000);
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are");
});

test("next, previous, keyboard and timeline jump between scenes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Next scene" }).click();
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are");
  await page.keyboard.press("ArrowRight");
  await expect(scene(page)).toHaveAttribute("aria-label", "What we supply");
  await page.getByRole("button", { name: "Previous scene" }).click();
  await expect(scene(page)).toHaveAttribute("aria-label", "Who we are");
  await page.getByRole("button", { name: /Scene 6: How an order moves/ }).click();
  await expect(scene(page)).toHaveAttribute("aria-label", "How an order moves");
  await expect(page.getByText("Sales FMS").first()).toBeVisible();
});

test("captions follow the film and can be turned off; sound can be switched on", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Every connection enables something greater.").last()).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "Captions on" }).click();
  await expect(page.getByRole("button", { name: "Captions off" })).toBeVisible();
  await page.getByRole("button", { name: "Sound off" }).click();
  await expect(page.getByRole("button", { name: "Sound on" })).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion: the film starts paused", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/");
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  await page.waitForTimeout(9_000);
  await expect(scene(page)).toHaveAttribute("aria-label", "Welcome");
  await ctx.close();
});

test("3D connector scene loads without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: /Scene 5: Inside a connector/ }).click();
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Next scene" }).click();
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test("product pages resolve and link to setmiindia.com", async ({ page, request }) => {
  await page.goto("/products");
  await page.getByRole("link", { name: /Couplers/ }).first().click();
  await expect(page).toHaveURL(/\/products\/couplers$/);
  const href = await page.getByRole("link", { name: /Full range/ }).getAttribute("href");
  expect(href).toBe("https://setmiindia.com/product-category/connectors/couplers/");
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
  const bad = await request.post("/api/enquiry", { data: { category: "x", name: "A", contact: "1", message: "" } });
  expect(bad.status()).toBe(400);
  const bot = await request.post("/api/enquiry", { data: { category: "x", name: "Bot", contact: "bot@x.com", message: "spam spam", website: "http://x" } });
  expect(bot.status()).toBe(400);
});

test("expo gallery opens the lightbox", async ({ page }) => {
  await page.goto("/expo");
  await page.getByRole("button", { name: "Open expo photo 1 of 20" }).click();
  await expect(page.getByRole("dialog", { name: "Expo photo viewer" })).toBeVisible();
  await expect(page.getByText("1 / 20")).toBeVisible();
});

test("admin requires sign-in and is not indexable; no secrets in HTML", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /admin");
  expect(await (await request.get("/")).text()).not.toMatch(/service_role|sb_secret_/);
});

test("trust scenes show the published figures, certificate and marketplaces", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: /Scene 8: Verified quality/ }).click();
  await expect(page.getByText("IN/66820947/4632")).toBeVisible();
  await expect(page.getByRole("link", { name: /Find us on GeM/ })).toHaveAttribute("href", "https://gem.gov.in");
  await page.getByRole("button", { name: /Scene 9: What customers say/ }).click();
  await expect(page.getByText(/Rated 4.9 on Google by 301 customers/).first()).toBeVisible();
});

test("systems scene and page link to the live systems; dashboard shows no sample numbers", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: /Scene 7: Our systems/ }).click();
  await expect(page.getByRole("link", { name: /Sales FMS/ })).toHaveAttribute("href", "https://sales-fms.vercel.app");
  await page.goto("/systems");
  await expect(page.getByRole("link", { name: /Purchase FMS/ })).toHaveAttribute("href", "https://setmi-purchase-fms.vercel.app");
  await page.goto("/dashboard");
  await expect(page.getByText("We do not show sample numbers.")).toBeVisible();
});
