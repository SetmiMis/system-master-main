"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// dotLottie player + its WASM are self-hosted (public/lottie) and only fetched when an icon renders.
const Player = dynamic(
  async () => {
    const m = await import("@lottiefiles/dotlottie-react");
    m.setWasmUrl("/lottie/dotlottie-player.wasm");
    return m.DotLottieReact;
  },
  { ssr: false },
);

const q = "(prefers-reduced-motion: reduce)";
const sub = (cb: () => void) => { const m = window.matchMedia(q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };

/** Animated icon from public/lottie/<name>.lottie (handshake, quality, records, shield, success, support, truck). */
export function LottieIcon({ name, className = "h-12 w-12" }: { name: string; className?: string }) {
  const still = useSyncExternalStore(sub, () => window.matchMedia(q).matches, () => true);
  return (
    <span aria-hidden className={`inline-block ${className}`}>
      <Player src={`/lottie/${name}.lottie`} loop autoplay={!still} />
    </span>
  );
}
