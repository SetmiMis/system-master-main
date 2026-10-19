import { NextResponse } from "next/server";
import { anonClient } from "@/lib/supabase";
import { enquirySchema, rateLimited } from "@/lib/enquiry";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  const parsed = enquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { website: _honeypot, ...row } = parsed.data;

  const db = anonClient();
  if (!db) return NextResponse.json({ error: "Enquiries are not available right now. Please use WhatsApp, phone or email." }, { status: 503 });

  const { error } = await db.from("enquiries").insert(row);
  if (error) return NextResponse.json({ error: "Could not send your enquiry. Please use WhatsApp, phone or email." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
