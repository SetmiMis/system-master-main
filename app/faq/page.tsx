import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { getFaqs } from "@/lib/content";

export const revalidate = 300;
export const metadata: Metadata = { title: "Questions & answers", description: "Answers about SETMI INDIA products, catalogue, quotations and contact.", alternates: { canonical: "/faq" } };

export default async function Faq() {
  const faqs = await getFaqs();
  return (
    <PageShell label="Customer questions" title="Questions, answered.">
      <div className="max-w-3xl divide-y divide-panel-line rounded-2xl border border-panel-line bg-bg px-6">
        {faqs.map((f) => (
          <details key={f.id}>
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-[1.05rem] font-semibold">
              {f.question}
              <Plus className="plus shrink-0 text-accent transition-transform" size={20} aria-hidden />
            </summary>
            <p className="max-w-2xl pb-6 text-ink-dim">{f.answer}</p>
          </details>
        ))}
      </div>
      <Link href="/enquiry" className="btn btn-primary mt-10">Ask us something else</Link>
    </PageShell>
  );
}
