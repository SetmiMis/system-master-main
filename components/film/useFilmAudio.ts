"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "@/content/film";

const LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN" };

/** Best available voice for the language: natural/neural/online voices first, then any voice of that locale. */
function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const want = LOCALE[lang];
  const base = want.slice(0, 2);
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang === want ? 4 : v.lang.startsWith(base) ? 2 : 0) + (/natural|neural|online|google/i.test(v.name) ? 3 : 0) + (/neerja|swara|heera|kalpana|madhur|prabhat/i.test(v.name) ? 1 : 0);
  return voices.filter((v) => v.lang.startsWith(base)).sort((a, b) => score(b) - score(a))[0] ?? null;
}

/**
 * Sound for the film until a recorded voice-over exists:
 *  - narration: the browser's speech voice reads each caption in the chosen language (English or Hindi);
 *  - ambience: a soft synthesised pad (Web Audio) that ducks under the voice, so there is no music to license.
 * Starts only after the visitor turns sound on, follows play/pause, and stops when the film unmounts.
 */
export function useFilmAudio(on: boolean, playing: boolean, line: string | undefined, lang: Lang) {
  const ctx = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!on) { void ctx.current?.suspend(); return; }
    if (!ctx.current) {
      const c = new AudioContext();
      const out = c.createGain();
      out.gain.value = 0.028;
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 700;
      filter.Q.value = 0.4;
      filter.connect(out).connect(c.destination);
      // A2, E3, A3, C#4: an open A-major colour, slightly detuned for width
      [110, 164.81, 220, 277.18].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = i % 2 ? "triangle" : "sine";
        o.frequency.value = f;
        o.detune.value = (i - 1.5) * 5;
        o.connect(filter);
        o.start();
      });
      const lfo = c.createOscillator();
      const depth = c.createGain();
      lfo.frequency.value = 0.06;
      depth.gain.value = 250;
      lfo.connect(depth).connect(filter.frequency); // slow "breathing" of the filter
      lfo.start();
      ctx.current = c;
      master.current = out;
    }
    void (playing ? ctx.current.resume() : ctx.current.suspend());
  }, [on, playing]);

  useEffect(() => {
    const speech = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!speech) return;
    speech.cancel();
    if (!on || !playing || !line) return;
    const u = new SpeechSynthesisUtterance(line);
    u.lang = LOCALE[lang];
    u.voice = pickVoice(lang);
    u.rate = lang === "hi" ? 0.92 : 0.96;
    u.pitch = 1;
    const duck = (to: number) => {
      const g = master.current, c = ctx.current;
      if (g && c) g.gain.setTargetAtTime(to, c.currentTime, 0.25);
    };
    u.onstart = () => duck(0.012);
    u.onend = () => duck(0.028);
    speech.speak(u);
  }, [on, playing, line, lang]);

  useEffect(() => () => { window.speechSynthesis?.cancel(); void ctx.current?.close(); }, []);
}
