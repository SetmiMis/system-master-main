import { Film } from "@/components/film/Film";
import { getCategories, getIntro } from "@/lib/content";
import { expoPhotos } from "@/content/expo";
import { getReviews, getShopSeries } from "@/lib/live";

export const revalidate = 300;

export default async function Home() {
  const [cats, intro, shop, reviews] = await Promise.all([getCategories(), getIntro(), getShopSeries(), getReviews()]);
  return <Film vtt={intro.vtt} videoUrl={intro.videoUrl} posterUrl={intro.posterUrl} cats={cats} photos={expoPhotos} shop={shop} reviews={reviews} />;
}
