"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, FileText, Mail, MessageCircle, Phone, RotateCcw, Star } from "lucide-react";
import { ProductVisual } from "@/components/ProductVisual";
import { LottieIcon } from "@/components/LottieIcon";
import { OrderExplainer } from "@/components/film/OrderExplainer";
import { site, mainSite } from "@/content/site";
import { who } from "@/content/story";
import { certificate, companyStats, marketplaces, publicSystems } from "@/content/trust";
import type { Category } from "@/types/content";
import type { ExpoPhoto } from "@/content/expo";
import type { ReviewData, ShopSeries } from "@/lib/live";

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
  shop: ShopSeries[];
  reviews: ReviewData;
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

/** Number that counts up with the film clock (so it pauses with the film). */
const Count = ({ to, t, delay = 0, suffix = "" }: { to: number; t: number; delay?: number; suffix?: string }) => {
  const k = Math.min(Math.max((t - delay) / 2.2, 0), 1);
  const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
  return <span className="tabular-nums">{v.toLocaleString("en-IN")}{suffix}</span>;
};

export function Who({ t, d, photos, reviews }: SceneProps) {
  const p = photos[2] ?? photos[0];
  return (
    <Stage>
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <motion.div {...rise(0)}><Eyebrow>Our story</Eyebrow></motion.div>
          <motion.div {...rise(0.1)} className="mt-4"><H>Since <span className="text-gradient">1983</span>, we have made connections stronger.</H></motion.div>
          <motion.span {...rise(0.2)} className="mt-5 block h-[3px] w-14 rounded bg-accent-soft" />
          <motion.p {...rise(0.3)} className="mt-5 hidden max-w-[56ch] leading-relaxed text-ink-dim sm:block">{who.body}</motion.p>
          <motion.dl {...rise(0.5)} className="mt-7 grid grid-cols-2 overflow-hidden rounded-2xl border border-panel-line bg-bg-elevated sm:grid-cols-4">
            {companyStats.map((s, i) => (
              <div key={s.label} className={`p-4 shadow-[inset_0_2px_0_0_rgba(76,195,217,0.4)] ${i ? "sm:border-l sm:border-panel-line" : ""}`}>
                <dt className="font-mono text-2xl font-semibold text-accent-strong md:text-[1.7rem]"><Count to={s.value} t={t} delay={0.6 + i * 0.25} suffix={s.suffix} /></dt>
                <dd className="mt-1 text-[0.76rem] text-ink-dim">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
          <motion.p {...rise(0.9)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-panel-line bg-bg px-3 py-1.5 text-sm font-semibold">
            <Star size={15} className="fill-cat-4 text-cat-4" aria-hidden /> {reviews.rating} on Google · {reviews.count} reviews
          </motion.p>
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

export function Shop({ t, d, shop, seek }: SceneProps) {
  if (!shop.length) {
    return (
      <Stage>
        <div className="max-w-2xl">
          <Eyebrow>Popular products</Eyebrow>
          <H className="mt-4">Ready to order today.</H>
          <p className="mt-4 text-ink-dim">The online store is the quickest way to order single pieces or small quantities.</p>
          <a href={mainSite} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6">Open the store <ArrowUpRight size={15} aria-hidden /></a>
        </div>
      </Stage>
    );
  }
  const per = d / shop.length;
  const i = Math.min(Math.max(Math.floor(t / per), 0), shop.length - 1);
  const s = shop[i];
  return (
    <Stage>
      <div className="w-full">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Popular products · live prices</Eyebrow>
            <H className="mt-4">Ready to order today.</H>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Series">
            {shop.map((x, n) => (
              <button key={x.name} onClick={() => seek(n * per + 0.01)} aria-pressed={n === i} className={`rounded-full border px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${n === i ? "border-accent bg-accent text-white" : "border-panel-line text-ink-dim hover:text-ink"}`}>{x.name}</button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.ul key={s.name} className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" initial="h" animate="v" exit="h" variants={{ v: { transition: { staggerChildren: 0.08 } } }}>
            {s.products.map((p) => (
              <motion.li key={p.url} variants={{ h: { opacity: 0, y: 24, rotateX: 12 }, v: { opacity: 1, y: 0, rotateX: 0 } }} transition={{ duration: 0.5, ease }} style={{ transformPerspective: 800 }}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-xl border border-panel-line bg-bg transition-shadow hover:shadow-[0_18px_34px_-20px_rgba(1,53,86,0.55)]">
                  <div className="relative aspect-[4/3] bg-white sm:aspect-square"><Image src={p.image} alt={p.title} fill sizes="(min-width:1024px) 22vw, 45vw" className="object-contain transition-transform duration-500 group-hover:scale-105" /></div>
                  <div className="border-t border-panel-line p-3">
                    <p className="line-clamp-2 min-h-[2.5em] text-[0.82rem] font-semibold leading-snug">{p.title}</p>
                    <p className="mt-1 text-[1.05rem] font-extrabold text-accent-strong">{p.price}</p>
                    {p.moq && <p className="text-[0.7rem] text-ink-dim">Min. order {p.moq} pcs</p>}
                  </div>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
        <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">All {s.name} on setmiindia.com <ArrowUpRight size={14} aria-hidden /></a>
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

/** Google-style feature tour: cards land one by one, then the spotlight walks across them. */
export function Systems({ t, d }: SceneProps) {
  const n = publicSystems.length;
  const lit = Math.min(Math.max(Math.floor(((t - 1.5) / (d - 1.5)) * n), -1), n - 1);
  const host = (u: string) => new URL(u).host;
  return (
    <Stage>
      <div className="w-full">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Behind every order</Eyebrow>
            <H className="mt-4">Every part of SETMI INDIA runs on a system.</H>
          </div>
          <div className="flex gap-2">
            <Link href="/systems" className="btn">All systems <ArrowRight size={15} aria-hidden /></Link>
            <Link href="/dashboard" className="btn btn-primary">Live dashboard</Link>
          </div>
        </div>
        <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {publicSystems.map((s, i) => {
            const on = i === lit;
            return (
              <motion.li key={s.name} initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: on ? -8 : 0, scale: on ? 1.04 : 1 }} transition={{ type: "spring", stiffness: 140, damping: 18, delay: t < 1.5 ? 0.15 * i : 0 }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={`flex h-full flex-col rounded-2xl border bg-bg p-4 transition-[border-color,box-shadow] duration-500 ${on ? "border-accent shadow-[0_24px_44px_-22px_rgba(0,90,132,0.7)]" : "border-panel-line"}`}>
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-white shadow-[0_8px_20px_-12px_rgba(1,53,86,0.5)]"><LottieIcon name={s.icon} className="h-12 w-12" /></span>
                  <p className="mt-3 font-bold">{s.name}</p>
                  <p className="mt-1 flex-1 text-[0.82rem] text-ink-dim">{s.description}</p>
                  <p className="mt-3 flex items-center justify-between gap-2 text-[0.75rem]">
                    <span className="truncate font-mono text-ink-dim">{host(s.url)}</span>
                    <span className="flex-none font-semibold text-accent">Open ↗</span>
                  </p>
                </a>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </Stage>
  );
}

export function Quality({ t }: SceneProps) {
  return (
    <Stage>
      <div className="grid w-full items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.a
          href={certificate.pdf}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the ISO 9001:2015 certificate (PDF)"
          className="mx-auto hidden w-full max-w-[300px] overflow-hidden rounded-xl border border-panel-line bg-white shadow-[0_30px_60px_-30px_rgba(1,53,86,0.7)] lg:block"
          initial={{ opacity: 0, rotateY: -35, rotateZ: -4, x: -40 }}
          animate={{ opacity: 1, rotateY: -8 + Math.sin(t * 0.6) * 6, rotateZ: -2, x: 0 }}
          transition={{ duration: 0.9, ease }}
          style={{ transformPerspective: 1000 }}
        >
          <Image src={certificate.image} alt={`${certificate.name} certificate, SETMI INDIA`} width={600} height={848} className="w-full" />
        </motion.a>
        <div>
          <Eyebrow>Certified & trusted</Eyebrow>
          <H className="mt-4">Verified quality. Buy where you prefer.</H>
          <motion.div {...rise(0.3)} className="mt-5 rounded-2xl border border-panel-line bg-bg-elevated p-4">
            <p className="font-mono text-[0.72rem] uppercase tracking-wider text-accent-strong">{certificate.name} · {certificate.title}</p>
            <p className="mt-1 text-[0.85rem] text-ink-dim">Certificate no. <span className="font-mono font-semibold text-ink">{certificate.number}</span> · issued {certificate.issued}</p>
            <a href={certificate.pdf} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"><FileText size={14} aria-hidden /> View certificate (PDF)</a>
          </motion.div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {marketplaces.map((m, i) => (
              <motion.li key={m.name} {...rise(0.5 + i * 0.15)}>
                <a href={m.href} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col rounded-xl border border-panel-line bg-bg p-3 transition-colors hover:border-accent">
                  <Image src={m.logo} alt={m.name} width={200} height={56} className="h-11 w-full rounded-md bg-white object-contain p-1" />
                  <p className="mt-2 flex-1 text-[0.76rem] leading-snug text-ink-dim">{m.note}</p>
                  <span className="mt-2 text-[0.78rem] font-semibold text-accent">{m.cta} →</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </Stage>
  );
}

export function Reviews({ t, d, reviews }: SceneProps) {
  const r = reviews.reviews;
  const i = Math.min(Math.max(Math.floor(((t - 2) / (d - 2)) * r.length), 0), r.length - 1);
  const stars = Math.min(Math.max((t - 0.4) / 1.6, 0), 1) * 5;
  return (
    <Stage dark>
      <div className="mx-auto w-full max-w-4xl text-center">
        <Eyebrow>What customers say</Eyebrow>
        <p className="mt-6 font-mono text-[clamp(4rem,12vw,8rem)] font-semibold leading-none text-gradient">{reviews.rating}</p>
        <div className="mt-3 flex justify-center gap-1.5" aria-label={`${reviews.rating} out of 5 stars`}>
          {[0, 1, 2, 3, 4].map((s) => (
            <span key={s} className="relative h-7 w-7">
              <Star className="absolute inset-0 text-white/20" size={28} aria-hidden />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${Math.min(Math.max(stars - s, 0), 1) * 100}%` }}><Star className="fill-cat-4 text-cat-4" size={28} aria-hidden /></span>
            </span>
          ))}
        </div>
        <p className="mt-4 text-lg text-ink-dim">Rated {reviews.rating} on Google by {reviews.count} customers.</p>
        <AnimatePresence mode="wait">
          <motion.blockquote key={i} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }} className="mx-auto mt-8 max-w-2xl rounded-2xl border border-panel-line bg-bg-elevated px-6 py-5 text-left">
            <p className="text-[1.05rem] leading-relaxed">&ldquo;{r[i]?.text}&rdquo;</p>
            <footer className="mt-2 text-sm text-ink-dim">{r[i]?.author}</footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/** Museum-style: dark room, a giant word behind, one photo hung in light, turning slowly with the clock. */
export function Expo({ t, d, photos }: SceneProps) {
  const reel = photos.filter((p) => p.w > p.h).slice(0, 4);
  const i = Math.min(Math.max(Math.floor((t / d) * reel.length), 0), reel.length - 1);
  return (
    <Stage dark>
      <p aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center text-[22vw] font-extrabold leading-none tracking-tighter text-white/[0.04]">EXPO</p>
      <div className="relative grid w-full items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>On the show floor</Eyebrow>
          <H className="mt-4">Meet us at industry expos.</H>
          <p className="mt-6 font-mono text-5xl font-semibold text-accent">{String(i + 1).padStart(2, "0")}<span className="text-xl text-ink-dim"> / {String(photos.length).padStart(2, "0")}</span></p>
          <Link href="/expo" className="btn mt-7">See all {photos.length} photos <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <motion.div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]" animate={{ rotateY: -6 + (t / d) * 12, rotateX: 3 }} transition={{ duration: 0.3, ease: "linear" }} style={{ transformPerspective: 1200 }}>
          <AnimatePresence>
            {reel[i] && (
              <motion.div key={reel[i].id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease }}>
                <Image src={`/expo/expo-${reel[i].id}.webp`} alt="SETMI INDIA stall at an industry expo" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
  opening: Opening, who: Who, supply: Supply, shop: Shop, connector: Connector, order: Order, systems: Systems, quality: Quality, reviews: Reviews, expo: Expo, closing: Closing,
};
