// Live data sources, ported from the company reference site (setmi-overview/src/lib). All server-side; every
// function falls back cleanly so the site never breaks when a source is down or not configured.

export type ShopProduct = { title: string; url: string; image: string; price: string; moq?: string };
export type ShopSeries = { name: string; url: string; products: ShopProduct[] };
export type Review = { author: string; text: string; rating: number };
export type ReviewData = { rating: number; count: number; reviews: Review[] };
export type Metrics = {
  asOf: string;
  customers: number;
  enquiriesTotal: number;
  enquiriesThisMonth: number;
  callsThisMonth: number;
  followUpsThisMonth: number;
  months: { categories: string[]; data: number[] };
  demand: { name: string; count: number }[];
  states: { state: string; count: number }[];
};

const SERIES: [string, string][] = [
  ["BNC Series", "bnc-connectors"],
  ["UHF Series", "uhf-connectors"],
  ["SMA Series", "sma-connectors"],
  ["Solar MC4 Series", "solar-connectors"],
];

const decode = (s: string) =>
  s.replace(/&#8377;/g, "₹").replace(/&amp;/g, "&").replace(/&#8211;|&#8212;/g, "–").replace(/&#038;/g, "&").replace(/&#8217;/g, "'").replace(/<[^>]+>/g, "").trim();

/** Live prices parsed from the public store listings on setmiindia.com (hourly). Empty on any failure. */
export async function getShopSeries(): Promise<ShopSeries[]> {
  const load = async ([name, slug]: [string, string]): Promise<ShopSeries> => {
    const url = `https://setmiindia.com/${slug}/`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(String(res.status));
      const products = (await res.text())
        .split('<li class="ast-article-single')
        .slice(1)
        .flatMap((li): ShopProduct[] => {
          const link = li.match(/href="(https:\/\/setmiindia\.com\/product\/[^"]+)"/)?.[1];
          const image = li.match(/data-src="([^"]+)"/)?.[1];
          const title = li.match(/loop-product__title">([^<]+)</)?.[1];
          const price = li.match(/Current price is: ([^<]+)\./)?.[1] ?? li.match(/Price-currencySymbol[^>]*>([^<]+)<\/span>([\d,.]+)/)?.slice(1).join("");
          if (!link || !image || !title || !price) return [];
          return [{ title: decode(title).replace(/\s*Setmi India$/i, ""), url: link, image, price: decode(price).replace(/\.00$/, ""), moq: li.match(/Minimum qty is (\d+)/)?.[1] }];
        })
        .slice(0, 4);
      return { name, url, products };
    } catch {
      return { name, url, products: [] };
    }
  };
  return (await Promise.all(SERIES.map(load))).filter((s) => s.products.length);
}

// Real Google reviews, used until GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are set.
const reviewFallback: ReviewData = {
  rating: 4.9,
  count: 301,
  reviews: [
    { author: "Google review", rating: 5, text: "Big variety, fix price, large display, good staff and owner always present." },
    { author: "Google review", rating: 5, text: "Product quality, service, and customer handling are excellent." },
    { author: "Google review", rating: 5, text: "Staff are good and having good manner and rates are reasonable." },
  ],
};

export async function getReviews(): Promise<ReviewData> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const id = process.env.GOOGLE_PLACE_ID;
  if (!key || !id) return reviewFallback;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${id}`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,reviews" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return reviewFallback;
    const d = await res.json();
    const reviews: Review[] = (d.reviews ?? [])
      .filter((r: { rating?: number; text?: { text?: string } }) => (r.rating ?? 0) >= 4 && r.text?.text)
      .map((r: { rating: number; text: { text: string }; authorAttribution?: { displayName?: string } }) => ({ author: r.authorAttribution?.displayName ?? "Google review", text: r.text.text, rating: r.rating }));
    return { rating: d.rating ?? reviewFallback.rating, count: d.userRatingCount ?? reviewFallback.count, reviews: reviews.length ? reviews : reviewFallback.reviews };
  } catch {
    return reviewFallback;
  }
}

/** Counts-only feed from the E2O FMS Apps Script. Null when E2O_METRICS_URL / E2O_METRICS_KEY are not set or the call fails. */
export async function getMetrics(): Promise<Metrics | null> {
  const url = process.env.E2O_METRICS_URL;
  const key = process.env.E2O_METRICS_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}?page=metrics&key=${encodeURIComponent(key)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const m = await res.json();
    return m.error ? null : (m as Metrics);
  } catch {
    return null;
  }
}
