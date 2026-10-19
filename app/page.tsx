import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Opening } from "@/components/Opening";
import { Supply } from "@/components/Supply";
import { Reveal } from "@/components/Reveal";
import { SignalDiagram } from "@/components/SignalDiagram";
import { EnquiryForm } from "@/components/EnquiryForm";
import { getCategories, getFaqs, getIntro } from "@/lib/content";
import { site, mainSite } from "@/content/site";
import { steps, uses, who, why } from "@/content/story";

export const revalidate = 300;

const Section = ({ id, label, title, children }: { id: string; label: string; title: string; children: React.ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-t`} className="border-t border-line px-5 py-24 md:px-10 md:py-36">
    <div className="mx-auto max-w-[1500px]">
      <Reveal>
        <p className="label">{label}</p>
        <h2 id={`${id}-t`} className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[1.02]">{title}</h2>
      </Reveal>
      <div className="mt-14">{children}</div>
    </div>
  </section>
);

export default async function Home() {
  const [categories, faqs, intro] = await Promise.all([getCategories(), getFaqs(), getIntro()]);
  const slides = categories.filter((c) => c.image).slice(0, 5).map((c) => ({ src: c.image!, position: c.focus ?? "50% 50%" }));

  return (
    <div id="page">
      <Header />
      <main>
        <Opening vtt={intro.vtt} duration={intro.duration} videoUrl={intro.videoUrl} posterUrl={intro.posterUrl} slides={slides} />

        <Section id="who" label="01 · Who we are" title={who.heading}>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            <Reveal><p className="max-w-2xl text-xl leading-relaxed text-mute">{who.body}</p></Reveal>
            <dl className="grid grid-cols-3 gap-4 border-t border-line pt-6 lg:border-t-0 lg:pt-0">
              {who.facts.map((f) => (
                <div key={f.k}>
                  <dt className="font-display text-5xl text-cyan md:text-6xl">{f.k}</dt>
                  <dd className="label mt-2">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="supply" label="02 · What we supply" title="Eight families of connection.">
          <Supply categories={categories} />
        </Section>

        <Section id="uses" label="03 · Where it is used" title={uses.heading}>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="max-w-xl text-lg text-mute">{uses.body}</p>
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {uses.items.map((u) => (
                  <li key={u.title} className="py-5">
                    <h3 className="font-display text-2xl">{u.title}</h3>
                    <p className="mt-1 text-mute">{u.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <SignalDiagram />
          </div>
        </Section>

        <Section id="process" label="04 · How we work" title="From your requirement to your order.">
          <ol className="grid gap-px bg-line md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="bg-ink p-6 md:min-h-64">
                <span className="font-display text-5xl text-cyan">{i + 1}</span>
                <h3 className="mt-6 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-mute">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="why" label="05 · Why SETMI INDIA" title={why.heading}>
          <ul className="grid gap-10 md:grid-cols-3">
            {why.points.map((p) => (
              <li key={p.title} className="border-t border-cyan pt-5">
                <h3 className="font-display text-3xl">{p.title}</h3>
                <p className="mt-2 text-mute">{p.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="faq" label="06 · Customer questions" title="Questions, answered.">
          <div className="max-w-3xl divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.id} className="group py-1">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-lg">
                  {f.question}
                  <Plus className="plus shrink-0 text-cyan transition-transform" size={20} aria-hidden />
                </summary>
                <p className="max-w-2xl pb-6 text-mute">{f.answer}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="enquiry" label="07 · Find your connection" title="Let's find the right connection for your requirement.">
          <Suspense>
            <EnquiryForm options={categories.map((c) => ({ slug: c.slug, title: c.title }))} />
          </Suspense>
          <div className="mt-16 flex flex-wrap gap-3 border-t border-line pt-10">
            <Link href="/products" className="btn btn-primary">Explore products</Link>
            {site.catalogueUrl ? (
              <a href={site.catalogueUrl} className="btn">View catalogue</a>
            ) : (
              <Link href="/products" className="btn">View catalogue</Link>
            )}
            <Link href="/?kind=quote#enquiry" className="btn">Request a quotation</Link>
            <a href={`tel:${site.phones[0].replace(/\s/g, "")}`} className="btn">Talk to our team</a>
            <a href={mainSite} target="_blank" rel="noopener noreferrer" className="btn">Visit setmiindia.com</a>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
