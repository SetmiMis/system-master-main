// The home page film: one screen per scene, auto-advancing like a video.
// Durations are seconds; 0 = the scene holds until the visitor acts (the closing call to action).
// Each caption has English and Hindi text. buildVtt(lang) turns them into one WebVTT track per language,
// which the captions show and the browser voice reads. A recorded voice-over can replace it later.

export type Lang = "en" | "hi";
export interface FilmScene {
  id: string;
  title: string;
  duration: number;
  captions: { at: number; en: string; hi: string }[];
}

export const filmScenes: FilmScene[] = [
  { id: "opening", title: "Welcome", duration: 8, captions: [
    { at: 0.5, en: "Every connection enables something greater.", hi: "हर कनेक्शन कुछ बड़ा संभव बनाता है।" },
    { at: 4.5, en: "Welcome to SETMI INDIA.", hi: "सेटमी इंडिया में आपका स्वागत है।" },
  ] },
  { id: "who", title: "Who we are", duration: 11, captions: [
    { at: 0, en: "Since 1983, from Old Lajpat Rai Market in Delhi,", hi: "1983 से, दिल्ली के पुराने लाजपत राय मार्केट से," },
    { at: 5, en: "more than ten thousand orders fulfilled, for over six hundred customers.", hi: "दस हज़ार से ज़्यादा ऑर्डर, छह सौ से ज़्यादा ग्राहकों के लिए।" },
  ] },
  { id: "supply", title: "What we supply", duration: 16, captions: [
    { at: 0, en: "Connectors, circular and waterproof connectors, couplers, sockets and plugs.", hi: "कनेक्टर, सर्कुलर और वॉटरप्रूफ़ कनेक्टर, कपलर, सॉकेट और प्लग।" },
    { at: 8, en: "HDMI splitters, cables, and the parts that hold an installation together.", hi: "HDMI स्प्लिटर, केबल, और वो सभी पार्ट्स जो इंस्टॉलेशन को जोड़े रखते हैं।" },
  ] },
  { id: "shop", title: "Ready to order", duration: 12, captions: [
    { at: 0, en: "Ready to order today, with live prices from our online store.", hi: "आज ही ऑर्डर करें, हमारे ऑनलाइन स्टोर की लाइव कीमतों के साथ।" },
  ] },
  { id: "connector", title: "Inside a connector", duration: 10, captions: [
    { at: 0, en: "Take a closer look at a BNC plug from our range.", hi: "हमारी रेंज के एक BNC प्लग को करीब से देखिए।" },
  ] },
  { id: "map", title: "Our customers", duration: 13, captions: [
    { at: 0, en: "Our customers, across India, from north to south.", hi: "देश भर में हमारे ग्राहक, उत्तर से दक्षिण तक।" },
    { at: 6.5, en: "From Delhi to Bengaluru, Pune, Chennai and beyond.", hi: "दिल्ली से बेंगलुरु, पुणे, चेन्नई और उससे आगे तक।" },
  ] },
  { id: "order", title: "How an order moves", duration: 17.5, captions: [
    { at: 0, en: "Every order moves through seven panels,", hi: "हर ऑर्डर सात पैनलों से होकर गुज़रता है," },
    { at: 8, en: "each one tracked on a system, from enquiry to delivery.", hi: "हर पैनल एक सिस्टम पर ट्रैक होता है, पूछताछ से डिलीवरी तक।" },
  ] },
  { id: "systems", title: "Our systems", duration: 12, captions: [
    { at: 0, en: "Each part of SETMI INDIA runs on its own system.", hi: "सेटमी इंडिया का हर हिस्सा अपने सिस्टम पर चलता है।" },
    { at: 6, en: "Open any of them to see it working.", hi: "किसी को भी खोलकर देखिए कि वो कैसे काम करता है।" },
  ] },
  { id: "quality", title: "Verified quality", duration: 13, captions: [
    { at: 0, en: "ISO 9001:2015 certified, and registered for GST, IEC and Udyam.", hi: "ISO 9001:2015 प्रमाणित, और GST, IEC व उद्यम में पंजीकृत।" },
    { at: 6.5, en: "Buy where you prefer: GeM, Amazon or IndustryBuying.", hi: "जहाँ चाहें वहाँ से ख़रीदें: GeM, Amazon या IndustryBuying।" },
  ] },
  { id: "reviews", title: "What customers say", duration: 10, captions: [
    { at: 0, en: "Rated 4.9 on Google by 301 customers.", hi: "301 ग्राहकों ने Google पर 4.9 रेटिंग दी है।" },
  ] },
  { id: "expo", title: "At the expos", duration: 10, captions: [
    { at: 0, en: "You will find us on the show floor at industry expos.", hi: "इंडस्ट्री एक्सपो में हमसे मिलिए।" },
  ] },
  { id: "closing", title: "Find your connection", duration: 0, captions: [
    { at: 0, en: "Let's find the right connection for your requirement.", hi: "आइए, आपकी ज़रूरत के लिए सही कनेक्शन ढूँढें।" },
  ] },
];

const ts = (s: number) => {
  const m = Math.floor(s / 60), r = s - m * 60;
  return `${String(m).padStart(2, "0")}:${r.toFixed(3).padStart(6, "0")}`;
};

/** One WebVTT track on the film's global timeline. A caption lasts until the next one (or its scene's end). */
export function buildVtt(lang: Lang = "en", scenes = filmScenes): string {
  const out = ["WEBVTT", ""];
  let offset = 0;
  for (const s of scenes) {
    const end = offset + (s.duration || 30);
    s.captions.forEach((c, i) => {
      const next = s.captions[i + 1];
      out.push(`${ts(offset + c.at)} --> ${ts(next ? offset + next.at : end)}`, c[lang], "");
    });
    offset = end;
  }
  return out.join("\n");
}

export const sceneOffsets = filmScenes.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + filmScenes[i - 1].duration : 0], []);
