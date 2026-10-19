import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { EnquiryForm } from "@/components/EnquiryForm";
import { getCategories } from "@/lib/content";

export const revalidate = 300;
export const metadata: Metadata = { title: "Enquiry and quotation", description: "Send SETMI INDIA your requirement or request a quotation.", alternates: { canonical: "/enquiry" } };

export default async function Enquiry() {
  const cats = await getCategories();
  return (
    <PageShell label="Find your connection" title="Let's find the right connection for your requirement." lede="Tell us what you are connecting. No account needed.">
      <Suspense>
        <EnquiryForm options={cats.map((c) => ({ slug: c.slug, title: c.title }))} />
      </Suspense>
    </PageShell>
  );
}
