import { anonClient } from "@/lib/supabase";
import { categories as localCategories } from "@/content/categories";
import { faqs as localFaqs } from "@/content/faqs";
import { buildVtt } from "@/content/film";
import { publicSystems } from "@/content/trust";
import type { Category, Faq } from "@/types/content";

// Published rows from Supabase win; local files in /content are the fallback when the
// database is not configured, unreachable or empty. RLS only exposes status = 'published'.

export async function getCategories(): Promise<Category[]> {
  const db = anonClient();
  if (!db) return localCategories;
  const { data, error } = await db.from("categories").select("*").eq("status", "published").order("sort");
  if (error || !data?.length) return localCategories;
  return data.map((r) => ({
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    family: r.family ?? [],
    usedFor: r.used_for ?? [],
    examples: r.examples ?? [],
    sourceUrl: r.source_url,
    image: r.image_url,
    focus: r.focus ?? undefined,
    status: "published",
  }));
}

export async function getFaqs(): Promise<Faq[]> {
  const db = anonClient();
  if (!db) return localFaqs;
  const { data, error } = await db.from("faqs").select("*").eq("status", "published").order("sort");
  if (error || !data?.length) return localFaqs;
  return data.map((r) => ({ id: r.id, question: r.question, answer: r.answer, status: "published" }));
}

export async function getIntro(): Promise<{ vtt: string; videoUrl: string | null; posterUrl: string | null }> {
  // The "intro" scenes row holds the whole film's caption track and optional opening video.
  const base = { vtt: buildVtt("en"), videoUrl: null, posterUrl: null };
  const db = anonClient();
  if (!db) return base;
  const { data } = await db.from("scenes").select("vtt,video_url,poster_url").eq("slug", "intro").eq("status", "published").maybeSingle();
  if (!data) return base;
  return { ...base, vtt: data.vtt?.trim() ? data.vtt : base.vtt, videoUrl: data.video_url, posterUrl: data.poster_url };
}

export type SystemCard = { name: string; description: string; url: string; group: string; icon: string };

/** Company systems for /systems and the film. Managed in /admin; falls back to content/trust.ts. */
export async function getSystems(): Promise<SystemCard[]> {
  const db = anonClient();
  if (!db) return publicSystems;
  const { data, error } = await db.from("systems").select("name,description,url,grp,icon").eq("status", "published").order("sort");
  if (error || !data?.length) return publicSystems;
  return data.map((r) => ({ name: r.name, description: r.description, url: r.url, group: r.grp, icon: r.icon }));
}
