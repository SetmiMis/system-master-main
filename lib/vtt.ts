import type { Cue } from "@/types/content";

function seconds(t: string): number {
  const parts = t.trim().split(":").map(Number);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

/** Minimal WebVTT cue parser (mm:ss.mmm or hh:mm:ss.mmm). */
export function parseVtt(vtt: string | null | undefined): Cue[] {
  if (!vtt) return [];
  const cues: Cue[] = [];
  for (const block of vtt.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = block.split("\n").filter(Boolean);
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, b] = lines[i].split("-->");
    const start = seconds(a);
    const end = seconds(b.trim().split(/\s+/)[0]);
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    cues.push({ start, end, text: lines.slice(i + 1).join("\n") });
  }
  return cues;
}

export const activeCue = (cues: Cue[], t: number) => cues.find((c) => t >= c.start && t < c.end) ?? null;
