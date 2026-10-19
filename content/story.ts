import type { Step } from "@/types/content";

export const intro = {
  duration: 12,
  // WebVTT, so it can be replaced by a database value or a .vtt file later.
  vtt: `WEBVTT

00:00.500 --> 00:04.000
Every connection enables something greater.

00:04.000 --> 00:08.000
Welcome to SETMI INDIA.

00:08.000 --> 00:12.000
Engineered for the Extraordinary.
`,
};

export const who = {
  heading: "Since 1983, we have made connections stronger.",
  body: "SETMI INDIA began with a simple goal: more reliable connections. From a small venture it grew into a supplier of audio-video cables, connectors and multimedia products, serving homes and industries across India from Old Lajpat Rai Market, opposite the Red Fort in Delhi.",
  facts: [
    { k: "1983", v: "Serving since" },
    { k: "8", v: "Product categories" },
    { k: "Delhi", v: "Chandni Chowk, opposite Red Fort" },
  ],
};

export const uses = {
  heading: "Where these connections go to work.",
  body: "Applications named on setmiindia.com for our connectors, plus what each product family physically does.",
  items: [
    { title: "Electrical and electronics assembly", body: "General assembly where long-term contact quality matters." },
    { title: "OEM and panel building", body: "Panel-mount connectors with consistent contact quality." },
    { title: "Maintenance, repair and replacement wiring", body: "Like-for-like parts for existing installations." },
    { title: "Audio-video signal runs", body: "HDMI splitters, jointers and cables that move one source to many screens." },
  ],
};

// Proposed process, approved by the owner on 2026-10-19. Editable.
export const steps: Step[] = [
  { title: "Understand the requirement", body: "Tell us what you are connecting and where." },
  { title: "Identify the product", body: "We match it to a product or specification." },
  { title: "Confirm compatibility and availability", body: "We check it fits and is in stock." },
  { title: "Quotation and ordering", body: "We coordinate the quotation and your order." },
  { title: "Fulfilment support", body: "We support you through delivery as agreed." },
];

export const why = {
  heading: "What we can stand behind.",
  points: [
    { title: "Four decades in the trade", body: "Serving customers since 1983." },
    { title: "A broad range in one place", body: "Eight categories of connectors, cables and accessories." },
    { title: "Reachable by people", body: "A shop in Delhi, phone lines, WhatsApp and email." },
  ],
};
