"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, userClient } from "@/lib/supabase-server";

const status = z.enum(["draft", "published"]);
const lines = (s: FormDataEntryValue | null) => String(s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
const text = (s: FormDataEntryValue | null) => String(s ?? "").trim();
const refresh = () => { revalidatePath("/"); revalidatePath("/products"); revalidatePath("/products/[slug]", "page"); revalidatePath("/admin"); };
const back = (msg: string) => redirect(`/admin?m=${encodeURIComponent(msg)}`);

export async function signIn(f: FormData) {
  const db = await userClient();
  if (!db) redirect("/admin/login?e=config");
  const { error } = await db.auth.signInWithPassword({ email: text(f.get("email")), password: String(f.get("password") ?? "") });
  if (error) redirect("/admin/login?e=bad");
  redirect("/admin");
}

export async function signOut() {
  await (await userClient())?.auth.signOut();
  redirect("/admin/login");
}

export async function saveFaq(f: FormData) {
  const db = await requireAdmin();
  const p = z.object({ question: z.string().min(3).max(300), answer: z.string().min(3).max(2000), sort: z.coerce.number().int(), status }).safeParse({
    question: text(f.get("question")), answer: text(f.get("answer")), sort: f.get("sort"), status: f.get("status"),
  });
  if (!p.success) back("Invalid FAQ: " + p.error.issues.map((i) => i.path + " " + i.message).join("; "));
  const id = text(f.get("id"));
  const { error } = id ? await db.from("faqs").update(p.data!).eq("id", id) : await db.from("faqs").insert(p.data!);
  refresh();
  back(error ? `Save failed: ${error.message}` : "FAQ saved");
}

export async function deleteFaq(f: FormData) {
  const db = await requireAdmin();
  const { error } = await db.from("faqs").delete().eq("id", text(f.get("id")));
  refresh();
  back(error ? `Delete failed: ${error.message}` : "FAQ deleted");
}

export async function saveCategory(f: FormData) {
  const db = await requireAdmin();
  const p = z.object({
    title: z.string().min(2).max(100), summary: z.string().min(5).max(500),
    family: z.array(z.string()), used_for: z.array(z.string()), examples: z.array(z.string()),
    image_url: z.string().max(500).nullable(), sort: z.coerce.number().int(), status,
  }).safeParse({
    title: text(f.get("title")), summary: text(f.get("summary")), family: lines(f.get("family")), used_for: lines(f.get("used_for")),
    examples: lines(f.get("examples")), image_url: text(f.get("image_url")) || null, sort: f.get("sort"), status: f.get("status"),
  });
  if (!p.success) back("Invalid category: " + p.error.issues.map((i) => i.path + " " + i.message).join("; "));
  const { error } = await db.from("categories").update(p.data!).eq("slug", text(f.get("slug")));
  refresh();
  back(error ? `Save failed: ${error.message}` : "Category saved");
}

export async function saveScene(f: FormData) {
  const db = await requireAdmin();
  const p = z.object({ video_url: z.string().url().nullable(), poster_url: z.string().max(500).nullable(), vtt: z.string().max(20000).nullable(), status }).safeParse({
    video_url: text(f.get("video_url")) || null, poster_url: text(f.get("poster_url")) || null, vtt: String(f.get("vtt") ?? "").trim() || null, status: f.get("status"),
  });
  if (!p.success) back("Invalid scene: " + p.error.issues.map((i) => i.path + " " + i.message).join("; "));
  const { error } = await db.from("scenes").update(p.data!).eq("slug", text(f.get("slug")));
  refresh();
  back(error ? `Save failed: ${error.message}` : "Scene saved");
}
