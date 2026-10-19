"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, Play } from "lucide-react";
import { IntroPlayer } from "@/components/IntroPlayer";
import { parseVtt } from "@/lib/vtt";

interface Props {
  vtt: string;
  duration: number;
  videoUrl: string | null;
  posterUrl: string | null;
  slides: { src: string; position: string }[];
}

/** Silent looping backdrop so the first screen already moves like footage. Static for reduced-motion users (CSS stops the drift; the swap is a fade). */
function AmbientLoop({ slides }: { slides: Props["slides"] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, [slides.length]);
  const s = slides[i];
  if (!s) return null;
  return (
    <div aria-hidden className="absolute inset-0 [mask-image:linear-gradient(to_top,black_30%,transparent_85%)]">
      <AnimatePresence>
        <motion.div key={s.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 0.32 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }}>
          <Image src={s.src} alt="" fill sizes="100vw" priority={i === 0} className="drift object-cover" style={{ objectPosition: s.position }} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Opening({ vtt, duration, videoUrl, posterUrl, slides }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback((toContent: boolean) => {
    setOpen(false);
    if (toContent) document.getElementById("who")?.scrollIntoView();
    else setTimeout(() => trigger.current?.focus(), 0);
  }, []);

  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 md:pb-24">
      <AmbientLoop slides={slides} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent" />
      <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="in-view absolute inset-0 h-full w-full opacity-30" fill="none" stroke="var(--color-cyan)" strokeWidth="1">
        {[160, 240, 320, 400, 480].map((y, i) => (
          <path key={y} className="draw" pathLength={1} style={{ animationDelay: `${0.3 + i * 0.25}s` }} d={`M0 ${y} H380 L440 ${y - 50} H760 L820 ${y} H1200`} />
        ))}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_30%,rgba(53,227,245,0.10),transparent)]" />

      <div className="relative mx-auto w-full max-w-[1500px] px-5 md:px-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          <Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={420} height={139} priority className="mb-10 h-auto w-56 md:w-80" />
        </motion.div>
        <motion.h1
          id="hero-title"
          className="max-w-5xl font-display text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.95] tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          Every connection enables something greater.
        </motion.h1>
        <motion.p className="mt-6 max-w-xl text-lg text-mute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}>
          Welcome to SETMI INDIA. Connectors, cables and AV accessories from Delhi, since 1983.
        </motion.p>
        <motion.div className="mt-10 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}>
          <button ref={trigger} className="btn btn-primary" onClick={() => setOpen(true)}>
            <Play size={16} aria-hidden /> Start experience
          </button>
          <a className="btn" href="#who">
            <ArrowDown size={16} aria-hidden /> Explore without intro
          </a>
        </motion.div>
      </div>

      {open && <IntroPlayer cues={parseVtt(vtt)} duration={duration} videoUrl={videoUrl} posterUrl={posterUrl} slides={slides} onClose={close} />}
    </section>
  );
}
