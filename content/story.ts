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

// Order journey. Steps and system names come from the SETMI overview project
// (C:\Users\SETMI INDIA\Documents\setmi-overview, src/lib/data.ts and systems.ts).
// Systems flagged internal there (OMS, ERP, attendance) are shown by function, never by name or link.
// DRAFT: the step-to-system mapping below needs confirmation from operations before launch.
export interface OrderStep extends Step { panel: string; system: string }
export const steps: OrderStep[] = [
  { panel: "01", title: "Enquiry", body: "You share the connector or cable type, specification and quantity.", system: "Order Management" },
  { panel: "02", title: "Technical check", body: "Our team checks the requirement against catalogued parts and flags anything custom.", system: "Order Management" },
  { panel: "03", title: "Quotation", body: "Price and lead time are confirmed and the order is raised.", system: "Sales FMS" },
  { panel: "04", title: "Stock or purchase", body: "Parts are allocated from stock, or routed to purchase and production.", system: "Inventory · Purchase FMS · Production planning" },
  { panel: "05", title: "Quality check", body: "The order is inspected before it leaves.", system: "Quality Records" },
  { panel: "06", title: "Dispatch", body: "Packed, labelled and handed to the courier with a tracking reference.", system: "Dispatch & Tracking" },
  { panel: "07", title: "Delivery", body: "The order is closed once delivery is confirmed with you.", system: "Client Communication Log" },
];

export const orderBranch = {
  from: "04",
  question: "Is it in stock?",
  yes: "Allocate from inventory, then straight to quality check.",
  no: "Purchase FMS raises the purchase order; production planning schedules any manufacturing; then quality check.",
};

export const why = {
  heading: "What we can stand behind.",
  points: [
    { title: "Four decades in the trade", body: "Serving customers since 1983." },
    { title: "A broad range in one place", body: "Eight categories of connectors, cables and accessories." },
    { title: "Reachable by people", body: "A shop in Delhi, phone lines, WhatsApp and email." },
  ],
};
