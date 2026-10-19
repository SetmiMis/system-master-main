# Architecture

## Stack and why

| Package | Why it is here |
| --- | --- |
| `next` 16 (App Router), `react` 19, TypeScript strict | Routing, server rendering, image optimisation, Vercel fit |
| `tailwindcss` 4 | Design tokens (`app/globals.css` `@theme`) and layout |
| `motion` (`motion/react`) | Reveals, crossfades, `MotionConfig reducedMotion="user"` strips transforms for users who prefer reduced motion |
| `lucide-react` | Interface icons |
| `three`, `@react-three/fiber`, `@react-three/drei` | The 3D BNC connector scene, reused from the company reference site; loaded only when that scene is reached |
| `@lottiefiles/dotlottie-react` | Animated icons for systems (the reference site's own .lottie files, self-hosted WASM in public/lottie) |
| `@supabase/supabase-js`, `@supabase/ssr` | Public reads and enquiry inserts (anon key), cookie sessions for admin |
| `zod` | Server-side validation (enquiries, admin forms) |
| `vitest`, `@playwright/test` | Unit and browser tests |

Not installed, on purpose: GSAP (the film clock plus `motion` covers every timeline here), Lenis (the home page does not scroll), Rive (no designed .riv files), react-spring (duplicates `motion`), Leaflet (the dashboard lists states instead of a map).

## Layout

```
app/            routes: / (film), /products, /products/[slug], /systems, /dashboard, /expo, /faq, /enquiry, /admin, /api/enquiry, sitemap, robots
components/     film/ (Film, Scenes, OrderExplainer, ConnectorScene, useFilmAudio), PageShell, Header, Footer, ProductVisual, LottieIcon, EnquiryForm, ExpoGallery
content/        typed fallback content: site, categories, faqs, story (copy, order steps), film (scenes + narration), expo (photos), trust (figures, certificate, marketplaces, systems)
lib/            content.ts (data access), live.ts (store, reviews, metrics), vtt.ts, enquiry.ts, supabase*.ts
supabase/       migrations/, seed.sql, README.md
tests/          unit/ (Vitest), e2e/ (Playwright)
docs/           this documentation
```

## Data flow

`lib/content.ts` reads published rows from Supabase with the anon key; if Supabase is not configured, errors or is empty it returns the local files in `/content`. Pages revalidate every 5 minutes, so admin edits appear within that window.

## Home film (`components/film/`)

`Film.tsx` owns one clock (seconds into the current scene). The clock drives the scene, its inner animation, the captions and the timeline, so pausing pauses everything. Scene list, durations and narration live in `content/film.ts`; `buildVtt()` turns the narration into one WebVTT track on the film timeline. The `intro` row of the `scenes` table can override that track and add an opening video (from `/admin`).
- `Gate.tsx` opens the film; its click is also the browser's permission for sound. The film clock does not run until the gate is passed.
- `CustomerMap.tsx` (three.js via react-three-fiber): every pincode centroid as a faint dot draws India; customer cells rise as pillars while the camera travels from north to south with the film clock. Data: `content/customer-map.json`.
- Captions in English or Hindi; the browser voice reads the chosen language.
- Autoplay only when the tab is visible; reduced-motion visitors start paused.
- Controls: a control pill (play with progress ring, previous/next, captions, sound, EN/हिं, scene list), arrow keys, space, swipe. No timeline bar.
- Sound (`useFilmAudio.ts`): the browser speech voice (en-IN preferred) reads each caption, over a quiet Web Audio pad. Off until the visitor turns it on. A recorded narration or a video URL replaces it.
- Live data (`lib/live.ts`, server-side, cached): store prices parsed from setmiindia.com listings (hourly), Google rating and reviews via Places API when `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` are set (fallback 4.9 from 301), enquiry metrics from the E2O Apps Script when `E2O_METRICS_URL` / `E2O_METRICS_KEY` are set.
- `Scenes.tsx` holds one component per scene. `OrderExplainer.tsx` is the animated order flow (shared-layout order card moving node to node). `ConnectorScene.tsx` is the reference site's 3D BNC model without its drei `<Html>` labels, which crashed on unmount.

## Security model

- Browser bundle holds only the Supabase URL and publishable key. No service-role key is used anywhere.
- RLS: public can read `status = 'published'` rows only; only users listed in `admin_users` can write content or read/delete enquiries; the public can insert enquiries (column CHECK constraints bound size).
- Admin pages and every server action call `requireAdmin()` (verifies the JWT with Supabase and the allow-list).
- `/admin` and `/api` are disallowed in `robots.txt`, and admin pages are `noindex`.
- Enquiries: zod validation, honeypot field, in-memory rate limit (5 per 10 minutes per IP). The limiter is per server instance; move to a shared store if abuse appears.
