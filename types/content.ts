export type Status = "draft" | "published";

export interface SiteSettings {
  title: string;
  tagline: string;
  siteUrl: string;
  email: string;
  phones: string[];
  whatsapp: string; // digits only, with country code
  address: string;
  catalogueUrl: string | null; // null until a PDF catalogue is supplied
  social: { label: string; url: string }[];
}

export interface Category {
  slug: string;
  title: string;
  summary: string;
  family: string[]; // product types listed on setmiindia.com
  usedFor: string[]; // plain description of what the products do
  examples: string[]; // product names listed on setmiindia.com
  sourceUrl: string;
  image: string | null; // null => intentional placeholder
  focus?: string; // CSS object-position for the supplied marketing image
  status: Status;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  status: Status;
}

export interface Step {
  title: string;
  body: string;
}

export interface Cue {
  start: number;
  end: number;
  text: string;
}
