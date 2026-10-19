import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductVisual } from "@/components/ProductVisual";
import { getCategories } from "@/lib/content";
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
  const all = await getCategories();
  const cat = all.find((c) => c.slug === slug);
  if (!cat) notFound();

  return (
    <div id="page">
      <Header />
      <main className="mx-auto max-w-[1500px] px-5 pb-24 pt-32 md:px-10">
        <nav aria-label="Breadcrumb" className="label"><Link href="/products" className="hover:text-cyan">Products</Link> / {cat.title}</nav>
        <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-none">{cat.title}</h1>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden border border-line bg-panel">
            <ProductVisual cat={cat} sizes="(min-width:1024px) 55vw, 100vw" priority />
          </div>
          <div>
            <p className="text-xl">{cat.summary}</p>
            <h2 className="label mt-10">Range</h2>
            <ul className="mt-3 flex flex-wrap gap-2">{cat.family.map((f) => <li key={f} className="label border border-line px-2 py-1">{f}</li>)}</ul>
            <h2 className="label mt-8">What it is used for</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-mute">{cat.usedFor.map((u) => <li key={u}>{u}</li>)}</ul>
            <h2 className="label mt-8">Examples listed on setmiindia.com</h2>
            <ul className="mt-3 space-y-1 text-mute">{cat.examples.map((e) => <li key={e}>{e}</li>)}</ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/?category=${cat.slug}#enquiry`} className="btn btn-primary">Enquire about {cat.title}</Link>
              <Link href={`/?category=${cat.slug}&kind=quote#enquiry`} className="btn">Request a quotation</Link>
              <a href={cat.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn">Full range, specs and prices <ArrowUpRight size={15} aria-hidden /></a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
