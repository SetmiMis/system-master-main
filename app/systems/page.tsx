import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LottieIcon } from "@/components/LottieIcon";
import { getSystems } from "@/lib/content";
import { steps } from "@/content/story";

export const revalidate = 300;
export const metadata: Metadata = { title: "Our systems", description: "The systems behind every SETMI INDIA order: sales, purchase, people and reporting.", alternates: { canonical: "/systems" } };

const host = (u: string) => new URL(u).host;

export default async function Systems() {
  const systems = await getSystems();
  const groups = [...new Set(systems.map((s) => s.group))];
  return (
    <>
      <Header />
      <section className="theme-dark relative overflow-hidden">
        <div className="grid-field" />
        <div className="hero-glow" />
        <div className="relative mx-auto max-w-[1180px] px-6 py-16 sm:py-20">
          <p className="eyebrow">How we work</p>
          <h1 className="mt-4 max-w-[18ch] text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1.04]">Every order runs on a system.</h1>
          <p className="mt-5 max-w-[56ch] text-[1.05rem] text-ink-dim">Each part of SETMI INDIA has its own system, so nothing depends on memory or a spreadsheet. Open any card to see it working.</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {[`${systems.length} live systems`, `${groups.length} areas of the business`, "One record per order"].map((x) => (
              <span key={x} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[0.72rem] uppercase tracking-wider text-ink-dim">{x}</span>
            ))}
          </div>
        </div>
      </section>

      <main className="relative">
        <div className="grid-field" />
        <div className="relative mx-auto max-w-[1180px] px-6 py-14">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {systems.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col rounded-2xl border border-panel-line bg-bg p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_18px_34px_-20px_rgba(1,53,86,0.55)]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-xl bg-white shadow-[0_8px_20px_-12px_rgba(1,53,86,0.5)]"><LottieIcon name={s.icon} className="h-12 w-12" /></span>
                    <span className="rounded-full bg-bg-elevated px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-ink-dim">{s.group}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold">{s.name}</h2>
                  <p className="mt-1 flex-1 text-[0.92rem] text-ink-dim">{s.description}</p>
                  <p className="mt-5 flex items-center justify-between gap-3 border-t border-panel-line pt-3 text-[0.8rem]">
                    <span className="truncate font-mono text-ink-dim">{host(s.url)}</span>
                    <span className="inline-flex flex-none items-center gap-1 font-semibold text-accent group-hover:translate-x-0.5">Open <ArrowUpRight size={14} aria-hidden /></span>
                  </p>
                </a>
              </li>
            ))}
          </ul>

          <section className="mt-20" aria-labelledby="panels">
            <p className="eyebrow">How an order moves</p>
            <h2 id="panels" className="mt-3 text-[clamp(1.6rem,3.4vw,2.4rem)] font-extrabold">Seven panels, from enquiry to delivery.</h2>
            <ol className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {steps.map((s) => (
                <li key={s.panel} className="rounded-xl border border-panel-line bg-bg-elevated p-4">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-mono text-xs text-white">{s.panel}</span>
                  <p className="mt-3 font-bold">{s.title}</p>
                  <p className="mt-1 text-[0.82rem] text-ink-dim">{s.body}</p>
                  <p className="mt-3 font-mono text-[0.64rem] uppercase tracking-wider text-accent-strong">{s.system}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="header-gradient mt-16 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-7 text-white sm:px-10">
            <div>
              <h2 className="text-xl font-extrabold">Want to see it on your order?</h2>
              <p className="mt-1 text-white/80">Send an enquiry and we will walk you through how it moves.</p>
            </div>
            <Link href="/enquiry" className="btn !border-white !bg-white !text-[#013556]">Send an enquiry <ArrowRight size={15} aria-hidden /></Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
