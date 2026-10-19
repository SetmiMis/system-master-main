"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CustomerMap = dynamic(() => import("@/components/film/CustomerMap"), { ssr: false, loading: () => <div className="grid h-full place-items-center text-sm text-ink-dim">Loading map…</div> });

/** The film's 3D customer map on a regular page: sweeps north to south, pauses, repeats. Static for reduced motion. */
export function CustomerMapLoop() {
  const [p, setP] = useState(0.55);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    const id = setInterval(() => setP(Math.min(((performance.now() - start) / 1000 % 16) / 13, 1)), 50);
    return () => clearInterval(id);
  }, []);
  return <CustomerMap progress={p} />;
}
