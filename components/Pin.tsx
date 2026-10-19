"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "motion/react";

// Pin only where there is room and the visitor allows motion. Elsewhere the scene is plain flow content.
const query = "(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const usePinned = () => useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);

/** Film-style scene: the frame sticks for ~70vh of normal scrolling while the content fades and drifts in and out. */
export function Pin({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = usePinned();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const opacity = useTransform(scrollYProgress, [0, 0.14, 0.86, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.14, 0.86, 1], [60, 0, 0, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.14, 0.86, 1], [0.97, 1, 1, 1.02]);

  if (!pinned) return <>{children}</>;
  return (
    <div ref={ref} className="h-[175vh]">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <motion.div style={{ opacity, y, scale }} className="w-full">{children}</motion.div>
      </div>
    </div>
  );
}
