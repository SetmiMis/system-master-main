import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LottieIcon } from "@/components/LottieIcon";
import { publicSystems } from "@/content/trust";
import { steps } from "@/content/story";

export const metadata: Metadata = { title: "Our systems", description: "The systems behind every SETMI INDIA order: sales, purchase, people and reporting.", alternates: { canonical: "/systems" } };

const host = (u: string) => new URL(u).host;

export default function Systems() {
  const groups = [...new Set(publicSystems.map((s) => s.group))];
  return (
    <PageShell label="How we work" title="Every order runs on a system." lede="Each part of SETMI INDIA has its own system, so nothing depends on memory or a spreadsheet. Open any card to see it working.">
      <div className="mb-10 flex flex-wrap gap-2">
        {[`${publicSystems.length} live systems`, `${groups.length} areas of the business`, "One record per order"].map((x) => (
          <span key={x} className="rounded-full border border-panel-line bg-bg-elevated px-3.5 py-1.5 font-mono text-[0.72rem] uppercase tracking-wider text-ink-dim">{x}</span>
        ))}
      </div>
      {groups.map((g) => (
        <section key={g} className="mb-10">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="text-xl font-extrabold">{g}</h2>
            <span className="h-px flex-1 bg-panel-line" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicSystems.filter((s) => s.group === g).map((s) => (
              <li key={s.name}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col rounded-2xl border border-panel-line bg-bg p-5 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_18px_34px_-20px_rgba(1,53,86,0.55)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-white shadow-[0_8px_20px_-12px_rgba(1,53,86,0.5)]"><LottieIcon name={s.icon} className="h-10 w-10" /></span>
                    <h3 className="text-[1.05rem] font-bold">{s.name}</h3>
                  </div>
                  <p className="mt-3 flex-1 text-[0.9rem] text-ink-dim">{s.description}</p>
                  <p className="mt-4 flex items-center justify-between gap-3 text-[0.8rem]">
                    <span className="truncate font-mono text-ink-dim">{host(s.url)}</span>
                    <span className="inline-flex flex-none items-center gap-1 font-semibold text-accent">Open <ArrowUpRight size={14} aria-hidden /></span>
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="mt-14">
        <h2 className="text-xl font-extrabold">The seven panels of an order</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.panel} className="rounded-xl border border-panel-line bg-bg-elevated p-4">
              <p className="font-mono text-sm text-accent">{s.panel}</p>
              <p className="mt-1 font-bold">{s.title}</p>
              <p className="mt-1 text-[0.85rem] text-ink-dim">{s.body}</p>
              <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-wider text-ink-dim">{s.system}</p>
            </li>
          ))}
        </ol>
      </section>
      <div className="header-gradient mt-14 rounded-2xl px-6 py-7 text-white sm:px-10">
        <h2 className="text-xl font-extrabold">Want to see it on your order?</h2>
        <p className="mt-1 text-white/80">Send an enquiry and we will walk you through how it moves.</p>
        <Link href="/enquiry" className="btn mt-4 !border-white !bg-white !text-[#013556]">Send an enquiry</Link>
      </div>
    </PageShell>
  );
}
