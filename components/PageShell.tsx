import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function PageShell({ label, title, lede, children }: { label: string; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative min-h-[70svh] overflow-hidden">
        <div className="grid-field" />
        <div className="relative mx-auto max-w-[1180px] px-6 pb-20 pt-12 md:pt-16">
          <p className="eyebrow">{label}</p>
          <h1 className="mt-3 text-[clamp(2rem,4.6vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight">{title}</h1>
          {lede && <p className="mt-4 max-w-2xl text-[1.05rem] text-ink-dim">{lede}</p>}
          <div className="mt-10">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
