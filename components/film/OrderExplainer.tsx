"use client";

import { motion } from "motion/react";
import { Boxes, Check, ClipboardCheck, FileText, MessageSquareText, PackageCheck, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { branchLog, steps } from "@/content/story";

const N = steps.length;
const icons: LucideIcon[] = [MessageSquareText, ClipboardCheck, FileText, Boxes, ShieldCheck, Truck, PackageCheck];
const colors = ["var(--cat-1)", "var(--cat-2)", "var(--cat-5)", "var(--cat-4)", "var(--cat-3)", "var(--cat-6)", "var(--accent)"];

/**
 * Explainer-style motion graphic driven by the film clock: an order card travels node to node
 * (shared layoutId, so it glides on any layout), each system lights up as the order reaches it,
 * and panel 04 shows both paths (stock first, then purchase) within its time slot.
 */
export function OrderExplainer({ t, d }: { t: number; d: number }) {
  const slot = d / N;
  const active = Math.min(Math.floor(t / slot), N - 1);
  const purchase = active === 3 && t - 3 * slot > slot / 2;
  const status = active === 3 ? (purchase ? branchLog.no : branchLog.yes) : steps[active].log;

  return (
    <div className="w-full">
      <ol className="relative flex flex-col gap-2 lg:flex-row lg:gap-0">
        {/* rail behind the nodes (desktop) */}
        <span aria-hidden className="absolute left-[7%] right-[7%] top-[118px] hidden h-0.5 rounded bg-panel-line lg:block" />
        <motion.span
          aria-hidden
          className="absolute left-[7%] top-[118px] hidden h-0.5 origin-left rounded bg-accent lg:block"
          animate={{ width: `${(active / (N - 1)) * 86}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
        {steps.map((s, i) => {
          const Icon = icons[i];
          const now = i === active, done = i < active;
          return (
            <li key={s.panel} className="relative flex items-center gap-3 lg:flex-1 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
              {/* order card lives above the active node and glides between nodes */}
              <div className="hidden h-[86px] w-full items-end justify-center lg:flex">
                {now && (
                  <motion.div layoutId="order-card" transition={{ type: "spring", stiffness: 120, damping: 18 }} className="relative w-[11rem] rounded-xl border border-panel-line bg-bg px-3 py-2 text-left shadow-[0_12px_30px_-12px_rgba(1,53,86,0.45)]">
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-dim">Order · panel {s.panel}</p>
                    <motion.p key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[0.78rem] font-semibold leading-snug">{status}</motion.p>
                    <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-panel-line bg-bg" />
                  </motion.div>
                )}
              </div>
              <motion.span
                className="relative z-10 grid h-11 w-11 flex-none place-items-center rounded-full border-2 lg:mt-2 lg:h-16 lg:w-16"
                animate={{
                  scale: now ? 1.12 : 1,
                  backgroundColor: now || done ? colors[i] : "var(--bg)",
                  borderColor: now || done ? colors[i] : "var(--panel-line)",
                  color: now || done ? "#ffffff" : "var(--ink-dim)",
                  boxShadow: now ? `0 0 0 8px color-mix(in srgb, ${colors[i]} 18%, transparent)` : "0 0 0 0px transparent",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <Icon size={22} aria-hidden />
                {done && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ok text-white"><Check size={12} aria-hidden /></span>}
              </motion.span>
              <div className="min-w-0 lg:mt-4 lg:px-1">
                <p className={`text-[0.95rem] font-bold leading-tight lg:text-base ${now ? "text-accent" : ""}`}>
                  <span className="mr-1.5 font-mono text-[0.7rem] text-ink-dim">{s.panel}</span>{s.title}
                </p>
                <p className="mt-0.5 font-mono text-[0.68rem] uppercase tracking-wider text-ink-dim">{s.system}</p>
                {now && <motion.p layoutId="order-card-mobile" className="mt-1 text-[0.8rem] font-semibold text-accent lg:hidden">{status}</motion.p>}
              </div>
              {i === 3 && (
                <div className="ml-auto hidden gap-1.5 lg:absolute lg:flex lg:-bottom-16 lg:left-1/2 lg:ml-0 lg:w-[15rem] lg:-translate-x-1/2 lg:flex-col">
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold transition-colors ${active === 3 && !purchase ? "border-cat-3 bg-cat-3 text-white" : "border-panel-line text-ink-dim"}`}>In stock → allocate</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold transition-colors ${purchase ? "border-cat-4 bg-cat-4 text-white" : "border-panel-line text-ink-dim"}`}>Not in stock → Purchase FMS</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
