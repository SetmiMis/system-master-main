import Image from "next/image";
import type { Category } from "@/types/content";

/** Fills its (relatively positioned, aspect-ratio) parent. Shows an intentional placeholder when no image exists. */
export function ProductVisual({ cat, sizes, priority = false }: { cat: Category; sizes: string; priority?: boolean }) {
  if (!cat.image) {
    return (
      <div className="absolute inset-0 grid place-items-center border border-dashed border-line bg-panel text-center" role="img" aria-label={`${cat.title}: photo to be added`}>
        <div>
          <p className="font-display text-3xl">{cat.title}</p>
          <p className="label mt-2">Photograph coming soon</p>
        </div>
      </div>
    );
  }
  return (
    <Image
      src={cat.image}
      alt={`${cat.title}, catalogue image from setmiindia.com`}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={{ objectPosition: cat.focus ?? "50% 50%" }}
    />
  );
}
