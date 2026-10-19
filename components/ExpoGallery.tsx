"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ExpoPhoto } from "@/content/expo";

const alt = "SETMI INDIA stall at an industry expo";

/** Photo wall with a native <dialog> lightbox (focus trap and Escape come with the element). Arrow keys step through. */
export function ExpoGallery({ photos }: { photos: ExpoPhoto[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(0);
  const step = (d: number) => setOpen((o) => (o + d + photos.length) % photos.length);
  const cur = photos[open];

  return (
    <>
      <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={() => { setOpen(i); dialog.current?.showModal(); }}
              aria-label={`Open expo photo ${i + 1} of ${photos.length}`}
              className="group block w-full cursor-zoom-in overflow-hidden border border-line"
            >
              <Image src={`/expo/expo-${p.id}-s.webp`} alt={alt} width={p.w} height={p.h} sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.04]" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Expo photo viewer"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
        className="m-auto max-h-[94vh] max-w-[96vw] bg-transparent p-0 text-paper backdrop:bg-black/85"
      >
        <div className="relative">
          <Image src={`/expo/expo-${cur.id}.webp`} alt={alt} width={cur.w} height={cur.h} sizes="96vw" className="block max-h-[88vh] w-auto max-w-[92vw] object-contain" />
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="absolute right-2 top-2 grid h-10 w-10 place-items-center bg-black/70 hover:bg-black"><X size={18} aria-hidden /></button>
          <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-black/70 hover:bg-black"><ChevronLeft size={20} aria-hidden /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-black/70 hover:bg-black"><ChevronRight size={20} aria-hidden /></button>
          <p className="label absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 tabular-nums">{open + 1} / {photos.length}</p>
        </div>
      </dialog>
    </>
  );
}
