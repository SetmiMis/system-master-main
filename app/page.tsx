import { Film } from "@/components/film/Film";
import { getCategories, getIntro } from "@/lib/content";
import { expoPhotos } from "@/content/expo";

export const revalidate = 300;

export default async function Home() {
  const [cats, intro] = await Promise.all([getCategories(), getIntro()]);
  return <Film vtt={intro.vtt} videoUrl={intro.videoUrl} posterUrl={intro.posterUrl} cats={cats} photos={expoPhotos} />;
}
