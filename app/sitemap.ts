import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { categories } from "@/content/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = ["", "/products", "/systems", "/dashboard", "/expo", "/faq", "/enquiry", ...categories.map((c) => `/products/${c.slug}`)];
  return urls.map((u) => ({ url: `${site.siteUrl}${u}` }));
}
