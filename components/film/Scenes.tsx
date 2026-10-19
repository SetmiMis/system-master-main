"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Mail, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { ProductVisual } from "@/components/ProductVisual";
import { SignalDiagram } from "@/components/SignalDiagram";
import { OrderExplainer } from "@/components/film/OrderExplainer";
import { site, mainSite } from "@/content/site";
import { uses, who, why } from "@/content/story";
import type { Category } from "@/types/content";
import type { ExpoPhoto } from "@/content/expo";

// three.js is only downloaded when the connector scene is reached.
const ConnectorScene = dynamic(() => import("@/components/film/ConnectorScene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-ink-dim">Loading 3D view…</div>,
});

export interface SceneProps {
  t: number;
  d: number;
  cats: Category[];
  photos: ExpoPhoto[];
  videoUrl: string | null;
  posterUrl: string | null;
  muted: boolean;
  onVideoError: () => void;
  seek: (t: number) => void;
  restart: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;
const rise = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } });

/** Scene backdrop: light (white + blue grid) or dark (navy control-room), as on the reference site. */
const Stage = ({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) => (
  <div className={`relative h-full overflow-hidden ${dark ? "theme-dark" : "bg-bg text-ink"}`}>
    <div className="grid-field" />
    <div className="hero-glow" />
    <div className="relative mx-auto flex h-full w-full max-w-[1180px] items-center px-6 pb-40 pt-20">{children}</div>
  </div>
);
const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;
const H = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-[clamp(1.9rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight ${className}`}>{children}</h2>
);

export function Opening({ cats, videoUrl, posterUrl, muted, onVideoError }: SceneProps) {
  const cards = cats.filter((c) => c.image).slice(0, 4);
  return (
    <Stage dark>
      {videoUrl && <video src={videoUrl} poster={posterUrl ?? undefined} autoPlay loop muted={muted} playsInline onError={onVideoError} className="absolute inset-0 -z-0 h-full w-full object-cover opacity-40" />}
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.div {...rise(0)}><Eyebrow>Technology for the extraordinary</Eyebrow></motion.div>
          <motion.h1 {...rise(0.15)} className="mt-5 text-[clamp(2.4rem,6vw,4.6rem)] font-extrabold leading-[1.02] tracking-tight">
            Every connection enables <span className="text-gradient">something greater.</span>
          </motion.h1>
          <motion.p {...rise(0.45)} className="mt-5 max-w-[46ch] text-[1.05rem] text-ink-dim">
            Welcome to SETMI INDIA. Connectors, cables and AV accessories, supplied from Delhi since 1983.
          </motion.p>
        </div>
        <div className="hidden grid-cols-2 gap-4 lg:grid">
          {cards.map((c, i) => (
            <motion.div key={c.slug} initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }} animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }} transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease }}>
              <div className="float rounded-2xl bg-white p-2 text-[#0b2540] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]" style={{ animationDelay: `${i * 0.7}s` }}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl"><ProductVisual cat={c} sizes="260px" priority /></div>
                <p className="pb-1 pt-2 text-center text-[0.82rem] font-semibold">{c.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

export function Who({ t, d, photos }: SceneProps) {
  const p = photos[2] ?? photos[0];
  return (
    <Stage>
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <motion.div {...rise(0)}><Eyebrow>Our story</Eyebrow></motion.div>
          <motion.div {...rise(0.1)} className="mt-4"><H>Since <span className="text-gradient">1983</span>, we have made connections stronger.</H></motion.div>
          <motion.span {...rise(0.2)} className="mt-5 block h-[3px] w-14 rounded bg-accent-soft" />
          <motion.p {...rise(0.3)} className="mt-5 max-w-[56ch] leading-relaxed text-ink-dim">{who.body}</motion.p>
          <motion.dl {...rise(0.5)} className="mt-7 grid grid-cols-3 overflow-hidden rounded-2xl border border-panel-line bg-bg-elevated">
            {who.facts.map((f, i) => (
              <div key={f.k} className={`p-4 ${i ? "border-l border-panel-line" : ""}`}>
                <dt className="font-mono text-2xl font-semibold text-accent-strong md:text-3xl">{f.k}</dt>
                <dd className="mt-1 text-[0.78rem] text-ink-dim">{f.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        {p && (
          <motion.div {...rise(0.3)} className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl border border-panel-line shadow-[0_24px_60px_-28px_rgba(1,53,86,0.6)] lg:block">
            <Image src={`/expo/expo-${p.id}.webp`} alt="SETMI INDIA stall at an industry expo" fill sizes="45vw" className="object-cover" style={{ transform: `scale(${1.02 + (t / d) * 0.08})`, transition: "transform 0.2s linear" }} />
          </motion.div>
        )}
      </div>
    </Stage>
  );
}

export function Supply({ t, d, cats, seek }: SceneProps) {
  const per = d / cats.length;
  const i = Math.min(Math.floor(t / per), cats.length - 1);
  const c = cats[i];
  return (
    <Stage>
      <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <div>
          <Eyebrow>What we make and move</Eyebrow>
          <H className="mt-4">Eight families of connection.</H>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Product families">
            {cats.map((x, n) => (
              <li key={x.slug}>
                <button onClick={() => seek(n * per + 0.01)} aria-pressed={n === i} className={`relative w-full overflow-hidden rounded-lg border px-2.5 py-2 text-left text-[0.8rem] font-semibold leading-tight transition-colors ${n === i ? "border-accent bg-accent/5 text-accent-strong" : "border-panel-line text-ink-dim hover:text-ink"}`}>
                  {x.title}
                  {n === i && <motion.span layoutId="supply-bar" className="absolute inset-x-0 bottom-0 h-[3px] bg-accent" />}
                </button>
              </li>
            ))}
          </ul>
          <AnimatePresence mode="wait">
            <motion.div key={c.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="mt-6">
              <p className="text-xl font-bold">{c.title}</p>
              <p className="mt-1 max-w-[52ch] text-ink-dim">{c.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/products/${c.slug}`} className="btn btn-primary">Explore {c.title} <ArrowRight size={16} aria-hidden /></Link>
                <Link href={`/enquiry?category=${c.slug}`} className="btn">Enquire</Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            <motion.div key={c.slug} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease }} className="overflow-hidden rounded-2xl border border-panel-line bg-white shadow-[0_24px_60px_-28px_rgba(1,53,86,0.6)]">
              <div className="relative aspect-[4/3]"><ProductVisual cat={c} sizes="45vw" /></div>
              <div className="flex flex-wrap gap-1.5 border-t border-panel-line p-4">
                {c.family.slice(0, 6).map((f) => <span key={f} className="rounded-full bg-bg-elevated px-2.5 py-1 font-mono text-[0.7rem] text-ink-dim">{f}</span>)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Stage>
  );
}

export function Connector() {
  const points = [
    ["75 Ω coaxial", "Matched impedance for video, CCTV and RF test gear."],
    ["Bayonet lock", "Quarter-turn coupling: fast to fit, hard to shake loose."],
    ["Gold centre pin", "Low contact resistance and a corrosion-free signal path."],
  ];
  return (
    <Stage dark>
      <div className="grid w-full items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <motion.div {...rise(0)}><Eyebrow>Inside our connectors</Eyebrow></motion.div>
          <motion.div {...rise(0.1)} className="mt-4"><H>Engineered down to the last pin.</H></motion.div>
          <ul className="mt-6 space-y-3">
            {points.map(([a, b], n) => (
              <motion.li key={a} {...rise(0.3 + n * 0.15)} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-accent" />
                <span><span className="font-semibold">{a}</span><span className="block text-[0.88rem] text-ink-dim">{b}</span></span>
              </motion.li>
            ))}
          </ul>
          <Link href="/products/connectors" className="btn btn-primary mt-7">See BNC and other connectors <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <div className="relative h-[300px] sm:h-[420px]">
          <ConnectorScene />
          <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.72rem] text-ink-dim">Drag to rotate</p>
        </div>
      </div>
    </Stage>
  );
}

export function Uses({ t, d }: SceneProps) {
  const lit = Math.min(Math.floor((t / d) * uses.items.length), uses.items.length - 1);
  return (
    <Stage>
      <div className="grid w-full items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Where it is used</Eyebrow>
          <H className="mt-4">{uses.heading}</H>
          <ul className="mt-6 space-y-2">
            {uses.items.map((u, n) => (
              <li key={u.title} className={`rounded-xl border px-4 py-3 transition-all duration-500 ${n === lit ? "border-accent bg-accent/5 shadow-[0_10px_30px_-18px_rgba(0,90,132,0.6)]" : "border-panel-line"}`}>
                <p className="font-bold">{u.title}</p>
                <p className="text-[0.88rem] text-ink-dim">{u.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden rounded-2xl border border-panel-line bg-bg-elevated p-6 lg:block"><SignalDiagram /></div>
      </div>
    </Stage>
  );
}

export function Order({ t, d }: SceneProps) {
  return (
    <Stage>
      <div className="w-full">
        <Eyebrow>How an order moves</Eyebrow>
        <H className="mt-4">Every order runs on a system.</H>
        <div className="mt-6 lg:mt-2"><OrderExplainer t={t} d={d} /></div>
      </div>
    </Stage>
  );
}

export function Expo({ t, d, photos }: SceneProps) {
  const reel = photos.filter((p) => p.w > p.h).slice(0, 4);
  const i = Math.min(Math.floor((t / d) * reel.length), reel.length - 1);
  return (
    <Stage>
      <div className="grid w-full items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>On the show floor</Eyebrow>
          <H className="mt-4">Meet us at industry expos.</H>
          <div className="mt-5 flex gap-2" aria-hidden>
            {reel.map((p, n) => <span key={p.id} className={`h-1.5 rounded-full transition-all duration-500 ${n === i ? "w-8 bg-accent" : "w-3 bg-panel-line"}`} />)}
          </div>
          <Link href="/expo" className="btn mt-7">See all {photos.length} photos <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-panel-line bg-bg-elevated shadow-[0_24px_60px_-28px_rgba(1,53,86,0.6)]">
          <AnimatePresence>
            {reel[i] && (
              <motion.div key={reel[i].id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease }}>
                <Image src={`/expo/expo-${reel[i].id}.webp`} alt="SETMI INDIA stall at an industry expo" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Stage>
  );
}

export function Why() {
  return (
    <Stage>
      <div className="w-full">
        <Eyebrow>Why SETMI INDIA</Eyebrow>
        <H className="mt-4">{why.heading}</H>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {why.points.map((p, n) => (
            <motion.li key={p.title} {...rise(0.2 + n * 0.15)} className="rounded-2xl border border-panel-line bg-bg-elevated p-6">
              <span className="font-mono text-sm font-semibold text-accent">0{n + 1}</span>
              <p className="mt-3 text-xl font-bold">{p.title}</p>
              <p className="mt-1.5 text-ink-dim">{p.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </Stage>
  );
}

export function Closing({ restart }: SceneProps) {
  const wa = `https://api.whatsapp.com/send?phone=${site.whatsapp}&text=${encodeURIComponent("Hello SETMI INDIA, I have a requirement.")}`;
  return (
    <Stage dark>
      <div className="mx-auto w-full max-w-3xl text-center">
        <motion.div {...rise(0)}><Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={300} height={99} className="mx-auto h-auto w-44 md:w-56" /></motion.div>
        <motion.div {...rise(0.15)} className="mt-6"><H>Let&apos;s find the right connection for your requirement.</H></motion.div>
        <motion.div {...rise(0.35)} className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/enquiry?kind=quote" className="btn btn-primary">Request a quotation</Link>
          <Link href="/products" className="btn">Explore products</Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn"><MessageCircle size={16} aria-hidden /> WhatsApp</a>
          <a href={`tel:${site.phones[0].replace(/\s/g, "")}`} className="btn"><Phone size={16} aria-hidden /> Talk to our team</a>
          <a href={mainSite} target="_blank" rel="noopener noreferrer" className="btn">setmiindia.com <ArrowUpRight size={15} aria-hidden /></a>
        </motion.div>
        <motion.div {...rise(0.55)} className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-dim">
          <span>{site.phones.join(" · ")}</span>
          <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:text-ink"><Mail size={14} aria-hidden /> {site.email}</a>
          <Link href="/faq" className="hover:text-ink">Questions & answers</Link>
        </motion.div>
        <button onClick={restart} className="mx-auto mt-6 inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink"><RotateCcw size={14} aria-hidden /> Watch again</button>
      </div>
    </Stage>
  );
}

export const sceneComponents: Record<string, (p: SceneProps) => React.ReactNode> = {
  opening: Opening, who: Who, supply: Supply, connector: Connector, uses: Uses, order: Order, expo: Expo, why: Why, closing: Closing,
};
