"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Captions, FileText, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { activeCue } from "@/lib/vtt";
import type { Cue } from "@/types/content";

interface Props {
  cues: Cue[];
  duration: number;
  videoUrl: string | null;
  posterUrl: string | null;
  slides: { src: string; position: string }[];
  onClose: (finished: boolean) => void;
}

/**
 * One timeline drives captions, scene markers and progress. With a videoUrl the <video>
 * is the clock; without footage a virtual clock runs over still imagery so the experience
 * still works (and says so) until real media is supplied.
 */
export function IntroPlayer({ cues, duration, videoUrl, posterUrl, slides, onClose }: Props) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [transcript, setTranscript] = useState(false);
  const [muted, setMuted] = useState(true); // autoplay policy: start muted, user opts in
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLength, setVideoLength] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const useVideo = Boolean(videoUrl) && !videoFailed;
  const total = useVideo && videoLength ? videoLength : duration;

  // Virtual clock
  useEffect(() => {
    if (useVideo || !playing) return;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      setT((p) => Math.min(p + (now - last) / 1000, duration));
      last = now;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, useVideo, duration]);

  useEffect(() => {
    if (t >= total && total > 0) {
      const id = setTimeout(() => onClose(true), 700);
      return () => clearTimeout(id);
    }
  }, [t, total, onClose]);

  // Modal behaviour: inert background, scroll lock, Escape, focus
  useEffect(() => {
    const page = document.getElementById("page");
    page?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    first.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose(false);
    window.addEventListener("keydown", esc);
    return () => {
      page?.removeAttribute("inert");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (useVideo) (p ? video.current?.pause() : video.current?.play().catch(() => setPlaying(false)));
      return !p;
    });
  }, [useVideo]);

  const restart = () => {
    setT(0);
    setPlaying(true);
    if (video.current) { video.current.currentTime = 0; video.current.play().catch(() => setPlaying(false)); }
  };

  const seek = (v: number) => {
    setT(v);
    if (video.current) video.current.currentTime = v;
  };

  const cue = activeCue(cues, t);
  const slide = slides.length ? slides[Math.min(Math.floor((t / total) * slides.length), slides.length - 1)] : null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="SETMI INDIA introduction" className="fixed inset-0 z-[100] flex flex-col bg-ink">
      <div className="relative flex-1 overflow-hidden">
        {useVideo ? (
          <video
            ref={video}
            src={videoUrl!}
            poster={posterUrl ?? undefined}
            muted={muted}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setVideoLength(e.currentTarget.duration)}
            onEnded={() => setT(videoLength || duration)}
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <>
            <AnimatePresence>
              {slide && (
                <motion.div key={slide.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
                  <Image src={slide.src} alt="" fill sizes="100vw" className="drift object-cover" style={{ objectPosition: slide.position }} />
                </motion.div>
              )}
            </AnimatePresence>
            <svg aria-hidden viewBox="0 0 1200 400" className="in-view absolute inset-x-0 top-1/2 w-full -translate-y-1/2 opacity-60" fill="none" stroke="var(--color-cyan)" strokeWidth="1">
              {[120, 200, 280].map((y, i) => (
                <path key={y} className="draw" pathLength={1} style={{ animationDelay: `${i * 0.4}s` }} d={`M0 ${y} H420 L470 ${y - 40} H730 L780 ${y} H1200`} />
              ))}
            </svg>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-8">
          <Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={160} height={53} className="h-10 w-auto" />
          {!useVideo && <p className="label">Footage pending: stills shown</p>}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex min-h-40 items-end justify-center px-5 pb-8" aria-live="polite">
          {captions && cue && (
            <p key={cue.text} className="max-w-3xl bg-ink/70 px-4 py-2 text-center font-display text-3xl leading-tight [text-shadow:0_1px_3px_#000] md:text-5xl">
              {cue.text}
            </p>
          )}
        </div>

        {transcript && (
          <aside aria-label="Transcript" className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-line bg-panel p-6">
            <h2 className="label mb-4">Transcript</h2>
            <ol className="space-y-3 text-sm">
              {cues.map((c) => (
                <li key={c.start} className={c === cue ? "text-cyan" : "text-mute"}>{c.text}</li>
              ))}
            </ol>
          </aside>
        )}
      </div>

      <div className="border-t border-line bg-panel px-4 py-3 md:px-8">
        <div className="relative mb-3 h-5">
          <input
            type="range" min={0} max={total} step={0.1} value={t} onChange={(e) => seek(Number(e.target.value))}
            aria-label="Timeline" aria-valuetext={`${Math.floor(t)} of ${Math.floor(total)} seconds`}
            className="absolute inset-0 w-full accent-cyan"
          />
          {cues.map((c) => (
            <span key={c.start} aria-hidden className="pointer-events-none absolute top-0 h-1 w-px bg-paper/60" style={{ left: `${(c.start / total) * 100}%` }} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button ref={first} className="btn !px-3" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
          <button className="btn !px-3" onClick={restart} aria-label="Restart"><RotateCcw size={16} /></button>
          <button className="btn !px-3" aria-pressed={captions} onClick={() => setCaptions((c) => !c)} aria-label={`Captions ${captions ? "on" : "off"}`}><Captions size={16} /></button>
          <button className="btn !px-3" aria-pressed={transcript} onClick={() => setTranscript((v) => !v)} aria-label="Transcript"><FileText size={16} /></button>
          <button
            className="btn !px-3" disabled={!useVideo}
            title={useVideo ? undefined : "Narration has not been recorded yet"}
            onClick={() => setMuted((m) => !m)} aria-pressed={!muted} aria-label={useVideo ? `Sound ${muted ? "off" : "on"}` : "Sound unavailable: narration not recorded yet"}
          >
            {muted || !useVideo ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <span className="label ml-2 tabular-nums">{Math.floor(t)}s / {Math.floor(total)}s</span>
          <button className="btn ml-auto" onClick={() => onClose(true)}>Explore without intro</button>
          <button className="btn btn-primary" onClick={() => onClose(true)}><SkipForward size={16} aria-hidden /> Skip intro</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
