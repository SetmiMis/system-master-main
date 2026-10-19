"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Captions, ChevronLeft, ChevronRight, ListVideo, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { buildVtt, filmScenes, sceneOffsets, type Lang } from "@/content/film";
import { activeCue, parseVtt } from "@/lib/vtt";
import { sceneComponents, type SceneProps } from "@/components/film/Scenes";
import { Gate } from "@/components/film/Gate";
import { useFilmAudio } from "@/components/film/useFilmAudio";
import type { Category } from "@/types/content";
import type { ExpoPhoto } from "@/content/expo";
import type { ReviewData, ShopSeries } from "@/lib/live";
import type { SystemCard } from "@/lib/content";

interface Props {
  vtt: string; // English track (may be overridden from /admin); Hindi comes from content/film.ts
  videoUrl: string | null;
  posterUrl: string | null;
  cats: Category[];
  photos: ExpoPhoto[];
  shop: ShopSeries[];
  reviews: ReviewData;
  systems: SystemCard[];
}

const sub = (q: string, ev: "change" | "visibilitychange") => (cb: () => void) => {
  if (ev === "visibilitychange") { document.addEventListener(ev, cb); return () => document.removeEventListener(ev, cb); }
  const m = window.matchMedia(q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb);
};
const RM = "(prefers-reduced-motion: reduce)";
const subReduced = sub(RM, "change");
const subHidden = sub("", "visibilitychange");
const hiCues = parseVtt(buildVtt("hi"));

/**
 * The home page as a film. A gate opens it; then one clock drives the scene, its inner animation, the
 * captions and the voice, so pausing pauses everything. No page scroll and no timeline bar: a small control
 * pill (play with a progress ring, prev/next, captions, sound, EN/हिं, scenes), arrow keys, space and swipe.
 * Reduced-motion visitors start paused.
 */
export function Film({ vtt, videoUrl, posterUrl, cats, photos, shop, reviews, systems }: Props) {
  const reduced = useSyncExternalStore(subReduced, () => window.matchMedia(RM).matches, () => false);
  const hidden = useSyncExternalStore(subHidden, () => document.hidden, () => false);
  const [entered, setEntered] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [manual, setManual] = useState<boolean | null>(null);
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [sound, setSound] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [videoFailed, setVideoFailed] = useState(false);
  const [menu, setMenu] = useState(false);
  const swipe = useRef<number | null>(null);

  const scene = filmScenes[idx];
  const last = idx === filmScenes.length - 1;
  const playing = entered && (manual ?? !reduced) && !hidden && scene.duration > 0;
  const cues = lang === "hi" ? hiCues : parseVtt(vtt);
  const cue = activeCue(cues, sceneOffsets[idx] + t);
  const video = videoUrl && !videoFailed ? videoUrl : null;
  useFilmAudio(entered && sound && !video, playing, cue?.text, lang);

  const go = useCallback((i: number, at = 0) => { setIdx(Math.max(0, Math.min(filmScenes.length - 1, i))); setT(at); setMenu(false); }, []);

  useEffect(() => {
    if (!playing) return;
    let prev = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      // rAF timestamps can precede performance.now() taken when the effect started: never let time run backwards.
      const dt = Math.max(0, (now - prev) / 1000);
      prev = now;
      setT((x) => x + dt);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, idx]);

  useEffect(() => {
    if (scene.duration > 0 && t >= scene.duration) go(idx + 1);
  }, [t, scene.duration, idx, go]);

  useEffect(() => {
    if (!entered) return;
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, a, button") && e.key === " ") return;
      if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === " ") { e.preventDefault(); setManual(!playing); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [entered, idx, playing, go]);

  const props: SceneProps = {
    t, d: scene.duration, cats, photos, shop, reviews, systems, videoUrl: video, posterUrl, muted: !sound,
    onVideoError: () => setVideoFailed(true),
    seek: (x) => setT(x),
    restart: () => { go(0); setManual(true); },
  };
  const Scene = sceneComponents[scene.id];
  const progress = scene.duration ? Math.min(t / scene.duration, 1) : 1;
  const R = 17, C = 2 * Math.PI * R;

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg text-ink">
      {!gateGone && <Gate open={entered} onEnter={(withSound) => { setSound(withSound); setEntered(true); setTimeout(() => setGateGone(true), 1800); }} />}

      {/* top bar */}
      <header className="header-gradient absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between gap-3 px-5 shadow-[0_6px_20px_-12px_rgba(1,53,86,0.8)] md:px-10">
        <Link href="/" aria-label="SETMI INDIA home"><Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={130} height={43} priority className="h-8 w-auto md:h-9" /></Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm md:gap-2">
          <Link href="/products" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white sm:block">Products</Link>
          <Link href="/systems" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white md:block">Systems</Link>
          <Link href="/dashboard" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white lg:block">Numbers</Link>
          <Link href="/expo" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white lg:block">Expos</Link>
          <Link href="/faq" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white md:block">FAQ</Link>
          <Link href="/enquiry" className="btn !min-h-9 !border-white !bg-white !text-[#013556]">Enquire</Link>
        </nav>
      </header>

      {/* stage */}
      <main
        className="absolute inset-0"
        onPointerDown={(e) => { swipe.current = e.clientX; }}
        onPointerUp={(e) => {
          if (swipe.current == null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 70 && e.pointerType !== "mouse") go(idx + (dx < 0 ? 1 : -1));
        }}
      >
        <p className="sr-only" aria-live="polite">Scene {idx + 1} of {filmScenes.length}: {scene.title}</p>
        <AnimatePresence initial={false}>
          <motion.section
            key={scene.id}
            aria-roledescription="scene"
            aria-label={scene.title}
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full min-h-[640px]"><Scene {...props} /></div>
          </motion.section>
        </AnimatePresence>
      </main>

      {/* captions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-5">
        <AnimatePresence mode="wait">
          {entered && captions && cue && (
            <motion.p key={cue.text} lang={lang === "hi" ? "hi" : "en"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl rounded-xl bg-[#0b2540]/90 px-5 py-2.5 text-center text-base font-medium text-white shadow-lg backdrop-blur md:text-xl">
              {cue.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* scene title, bottom left */}
      <div className="pointer-events-none absolute bottom-6 left-5 z-30 hidden md:left-10 md:block">
        <p className="font-mono text-xs tracking-[0.2em] text-ink-dim">{String(idx + 1).padStart(2, "0")} / {String(filmScenes.length).padStart(2, "0")}</p>
        <AnimatePresence mode="wait">
          <motion.p key={scene.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-lg font-extrabold">{scene.title}</motion.p>
        </AnimatePresence>
      </div>

      {/* control pill, bottom right */}
      <div className="absolute bottom-5 right-1/2 z-30 flex translate-x-1/2 items-center gap-1 rounded-full border border-panel-line bg-bg/90 p-1.5 shadow-[0_18px_40px_-18px_rgba(1,53,86,0.6)] backdrop-blur md:right-10 md:translate-x-0">
        <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-bg-elevated disabled:opacity-30" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Previous scene"><ChevronLeft size={18} aria-hidden /></button>
        <button className="relative grid h-11 w-11 place-items-center rounded-full bg-[linear-gradient(135deg,#005a84,#013556)] text-white disabled:opacity-40" onClick={() => setManual(!playing)} disabled={scene.duration === 0} aria-label={playing ? "Pause" : "Play"}>
          <svg aria-hidden className="absolute inset-0 -rotate-90" viewBox="0 0 44 44"><circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" /><circle cx="22" cy="22" r={R} fill="none" stroke="#5fd6c3" strokeWidth="2" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} strokeLinecap="round" /></svg>
          {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-bg-elevated disabled:opacity-30" onClick={() => go(idx + 1)} disabled={last} aria-label="Next scene"><ChevronRight size={18} aria-hidden /></button>
        <span className="mx-1 h-6 w-px bg-panel-line" aria-hidden />
        <button className={`grid h-10 w-10 place-items-center rounded-full hover:bg-bg-elevated ${captions ? "text-accent" : "text-ink-dim"}`} aria-pressed={captions} onClick={() => setCaptions((c) => !c)} aria-label={`Captions ${captions ? "on" : "off"}`}><Captions size={18} aria-hidden /></button>
        <button className={`grid h-10 w-10 place-items-center rounded-full hover:bg-bg-elevated ${sound ? "text-accent" : "text-ink-dim"}`} onClick={() => setSound((s) => !s)} aria-pressed={sound} aria-label={`Sound ${sound ? "on" : "off"}`} title="Voice reads the captions until a recorded narration is added">
          {sound ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        </button>
        <div className="flex rounded-full bg-bg-elevated p-0.5 text-xs font-bold" role="group" aria-label="Language">
          {(["en", "hi"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`h-8 rounded-full px-2.5 transition-colors ${lang === l ? "bg-accent text-white" : "text-ink-dim hover:text-ink"}`}>{l === "en" ? "EN" : "हिं"}</button>
          ))}
        </div>
        <div className="relative">
          <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-bg-elevated" aria-expanded={menu} aria-controls="scene-menu" onClick={() => setMenu((m) => !m)} aria-label="All scenes"><ListVideo size={18} aria-hidden /></button>
          {menu && (
            <ol id="scene-menu" className="absolute bottom-14 right-0 w-64 rounded-2xl border border-panel-line bg-bg p-2 shadow-2xl">
              {filmScenes.map((s, i) => (
                <li key={s.id}>
                  <button onClick={() => go(i)} aria-label={`Scene ${i + 1}: ${s.title}`} className={`flex w-full gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-bg-elevated ${i === idx ? "font-bold text-accent" : ""}`}>
                    <span className="font-mono text-ink-dim">{String(i + 1).padStart(2, "0")}</span>{s.title}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
