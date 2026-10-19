// The home page film: one screen per scene, auto-advancing like a video.
// Durations are seconds; 0 = the scene holds until the visitor acts (the closing call to action).
// Captions are the narration script. They are turned into one WebVTT track (buildVtt) so the same
// track can be edited in /admin, read aloud by the browser voice, or replaced by a recorded voice-over.

export interface FilmScene {
  id: string;
  title: string;
  duration: number;
  captions: { at: number; text: string }[];
}

export const filmScenes: FilmScene[] = [
  { id: "opening", title: "Welcome", duration: 8, captions: [
    { at: 0.5, text: "Every connection enables something greater." },
    { at: 4.5, text: "Welcome to SETMI INDIA." },
  ] },
  { id: "who", title: "Who we are", duration: 11, captions: [
    { at: 0, text: "Since 1983, from Old Lajpat Rai Market in Delhi," },
    { at: 5, text: "more than ten thousand orders fulfilled, for over six hundred customers." },
  ] },
  { id: "supply", title: "What we supply", duration: 16, captions: [
    { at: 0, text: "Connectors, circular and waterproof connectors, couplers, sockets and plugs." },
    { at: 8, text: "HDMI splitters, cables, and the parts that hold an installation together." },
  ] },
  { id: "shop", title: "Ready to order", duration: 12, captions: [
    { at: 0, text: "Ready to order today, with live prices from our online store." },
  ] },
  { id: "connector", title: "Inside a connector", duration: 10, captions: [
    { at: 0, text: "Take a closer look at a BNC plug from our range." },
  ] },
  { id: "order", title: "How an order moves", duration: 17.5, captions: [
    { at: 0, text: "Every order moves through seven panels," },
    { at: 8, text: "each one tracked on a system, from enquiry to delivery." },
  ] },
  { id: "systems", title: "Our systems", duration: 12, captions: [
    { at: 0, text: "Each part of SETMI INDIA runs on its own system." },
    { at: 6, text: "Open any of them to see it working." },
  ] },
  { id: "quality", title: "Verified quality", duration: 12, captions: [
    { at: 0, text: "ISO 9001:2015 certified." },
    { at: 4, text: "Buy where you prefer: GeM, Amazon or IndustryBuying." },
  ] },
  { id: "reviews", title: "What customers say", duration: 10, captions: [
    { at: 0, text: "Rated 4.9 on Google by 301 customers." },
  ] },
  { id: "expo", title: "At the expos", duration: 10, captions: [
    { at: 0, text: "You will find us on the show floor at industry expos." },
  ] },
  { id: "closing", title: "Find your connection", duration: 0, captions: [
    { at: 0, text: "Let's find the right connection for your requirement." },
  ] },
];

const ts = (s: number) => {
  const m = Math.floor(s / 60), r = s - m * 60;
  return `${String(m).padStart(2, "0")}:${r.toFixed(3).padStart(6, "0")}`;
};

/** One WebVTT track on the film's global timeline. A caption lasts until the next one (or its scene's end). */
export function buildVtt(scenes = filmScenes): string {
  const out = ["WEBVTT", ""];
  let offset = 0;
  for (const s of scenes) {
    const end = offset + (s.duration || 30);
    s.captions.forEach((c, i) => {
      const next = s.captions[i + 1];
      out.push(`${ts(offset + c.at)} --> ${ts(next ? offset + next.at : end)}`, c.text, "");
    });
    offset = end;
  }
  return out.join("\n");
}

export const sceneOffsets = filmScenes.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + filmScenes[i - 1].duration : 0], []);
