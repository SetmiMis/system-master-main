import type { SiteSettings } from "@/types/content";

// Contact details copied from https://setmiindia.com/contact/ (checked 2026-10-19).
export const site: SiteSettings = {
  title: "SETMI INDIA — Beyond Connections",
  tagline: "Engineered for the Extraordinary.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "info@setmiindia.com",
  phones: ["+91 85868 78111", "+91 11 47414746"],
  whatsapp: "918586878111",
  address: "167-168, Old Lajpat Rai Market, Opposite Red Fort (Chandni Chowk), Delhi-110006, India",
  catalogueUrl: null,
  social: [
    { label: "Instagram", url: "https://www.instagram.com/setmi_india" },
    { label: "Facebook", url: "https://www.facebook.com/setmi_india" },
    { label: "LinkedIn", url: "https://www.linkedin.com/company/setmi-india/" },
    { label: "YouTube", url: "https://www.youtube.com/@SetmiIndia" },
  ],
};

export const mainSite = "https://setmiindia.com/";
