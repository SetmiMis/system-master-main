import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

/** Anonymous, read/insert-only client. RLS decides what it can see. Null when not configured. */
export function anonClient(): SupabaseClient | null {
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}
