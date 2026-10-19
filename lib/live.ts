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

/** Products from one WooCommerce listing page of setmiindia.com (title, link, image, price, MOQ). */
export function parseListing(html: string): ShopProduct[] {
  return html
    .split("<li class=\"")
    .filter((li) => li.includes("type-product"))
    .flatMap((li): ShopProduct[] => {
      const link = li.match(/href="(https:\/\/setmiindia\.com\/product\/[^"]+)"/)?.[1];
      const image = li.match(/data-src="([^"]+)"/)?.[1];
      const title = li.match(/loop-product__title">([^<]+)</)?.[1];
      const price = li.match(/Current price is: ([^<]+)\./)?.[1] ?? li.match(/Price-currencySymbol[^>]*>([^<]+)<\/span>([\d,.]+)/)?.slice(1).join("");
      if (!link || !image || !title || !price) return [];
      return [{ title: decode(title).replace(/\s*Setmi India$/i, "").replace(/\s*\|\s*$/, ""), url: link, image, price: decode(price).replace(/\.00$/, ""), moq: li.match(/Minimum qty is (\d+)/)?.[1] }];
    });
}

async function fetchListing(url: string): Promise<ShopProduct[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return res.ok ? parseListing(await res.text()) : [];
  } catch {
    return [];
  }
}

/** Live prices for the "Ready to order today" scene (hourly). Empty on any failure. */
export async function getShopSeries(): Promise<ShopSeries[]> {
  const series = await Promise.all(SERIES.map(async ([name, slug]) => {
    const url = `https://setmiindia.com/${slug}/`;
    return { name, url, products: (await fetchListing(url)).slice(0, 4) };
  }));
  return series.filter((s) => s.products.length);
}

/** Up to `pages` listing pages (10 products each) of a setmiindia.com category, de-duplicated. */
export async function getCategoryProducts(categoryUrl: string, pages = 4): Promise<ShopProduct[]> {
  const base = categoryUrl.endsWith("/") ? categoryUrl : categoryUrl + "/";
  const lists = await Promise.all(Array.from({ length: pages }, (_, i) => fetchListing(i ? `${base}page/${i + 1}/` : base)));
  const seen = new Set<string>();
  return lists.flat().filter((p) => !seen.has(p.url) && seen.add(p.url));
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
