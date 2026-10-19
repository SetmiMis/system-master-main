import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ExpoGallery } from "@/components/ExpoGallery";
import { expoPhotos } from "@/content/expo";

export const metadata: Metadata = { title: "At the expos", description: "Photos from SETMI INDIA stalls at industry expos.", alternates: { canonical: "/expo" } };

export default function Expo() {
  return (
    <PageShell label="On the show floor" title="Meet us at industry expos." lede="Photos from our stalls. Tap a photo to see it full size.">
      <ExpoGallery photos={expoPhotos} />
    </PageShell>
  );
}
