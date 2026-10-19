import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { companyStats } from "@/content/trust";
import { getMetrics, getReviews } from "@/lib/live";

export const revalidate = 300;
export const metadata: Metadata = { title: "SETMI INDIA in numbers", description: "Who we serve, what they ask for, and how we deliver.", alternates: { canonical: "/dashboard" } };

const card = "rounded-2xl border border-panel-line bg-bg-elevated p-5 shadow-[inset_0_2px_0_0_rgba(76,195,217,0.4)]";

export default async function Dashboard() {
  const [m, reviews] = await Promise.all([getMetrics(), getReviews()]);
  const kpis = m
    ? [
        { label: "Customers served", value: m.customers.toLocaleString("en-IN") },
        { label: "Enquiries this month", value: m.enquiriesThisMonth.toLocaleString("en-IN") },
        { label: "Total enquiries", value: m.enquiriesTotal.toLocaleString("en-IN") },
        { label: `Google rating · ${reviews.count} reviews`, value: `${reviews.rating}★` },
      ]
    : [...companyStats.map((s) => ({ label: s.label, value: `${s.value.toLocaleString("en-IN")}${s.suffix}` }))];
  const max = m ? Math.max(...m.months.data, 1) : 1;
  const demandMax = m ? Math.max(...m.demand.map((x) => x.count), 1) : 1;

  return (
    <PageShell label={m ? `Live · as of ${m.asOf}` : "Company figures"} title="SETMI INDIA in numbers." lede="Who we serve, what they ask for, and how we deliver.">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className={card}>
            <p className="text-[0.82rem] text-ink-dim">{k.label}</p>
            <p className="mt-1.5 font-mono text-3xl font-semibold tabular-nums">{k.value}</p>
          </li>
        ))}
      </ul>

      {!m && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-panel-line p-5">
          <p className="max-w-2xl text-[0.92rem] text-ink-dim">
            <span className="mb-1 flex items-center gap-2 font-semibold text-ink"><Star size={15} className="fill-cat-4 text-cat-4" aria-hidden /> Rated {reviews.rating} on Google by {reviews.count} customers</span>
            Live enquiry trends and demand appear here once the enquiry system feed is connected. We do not show sample numbers.
          </p>
          <Link href="/enquiry" className="btn btn-primary">Get a quote</Link>
        </div>
      )}

      {m && (
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <section className={`${card} lg:col-span-8`} aria-label="Enquiries per month">
            <h2 className="font-bold">Enquiry volume</h2>
            <p className="text-[0.82rem] text-ink-dim">Enquiries received per month</p>
            <ol className="mt-5 flex h-48 items-end gap-3">
              {m.months.data.map((v, i) => (
                <li key={m.months.categories[i]} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-[0.72rem] tabular-nums">{v}</span>
                  <span className="w-full rounded-t-md bg-gradient-to-t from-accent-strong to-accent-soft" style={{ height: `${(v / max) * 100}%` }} />
                  <span className="text-[0.68rem] text-ink-dim">{m.months.categories[i]}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className={`${card} lg:col-span-4`} aria-label="What customers ask for">
            <h2 className="font-bold">What customers ask for</h2>
            <ul className="mt-4 space-y-3">
              {m.demand.map((x) => (
                <li key={x.name} className="text-[0.85rem]">
                  <div className="flex justify-between"><span>{x.name}</span><span className="font-mono tabular-nums">{x.count}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-panel-line"><div className="h-full rounded-full bg-accent" style={{ width: `${(x.count / demandMax) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>
          <section className={`${card} lg:col-span-12`} aria-label="Enquiries by state">
            <h2 className="font-bold">Where enquiries come from</h2>
            <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
              {m.states.slice(0, 10).map((s) => (
                <li key={s.state} className="flex justify-between border-b border-panel-line py-1.5 text-[0.85rem]"><span>{s.state}</span><span className="font-mono tabular-nums">{s.count}</span></li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </PageShell>
  );
}
