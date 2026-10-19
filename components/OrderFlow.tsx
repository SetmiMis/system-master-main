"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { orderBranch, steps } from "@/content/story";

/** Flowchart of one order: numbered panels joined by a line that draws in, the system behind each panel, and the stock/purchase branch. */
export function OrderFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <div ref={ref} className={seen ? "in-view" : ""}>
      <ol className="relative grid gap-0 lg:grid-cols-7">
        {steps.map((s, i) => (
          <li key={s.panel} className="relative pb-10 pl-10 lg:pb-0 lg:pl-0 lg:pr-4 lg:pt-10">
            {/* connector: vertical on small screens, horizontal on large */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                style={{ transitionDelay: `${i * 0.25}s` }}
                className={`absolute bg-cyan transition-transform duration-700 ease-out left-[15px] top-8 h-full w-px origin-top lg:left-8 lg:top-[15px] lg:h-px lg:w-full lg:origin-left ${seen ? "scale-100" : "scale-0"}`}
              />
            )}
            <span className="absolute left-0 top-0 grid h-8 w-8 place-items-center border border-cyan bg-ink font-mono text-xs text-cyan">{s.panel}</span>
            <h3 className="font-display text-2xl">{s.title}</h3>
            <p className="mt-2 text-sm text-mute">{s.body}</p>
            <p className="label mt-4 border-t border-line pt-3"><span className="text-paper">System</span><br />{s.system}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-[auto_1fr_1fr]">
        <div className="bg-panel p-5">
          <p className="label">After panel {orderBranch.from}</p>
          <p className="mt-2 font-display text-2xl">{orderBranch.question}</p>
        </div>
        <div className="bg-panel p-5"><p className="label text-lime">Yes</p><p className="mt-2 text-sm text-mute">{orderBranch.yes}</p></div>
        <div className="bg-panel p-5"><p className="label text-cyan">No</p><p className="mt-2 text-sm text-mute">{orderBranch.no}</p></div>
      </div>
    </div>
  );
}
