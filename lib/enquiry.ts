import { z } from "zod";

export const enquirySchema = z.object({
  kind: z.enum(["enquiry", "quote"]).default("enquiry"),
  category: z.string().trim().max(60),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  contact: z.string().trim().min(5, "Enter a phone number or email").max(120),
  message: z.string().trim().min(5, "Please describe your requirement").max(2000),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

// ponytail: per-instance memory limiter. Move to a shared store (e.g. Upstash) if abuse appears.
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}
