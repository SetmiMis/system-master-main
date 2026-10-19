"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

/** Technical line drawing: one source split to three displays (what an HDMI splitter does). */
export function SignalDiagram() {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: "-15% 0px" });
  const line = { stroke: "var(--color-cyan)", strokeWidth: 1.2, fill: "none" } as const;
  const box = { stroke: "var(--color-line)", strokeWidth: 1.2, fill: "var(--color-panel)" } as const;
  return (
    <svg ref={ref} viewBox="0 0 640 300" role="img" aria-label="Diagram: one source connected through a splitter to three displays" className={`w-full ${seen ? "in-view" : ""}`}>
      <rect x="10" y="120" width="110" height="60" {...box} />
      <text x="65" y="155" textAnchor="middle" fill="var(--color-paper)" fontSize="13" fontFamily="var(--font-mono)">SOURCE</text>
      <rect x="250" y="120" width="120" height="60" {...box} stroke="var(--color-cyan)" />
      <text x="310" y="155" textAnchor="middle" fill="var(--color-paper)" fontSize="13" fontFamily="var(--font-mono)">SPLITTER</text>
      {[40, 135, 230].map((y, i) => (
        <g key={y}>
          <rect x="520" y={y - 5} width="110" height="60" {...box} />
          <text x="575" y={y + 29} textAnchor="middle" fill="var(--color-paper)" fontSize="13" fontFamily="var(--font-mono)">{`SCREEN ${i + 1}`}</text>
          <path className="draw" pathLength={1} style={{ animationDelay: `${0.8 + i * 0.2}s` }} d={`M370 150 C 440 150, 440 ${y + 25}, 520 ${y + 25}`} {...line} />
        </g>
      ))}
      <path className="draw" pathLength={1} d="M120 150 H250" {...line} />
    </svg>
  );
}
