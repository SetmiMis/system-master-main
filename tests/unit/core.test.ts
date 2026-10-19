import { describe, expect, it } from "vitest";
import { activeCue, parseVtt } from "@/lib/vtt";
import { enquirySchema, rateLimited } from "@/lib/enquiry";
import { buildVtt, filmScenes, sceneOffsets } from "@/content/film";
import { categories } from "@/content/categories";

describe("vtt", () => {
  const cues = parseVtt(buildVtt());
  it("builds one caption track for the whole film", () => {
    expect(cues).toHaveLength(filmScenes.reduce((n, s) => n + s.captions.length, 0));
    expect(cues[0]).toMatchObject({ start: 0.5, end: 4.5, text: "Every connection enables something greater." });
    expect(cues.at(-1)?.start).toBe(sceneOffsets.at(-1));
  });
  it("finds the active cue by time", () => {
    expect(activeCue(cues, 5)?.text).toBe("Welcome to SETMI INDIA.");
    expect(activeCue(cues, 0.1)).toBeNull();
  });
  it("handles hh:mm:ss and empty input", () => {
    expect(parseVtt("WEBVTT\n\n00:01:00.000 --> 00:01:02.500\nHi")[0]).toMatchObject({ start: 60, end: 62.5 });
    expect(parseVtt(null)).toEqual([]);
  });
});

describe("enquiry validation", () => {
  const ok = { category: "Cables", name: "Asha", contact: "asha@example.com", message: "Need 100 HDMI cables" };
  it("accepts a valid enquiry", () => expect(enquirySchema.safeParse(ok).success).toBe(true));
  it("rejects a filled honeypot", () => expect(enquirySchema.safeParse({ ...ok, website: "spam" }).success).toBe(false));
  it("rejects short or missing fields", () => expect(enquirySchema.safeParse({ ...ok, name: "A", message: "" }).success).toBe(false));
  it("rate limits after 5 hits in the window", () => {
    const r = Array.from({ length: 6 }, () => rateLimited("test-ip", 5, 60_000, 1000));
    expect(r).toEqual([false, false, false, false, false, true]);
  });
});

describe("content", () => {
  it("has unique slugs and a source URL on setmiindia.com for each category", () => {
    expect(new Set(categories.map((c) => c.slug)).size).toBe(categories.length);
    for (const c of categories) expect(c.sourceUrl.startsWith("https://setmiindia.com/")).toBe(true);
  });
});

describe("store listing parser", () => {
  it("reads title, link, image and current price from a real setmiindia.com category page", async () => {
    const { parseListing } = await import("@/lib/live");
    const { readFileSync } = await import("node:fs");
    const ps = parseListing(readFileSync("tests/unit/fixture-listing.html", "utf8"));
    expect(ps.length).toBeGreaterThan(5);
    expect(ps[0]).toMatchObject({ title: "C TO HDMI CONVERTER", url: "https://setmiindia.com/product/c-to-hdmi-converter/", price: "₹270" });
    expect(ps[0].image).toMatch(/^https:\/\/setmiindia\.com\/wp-content\/uploads\//);
  });
});
