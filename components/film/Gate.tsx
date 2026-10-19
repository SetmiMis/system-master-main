"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";

const ease = [0.7, 0, 0.2, 1] as const;

/**
 * Opening gate: two navy doors meet in the middle with the logo across the seam. Entering swings the doors
 * open in 3D and lets light through. The click is also the browser's permission to start sound.
 */
export function Gate({ open, onEnter }: { open: boolean; onEnter: (withSound: boolean) => void }) {
  const door = "absolute inset-y-0 w-1/2 overflow-hidden bg-[linear-gradient(160deg,#0f3a5e_0%,#0b1625_70%)]";
  return (
    <motion.div
      className="fixed inset-0 z-[200]"
      style={{ perspective: 1600 }}
      initial={false}
      animate={open ? { pointerEvents: "none" } : { pointerEvents: "auto" }}
      role="dialog"
      aria-modal={!open}
      aria-label="Welcome to SETMI INDIA"
      aria-hidden={open}
    >
      {/* light that spills through the opening */}
      <motion.div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_50%_50%,rgba(95,214,195,0.55),transparent_70%)]" initial={{ opacity: 0 }} animate={{ opacity: open ? [0, 1, 0] : 0 }} transition={{ duration: 1.6, times: [0, 0.35, 1] }} />
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          className={`${door} ${side === "left" ? "left-0 border-r" : "right-0 border-l"} border-[#5fd6c3]/40`}
          style={{ transformOrigin: side === "left" ? "left center" : "right center" }}
          initial={false}
          animate={open ? { rotateY: side === "left" ? -105 : 105, opacity: 0 } : { rotateY: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease, opacity: { delay: 0.9, duration: 0.6 } }}
        >
          <div className="grid-field" style={{ ["--grid-line" as string]: "rgba(255,255,255,0.05)" }} />
          {/* door panelling */}
          <div className={`absolute inset-y-10 ${side === "left" ? "right-8 left-10" : "left-8 right-10"} rounded-2xl border border-white/10`} />
          <div className={`absolute top-1/2 h-16 w-1.5 -translate-y-1/2 rounded-full bg-[#5fd6c3]/70 ${side === "left" ? "right-4" : "left-4"}`} />
        </motion.div>
      ))}

      <AnimatePresence>
      {!open && (
      <motion.svg key="blueprint" exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: 0.5 }} aria-hidden viewBox="-200 -200 400 400" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(80vh,80vw)] w-[min(80vh,80vw)] -translate-x-1/2 -translate-y-1/2" fill="none" stroke="#5fd6c3" strokeWidth="0.8" initial={{ opacity: 0.55 }} style={{ opacity: 0.55 }}>
        <path className="draw" pathLength={1} d="M-200 0 H200 M0 -200 V200" strokeDasharray="1" opacity={0.5} />
        {[150, 115, 70, 22].map((r, i) => (
          <circle key={r} className="draw" pathLength={1} r={r} style={{ animationDelay: `${0.2 + i * 0.25}s` }} />
        ))}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r = (v: number) => Math.round(v * 100) / 100; // same rounding on server and client (no hydration mismatch)
          return <line key={i} className="draw" pathLength={1} x1={r(Math.cos(a) * 150)} y1={r(Math.sin(a) * 150)} x2={r(Math.cos(a) * 162)} y2={r(Math.sin(a) * 162)} style={{ animationDelay: `${1.1 + i * 0.02}s` }} />;
        })}
        <path className="draw" pathLength={1} d="M-115 175 H115 M-115 168 V182 M115 168 V182" style={{ animationDelay: "1.6s" }} />
        <text x="0" y="195" textAnchor="middle" fill="#5fd6c3" stroke="none" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="2">BNC · 75 Ω · FRONT VIEW</text>
      </motion.svg>
      )}
      {!open && (
      <motion.div key="welcome" className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6 text-center text-white" exit={{ opacity: 0, scale: 1.15 }} transition={{ duration: 0.5 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
          <Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={420} height={139} priority className="h-auto w-60 md:w-80" />
        </motion.div>
        <motion.p className="font-mono text-[0.78rem] uppercase tracking-[0.3em] text-[#5fd6c3]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Beyond connections · since 1983
        </motion.p>
        <motion.div className="flex flex-wrap justify-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <button autoFocus onClick={() => onEnter(true)} className="btn !border-transparent !bg-[#2fb6a1] !px-6 !text-[#06201c]">
            <Volume2 size={17} aria-hidden /> Enter with sound
          </button>
          <button onClick={() => onEnter(false)} className="btn !border-white/30 !bg-white/5 !text-white">
            <VolumeX size={17} aria-hidden /> Enter silently
          </button>
        </motion.div>
      </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
