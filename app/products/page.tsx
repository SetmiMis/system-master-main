import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductVisual } from "@/components/ProductVisual";
import { getCategories } from "@/lib/content";

export const revalidate = 300;
export const metadata: Metadata = { title: "Products", description: "Connectors, couplers, splitters, cables and accessories from SETMI INDIA.", alternates: { canonical: "/products" } };

export default async function Products() {
  const categories = await getCategories();
  return (
    <div id="page">
      <Header />
      <main className="mx-auto max-w-[1500px] px-5 pb-24 pt-32 md:px-10">
        <p className="label">Catalogue</p>
        <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-none">Products</h1>
        <ul className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug} className="bg-ink">
              <Link href={`/products/${c.slug}`} className="group block p-4">
                <div className="relative aspect-[4/3] overflow-hidden bg-panel">
                  <ProductVisual cat={c} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" />
                </div>
                <h2 className="mt-4 font-display text-3xl group-hover:text-cyan">{c.title}</h2>
                <p className="mt-1 text-sm text-mute">{c.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
