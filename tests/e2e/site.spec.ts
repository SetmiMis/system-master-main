import { expect, test } from "@playwright/test";

test("landing page renders with content visible and no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Every connection enables something greater");
  await expect(page.getByRole("heading", { name: /Since 1983/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("intro: start, captions toggle, sound is honestly disabled, skip lands on content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start experience" }).click();
  const dialog = page.getByRole("dialog", { name: /introduction/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Every connection enables something greater.")).toBeVisible();
  await dialog.getByRole("button", { name: /Captions on/ }).click();
  await expect(dialog.getByRole("button", { name: /Captions off/ })).toBeVisible();
  await expect(dialog.getByRole("button", { name: /Sound unavailable/ })).toBeDisabled();
  await dialog.getByRole("button", { name: "Skip intro" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("#who")).toBeInViewport();
});

test("intro closes with Escape and restores focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start experience" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "Start experience" })).toBeFocused();
});

test("explore without intro goes straight to content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore without intro" }).click();
  await expect(page).toHaveURL(/#who$/);
});

test("reduced motion: content is visible without animation", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/");
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await expect(page.getByText("What is SETMI INDIA?")).toBeVisible();
  await ctx.close();
});

test("product pages resolve and link to setmiindia.com", async ({ page, request }) => {
  await page.goto("/products");
  await page.getByRole("link", { name: /Couplers/ }).first().click();
  await expect(page).toHaveURL(/\/products\/couplers$/);
  const href = await page.getByRole("link", { name: /Full range/ }).getAttribute("href");
  expect(href).toBe("https://setmiindia.com/product-category/connectors/couplers/");
  expect((await request.get("/products/does-not-exist")).status()).toBe(404);
});

test("FAQ opens", async ({ page }) => {
  await page.goto("/#faq");
  const q = page.getByText("How can I request a quotation?");
  await q.click();
  await expect(page.getByText("tell us the items and quantities")).toBeVisible();
});

test("enquiry validates input server-side and rejects honeypot", async ({ request }) => {
  const bad = await request.post("/api/enquiry", { data: { category: "x", name: "A", contact: "1", message: "" } });
  expect(bad.status()).toBe(400);
  const bot = await request.post("/api/enquiry", { data: { category: "x", name: "Bot", contact: "bot@x.com", message: "spam spam", website: "http://x" } });
  expect(bot.status()).toBe(400);
});

test("admin requires sign-in and is not indexable", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
});

test("no secrets in the browser bundle", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/service_role|sb_secret_/);
});
