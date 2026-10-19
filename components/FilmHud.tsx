"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

export interface Chapter { id: string; label: string }

/** Film chrome: grain, vignette, a timeline bar and a "scene n / total" counter. Purely visual; navigation stays native. */
export function FilmHud({ chapters }: { chapters: Chapter[] }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(chapters.findIndex((c) => c.id === e.target.id))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [chapters]);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(0,0,0,0.55))]" />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-30 opacity-[0.07] mix-blend-screen" />
      <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-16 z-50 h-px origin-left bg-cyan" />
      <nav aria-label="Scenes" className="fixed bottom-5 left-5 z-40 hidden items-center gap-3 md:flex md:left-10">
        <span className="label tabular-nums text-paper">{String(active + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</span>
        <ol className="flex gap-1.5">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} aria-label={c.label} aria-current={i === active} title={c.label} className={`block h-1.5 transition-all ${i === active ? "w-8 bg-cyan" : "w-3 bg-line hover:bg-mute"}`} />
            </li>
          ))}
        </ol>
        <span className="label hidden lg:inline">{chapters[active]?.label}</span>
      </nav>
    </>
  );
}
