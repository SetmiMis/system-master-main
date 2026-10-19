import { describe, expect, it } from "vitest";
import { activeCue, parseVtt } from "@/lib/vtt";
import { enquirySchema, rateLimited } from "@/lib/enquiry";
import { intro } from "@/content/story";
import { categories } from "@/content/categories";

describe("vtt", () => {
  const cues = parseVtt(intro.vtt);
  it("parses the bundled intro captions", () => {
    expect(cues).toHaveLength(3);
    expect(cues[0]).toMatchObject({ start: 0.5, end: 4, text: "Every connection enables something greater." });
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
