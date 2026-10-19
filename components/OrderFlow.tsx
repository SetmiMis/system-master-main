"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { branchLog, orderBranch, steps } from "@/content/story";

const STEP_MS = 2400;
const N = steps.length;
const systems = [...new Set(steps.flatMap((s) => s.system.split(" · ")))];

const reducedQuery = "(prefers-reduced-motion: reduce)";
const useReduced = () =>
  useSyncExternalStore(
    (cb) => { const m = window.matchMedia(reducedQuery); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );

/**
 * A sample order running through the seven panels: the token travels the line, each panel lights up,
 * the systems behind it come online and a terminal log fills in. Alternate runs take the stock / purchase branch.
 * Autoplay only while visible and never for reduced-motion visitors (they can press Play or click a panel).
 */
export function OrderFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = useReduced();
  const [manual, setManual] = useState<boolean | null>(null);
  const [tick, setTick] = useState(0);
  const playing = manual ?? !reduced;

  useEffect(() => {
    if (!playing || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), STEP_MS);
    return () => clearInterval(id);
  }, [playing, inView]);

  const active = tick % N;
  const run = Math.floor(tick / N);
  const inStock = run % 2 === 0;
  const logLine = (i: number) => (i === 3 ? (inStock ? branchLog.yes : branchLog.no) : steps[i].log);
  const online = steps[active].system.split(" · ");
  const jump = (i: number) => { setManual(false); setTick(run * N + i); };

  return (
    <div ref={ref}>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button className="btn !px-3" onClick={() => setManual(!playing)} aria-label={playing ? "Pause the sample run" : "Play the sample run"}>
          {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
        </button>
        <button className="btn !px-3" onClick={() => { setTick(0); setManual(true); }} aria-label="Restart the sample run"><RotateCcw size={16} aria-hidden /></button>
        <p className="label">Sample run · illustrative, not a real order</p>
      </div>

      <ol className="relative grid gap-0 lg:grid-cols-7">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[11px] z-10 hidden h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_14px_3px_var(--color-lime)] lg:block"
          animate={{ left: `calc(${(active / N) * 100}% + 11px)` }}
          transition={{ type: "spring", stiffness: 70, damping: 16 }}
        />
        {steps.map((s, i) => {
          const done = i < active;
          const now = i === active;
          return (
            <li key={s.panel} className="relative pb-10 pl-10 lg:pb-0 lg:pl-0 lg:pr-4 lg:pt-10">
              {i < N - 1 && (
                <>
                  <span aria-hidden className="absolute left-[15px] top-8 h-full w-px bg-line lg:left-8 lg:top-[15px] lg:h-px lg:w-full" />
                  <span aria-hidden className={`absolute left-[15px] top-8 h-full w-px origin-top bg-cyan transition-transform duration-700 lg:left-8 lg:top-[15px] lg:h-px lg:w-full lg:origin-left ${done ? "scale-100" : "scale-0"}`} />
                </>
              )}
              <button
                onClick={() => jump(i)}
                aria-label={`Show panel ${s.panel}: ${s.title}`}
                aria-current={now}
                className={`absolute left-0 top-0 grid h-8 w-8 place-items-center border font-mono text-xs transition-colors ${now ? "border-cyan bg-cyan text-ink shadow-[0_0_18px_var(--color-cyan)]" : done ? "border-cyan bg-cyan/10 text-cyan" : "border-line bg-ink text-mute"}`}
              >
                {s.panel}
              </button>
              <h3 className={`font-display text-2xl transition-colors ${now ? "text-cyan" : ""}`}>{s.title}</h3>
              <p className="mt-2 text-sm text-mute">{s.body}</p>
              <p className="label mt-4 border-t border-line pt-3"><span className="text-paper">System</span><br />{s.system}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-[auto_1fr_1fr]">
        <div className="bg-panel p-5">
          <p className="label">After panel {orderBranch.from}</p>
          <p className="mt-2 font-display text-2xl">{orderBranch.question}</p>
        </div>
        <div className={`bg-panel p-5 transition-shadow ${active >= 3 && inStock ? "shadow-[inset_0_0_0_1px_var(--color-lime)]" : ""}`}>
          <p className="label text-lime">Yes</p><p className="mt-2 text-sm text-mute">{orderBranch.yes}</p>
        </div>
        <div className={`bg-panel p-5 transition-shadow ${active >= 3 && !inStock ? "shadow-[inset_0_0_0_1px_var(--color-cyan)]" : ""}`}>
          <p className="label text-cyan">No</p><p className="mt-2 text-sm text-mute">{orderBranch.no}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Terminal log (decorative: the same information is in the panels above) */}
        <div aria-hidden className="min-h-56 border border-line bg-black/50 p-5 font-mono text-xs leading-6 text-cyan">
          <p className="text-mute">SETMI ORDER CONSOLE · sample run {String(run + 1).padStart(2, "0")}</p>
          <AnimatePresence initial={false} mode="popLayout">
            {steps.slice(0, active + 1).map((s, i) => (
              <motion.p key={`${run}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap gap-x-2">
                <span className="text-mute">[{s.panel}]</span>
                <span>{logLine(i)}</span>
                <span className="text-mute">· {s.system.split(" · ")[0]}</span>
                <span className="text-lime">ok</span>
              </motion.p>
            ))}
          </AnimatePresence>
          <p className="mt-2 flex items-center gap-3 text-mute">
            <span>order progress</span>
            <span className="flex gap-1">{steps.map((s, i) => <span key={s.panel} className={`h-2 w-4 ${i <= active ? "bg-lime" : "bg-line"}`} />)}</span>
            <span>{active + 1}/{N}</span>
          </p>
        </div>

        <div>
          <p className="label">Systems behind an order</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {systems.map((sys) => {
              const lit = online.includes(sys);
              return (
                <li key={sys} className={`flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors ${lit ? "border-lime text-paper" : "border-line text-mute"}`}>
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${lit ? "bg-lime" : "bg-line"}`} />
                  {sys}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
