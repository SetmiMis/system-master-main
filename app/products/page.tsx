import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ProductVisual } from "@/components/ProductVisual";
import { getCategories } from "@/lib/content";

export const revalidate = 300;
export const metadata: Metadata = { title: "Products", description: "Connectors, couplers, splitters, cables and accessories from SETMI INDIA.", alternates: { canonical: "/products" } };

export default async function Products() {
  const categories = await getCategories();
  return (
    <PageShell label="What we make and move" title="Eight families of connection.">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/products/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-panel-line bg-bg transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_18px_34px_-20px_rgba(1,53,86,0.55)]">
              <div className="relative aspect-[4/3] bg-white"><ProductVisual cat={c} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" /></div>
              <div className="flex flex-1 flex-col border-t border-panel-line p-4">
                <h2 className="text-[1.05rem] font-bold">{c.title}</h2>
                <p className="mt-1 flex-1 text-[0.88rem] text-ink-dim">{c.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[0.88rem] font-semibold text-accent">View range <ArrowRight size={14} aria-hidden /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
