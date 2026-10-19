import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

/** Cookie-backed Supabase client acting as the signed-in user. RLS still applies to every query. */
export async function userClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* called from a Server Component: ignore */ }
      },
    },
  });
}

/** Server-side gate for every admin page and action: signed in AND listed in admin_users. */
export async function requireAdmin() {
  const db = await userClient();
  if (!db) redirect("/admin/login?e=config");
  const { data } = await db.auth.getUser(); // validates the JWT with Supabase, not just the cookie
  if (!data.user) redirect("/admin/login");
  const { data: ok } = await db.rpc("is_admin");
  if (ok !== true) redirect("/admin/login?e=forbidden");
  return db;
}
