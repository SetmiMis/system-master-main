import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ProductVisual } from "@/components/ProductVisual";
import { getCategories } from "@/lib/content";
import { getCategoryProducts } from "@/lib/live";
import { categories as local } from "@/content/categories";

export const revalidate = 300;
type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => local.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return cat ? { title: cat.title, description: cat.summary, alternates: { canonical: `/products/${slug}` } } : {};
}

export default async function Category({ params }: Params) {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();
  const products = await getCategoryProducts(cat.sourceUrl);

  return (
    <PageShell label="Products" title={cat.title} lede={cat.summary}>
      <nav aria-label="Breadcrumb" className="-mt-6 mb-8 text-sm text-ink-dim"><Link href="/products" className="hover:text-accent">All products</Link> / {cat.title}</nav>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-panel-line bg-white shadow-[0_24px_60px_-28px_rgba(1,53,86,0.5)]">
          <ProductVisual cat={cat} sizes="(min-width:1024px) 55vw, 100vw" priority />
        </div>
        <div className="space-y-7">
          <section>
            <h2 className="eyebrow">Range</h2>
            <ul className="mt-3 flex flex-wrap gap-2">{cat.family.map((f) => <li key={f} className="rounded-full bg-bg-elevated px-3 py-1 font-mono text-[0.75rem] text-ink-dim">{f}</li>)}</ul>
          </section>
          <section>
            <h2 className="eyebrow">What it is used for</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-dim">{cat.usedFor.map((u) => <li key={u}>{u}</li>)}</ul>
          </section>
          <section>
            <h2 className="eyebrow">Examples listed on setmiindia.com</h2>
            <ul className="mt-3 space-y-1 text-ink-dim">{cat.examples.map((e) => <li key={e}>{e}</li>)}</ul>
          </section>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={`/enquiry?category=${cat.slug}`} className="btn btn-primary">Enquire about {cat.title}</Link>
            <Link href={`/enquiry?category=${cat.slug}&kind=quote`} className="btn">Request a quotation</Link>
            <a href={cat.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn">Full range, specs and prices <ArrowUpRight size={15} aria-hidden /></a>
          </div>
        </div>
      </div>
      {products.length > 0 && (
        <section className="mt-16" aria-labelledby="live-products">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Live from setmiindia.com</p>
              <h2 id="live-products" className="mt-2 text-2xl font-extrabold">{products.length} products in {cat.title}</h2>
            </div>
            <a href={cat.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn">See the full range <ArrowUpRight size={15} aria-hidden /></a>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col overflow-hidden rounded-xl border border-panel-line bg-bg transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_34px_-20px_rgba(1,53,86,0.55)]">
                  <div className="relative aspect-square bg-white"><Image src={p.image} alt={p.title} fill sizes="(min-width:1024px) 18vw, (min-width:640px) 30vw, 45vw" className="object-contain transition-transform duration-500 group-hover:scale-105" /></div>
                  <div className="flex flex-1 flex-col border-t border-panel-line p-3">
                    <p className="line-clamp-2 flex-1 text-[0.8rem] font-semibold leading-snug">{p.title}</p>
                    <p className="mt-1 font-extrabold text-accent-strong">{p.price}</p>
                    {p.moq && <p className="text-[0.68rem] text-ink-dim">Min. order {p.moq} pcs</p>}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
