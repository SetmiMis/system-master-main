"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ProductVisual } from "@/components/ProductVisual";
import type { Category } from "@/types/content";

export function Supply({ categories }: { categories: Category[] }) {
  const [i, setI] = useState(0);
  const cat = categories[i];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-16">
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:overflow-visible lg:pb-0" aria-label="Product categories">
        {categories.map((c, n) => (
          <li key={c.slug} className="shrink-0 lg:border-b lg:border-line">
            <button
              onClick={() => setI(n)}
              onMouseEnter={() => setI(n)}
              aria-pressed={n === i}
              className={`flex w-full items-baseline gap-4 border border-line px-4 py-3 text-left transition-colors lg:border-0 lg:py-5 ${n === i ? "text-cyan" : "text-mute hover:text-paper"}`}
            >
              <span className="label hidden lg:inline">{String(n + 1).padStart(2, "0")}</span>
              <span className="font-display text-2xl whitespace-nowrap lg:text-4xl">{c.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <div className="relative aspect-[16/10] overflow-hidden border border-line bg-panel">
          <AnimatePresence mode="wait">
            <motion.div key={cat.slug} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <ProductVisual cat={cat} sizes="(min-width:1024px) 55vw, 100vw" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div aria-live="polite" className="mt-6">
          <p className="max-w-xl text-lg">{cat.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {cat.family.slice(0, 8).map((f) => (
              <li key={f} className="label border border-line px-2 py-1">{f}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/products/${cat.slug}`} className="btn btn-primary">Explore {cat.title}</Link>
            <Link href={`/?category=${cat.slug}#enquiry`} className="btn">Enquire</Link>
            <a href={cat.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn">
              On setmiindia.com <ArrowUpRight size={15} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
