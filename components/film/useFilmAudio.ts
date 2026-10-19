"use client";

import { useEffect, useRef } from "react";

/**
 * Sound for the film until a recorded voice-over exists:
 *  - narration: the browser's own speech voice reads each caption (prefers an Indian English voice);
 *  - ambience: a quiet synthesised pad (Web Audio), so there is no third-party music to license.
 * Both only start after the visitor turns sound on, follow play/pause, and stop when the film unmounts.
 */
export function useFilmAudio(on: boolean, playing: boolean, line: string | undefined) {
  const ctx = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!on) { void ctx.current?.suspend(); return; }
    if (!ctx.current) {
      const c = new AudioContext();
      const master = c.createGain();
      master.gain.value = 0.035;
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;
      filter.connect(master).connect(c.destination);
      [110, 164.81, 220, 277.18].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = i % 2 ? "triangle" : "sine";
        o.frequency.value = f;
        o.detune.value = (i - 1.5) * 4;
        o.connect(filter);
        o.start();
      });
      const lfo = c.createOscillator();
      const depth = c.createGain();
      lfo.frequency.value = 0.07;
      depth.gain.value = 0.015;
      lfo.connect(depth).connect(master.gain);
      lfo.start();
      ctx.current = c;
    }
    void (playing ? ctx.current.resume() : ctx.current.suspend());
  }, [on, playing]);

  useEffect(() => {
    const speech = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!speech) return;
    speech.cancel();
    if (!on || !playing || !line) return;
    const u = new SpeechSynthesisUtterance(line);
    const voices = speech.getVoices();
    u.voice = voices.find((v) => v.lang === "en-IN") ?? voices.find((v) => v.lang.startsWith("en-GB")) ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
    u.rate = 0.98;
    speech.speak(u);
  }, [on, playing, line]);

  useEffect(() => () => { window.speechSynthesis?.cancel(); void ctx.current?.close(); }, []);
}
