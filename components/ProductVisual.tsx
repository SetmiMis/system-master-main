import Image from "next/image";
import type { Category } from "@/types/content";

/** Fills its (relatively positioned) parent. Catalogue images are shown whole on white, as on setmiindia.com. */
export function ProductVisual({ cat, sizes, priority = false }: { cat: Category; sizes: string; priority?: boolean }) {
  if (!cat.image) {
    return (
      <div className="header-gradient absolute inset-0 grid place-items-center text-center text-white" role="img" aria-label={`${cat.title}: photo to be added`}>
        <div className="px-4">
          <p className="text-xl font-extrabold">{cat.title}</p>
          <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-widest text-white/75">Photograph coming soon</p>
        </div>
      </div>
    );
  }
  return <Image src={cat.image} alt={`${cat.title}, catalogue image from setmiindia.com`} fill sizes={sizes} priority={priority} className="bg-white object-contain" />;
}
