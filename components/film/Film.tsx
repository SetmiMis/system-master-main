"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Captions, ChevronLeft, ChevronRight, ListVideo, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { filmScenes, sceneOffsets } from "@/content/film";
import { activeCue, parseVtt } from "@/lib/vtt";
import { sceneComponents, type SceneProps } from "@/components/film/Scenes";
import type { Category } from "@/types/content";
import type { ExpoPhoto } from "@/content/expo";

interface Props {
  vtt: string;
  videoUrl: string | null;
  posterUrl: string | null;
  cats: Category[];
  photos: ExpoPhoto[];
}

const sub = (q: string, ev: "change" | "visibilitychange") => (cb: () => void) => {
  if (ev === "visibilitychange") { document.addEventListener(ev, cb); return () => document.removeEventListener(ev, cb); }
  const m = window.matchMedia(q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb);
};
const RM = "(prefers-reduced-motion: reduce)";
const subReduced = sub(RM, "change");
const subHidden = sub("", "visibilitychange");

/**
 * The home page as a film. One clock drives the scene, its inner animation, the captions and the
 * timeline, so pausing pauses everything. No page scroll: scenes advance on their own; visitors can
 * pause, step, jump from the timeline, use arrow keys / space, or swipe. Reduced-motion visitors start paused.
 */
export function Film({ vtt, videoUrl, posterUrl, cats, photos }: Props) {
  const reduced = useSyncExternalStore(subReduced, () => window.matchMedia(RM).matches, () => false);
  const hidden = useSyncExternalStore(subHidden, () => document.hidden, () => false);
  const [manual, setManual] = useState<boolean | null>(null);
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [muted, setMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [menu, setMenu] = useState(false);
  const swipe = useRef<number | null>(null);

  const scene = filmScenes[idx];
  const last = idx === filmScenes.length - 1;
  const playing = (manual ?? !reduced) && !hidden && scene.duration > 0;
  const cues = parseVtt(vtt);
  const cue = activeCue(cues, sceneOffsets[idx] + t);
  const video = videoUrl && !videoFailed ? videoUrl : null;

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
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, a, button") && e.key === " ") return;
      if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === " ") { e.preventDefault(); setManual(!playing); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [idx, playing, go]);

  const props: SceneProps = {
    t, d: scene.duration, cats, photos, videoUrl: video, posterUrl, muted,
    onVideoError: () => setVideoFailed(true),
    seek: (x) => setT(x),
    restart: () => { go(0); setManual(true); },
  };
  const Scene = sceneComponents[scene.id];
  const timed = filmScenes.filter((s) => s.duration > 0);
  const total = timed.reduce((a, s) => a + s.duration, 0);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-bg text-ink">
      {/* top bar */}
      <header className="header-gradient absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between gap-3 px-5 shadow-[0_6px_20px_-12px_rgba(1,53,86,0.8)] md:px-10">
        <Link href="/" aria-label="SETMI INDIA home"><Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={130} height={43} priority className="h-8 w-auto md:h-9" /></Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm md:gap-2">
          <Link href="/products" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white sm:block">Products</Link>
          <Link href="/expo" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white md:block">Expos</Link>
          <Link href="/faq" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white md:block">FAQ</Link>
          <Link href="/enquiry" className="btn !min-h-9 !border-white !bg-white !text-[#013556]">Enquire</Link>
        </nav>
      </header>

      {/* stage */}
      <main
        className="relative flex-1"
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
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full min-h-[640px]"><Scene {...props} /></div>
          </motion.section>
        </AnimatePresence>

        {/* captions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center px-5">
          <AnimatePresence mode="wait">
            {captions && cue && (
              <motion.p key={cue.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl rounded-lg bg-[#0b2540]/90 px-4 py-2 text-center text-base font-medium text-white shadow-lg md:text-xl">
                {cue.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* player bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-panel-line bg-bg/95 px-4 pb-4 pt-3 backdrop-blur md:px-10">
        <div className="mb-3 flex gap-1" role="group" aria-label="Scenes">
          {filmScenes.map((s, i) => {
            const fill = i < idx ? 1 : i === idx && s.duration ? Math.min(t / s.duration, 1) : i === idx ? 1 : 0;
            return (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Scene ${i + 1}: ${s.title}`}
                aria-current={i === idx}
                className="group relative h-5 flex-1"
                style={{ flexGrow: s.duration ? s.duration / (total / timed.length) : 0.6 }}
              >
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-panel-line group-hover:h-1.5">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${fill * 100}%` }} />
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn icon-btn" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Previous scene"><ChevronLeft size={18} aria-hidden /></button>
          <button className="btn btn-primary icon-btn" onClick={() => setManual(!playing)} disabled={scene.duration === 0} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
          </button>
          <button className="btn icon-btn" onClick={() => go(idx + 1)} disabled={last} aria-label="Next scene"><ChevronRight size={18} aria-hidden /></button>
          <p className="ml-2 min-w-0 truncate text-sm">
            <span className="font-mono text-accent">{String(idx + 1).padStart(2, "0")} / {String(filmScenes.length).padStart(2, "0")}</span>
            <span className="ml-2 font-semibold">{scene.title}</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn icon-btn" aria-pressed={captions} onClick={() => setCaptions((c) => !c)} aria-label={`Captions ${captions ? "on" : "off"}`}><Captions size={18} aria-hidden /></button>
            <button
              className="btn icon-btn" disabled={!video} onClick={() => setMuted((m) => !m)}
              title={video ? undefined : "Narration has not been recorded yet"}
              aria-label={video ? `Sound ${muted ? "off" : "on"}` : "Sound unavailable: narration not recorded yet"}
            >
              {muted || !video ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
            </button>
            <div className="relative">
              <button className="btn icon-btn" aria-expanded={menu} aria-controls="scene-menu" onClick={() => setMenu((m) => !m)} aria-label="All scenes"><ListVideo size={18} aria-hidden /></button>
              {menu && (
                <ol id="scene-menu" className="absolute bottom-12 right-0 w-60 rounded-xl border border-panel-line bg-bg p-2 shadow-2xl">
                  {filmScenes.map((s, i) => (
                    <li key={s.id}>
                      <button onClick={() => go(i)} className={`flex w-full gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-elevated ${i === idx ? "text-accent" : ""}`}>
                        <span className="font-mono text-ink-dim">{String(i + 1).padStart(2, "0")}</span>{s.title}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
