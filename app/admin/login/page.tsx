import type { Metadata } from "next";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

const messages: Record<string, string> = {
  bad: "Email or password is incorrect.",
  forbidden: "This account is not an administrator.",
  config: "Supabase is not configured on this server.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5">
      <form action={signIn} className="w-full space-y-5">
        <h1 className="font-display text-4xl">Admin</h1>
        {e && <p role="alert" className="text-[#ff8a80]">{messages[e] ?? "Sign in failed."}</p>}
        <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="mt-2 w-full border border-line bg-transparent px-4 py-3" /></div>
        <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="mt-2 w-full border border-line bg-transparent px-4 py-3" /></div>
        <button className="btn btn-primary">Sign in</button>
      </form>
    </main>
  );
}
