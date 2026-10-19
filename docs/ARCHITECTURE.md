# Architecture

## Stack and why

| Package | Why it is here |
| --- | --- |
| `next` 16 (App Router), `react` 19, TypeScript strict | Routing, server rendering, image optimisation, Vercel fit |
| `tailwindcss` 4 | Design tokens (`app/globals.css` `@theme`) and layout |
| `motion` (`motion/react`) | Reveals, crossfades, `MotionConfig reducedMotion="user"` strips transforms for users who prefer reduced motion |
| `lucide-react` | Interface icons |
| `three`, `@react-three/fiber`, `@react-three/drei` | The 3D BNC connector scene, reused from the company reference site; loaded only when that scene is reached |
| `@supabase/supabase-js`, `@supabase/ssr` | Public reads and enquiry inserts (anon key), cookie sessions for admin |
| `zod` | Server-side validation (enquiries, admin forms) |
| `vitest`, `@playwright/test` | Unit and browser tests |

Not installed, on purpose: GSAP (the film clock plus `motion` covers every timeline here), Lenis (the home page does not scroll), Lottie/Rive (no designed animation files exist yet; add when a motion designer supplies them), react-spring (duplicates `motion`).

## Layout

```
app/            routes: / , /products, /products/[slug], /admin, /api/enquiry, sitemap, robots
components/     Opening, IntroPlayer, Supply, SignalDiagram, EnquiryForm, Header, Footer, ProductVisual, Reveal
content/        typed fallback content: site, categories, faqs, story (copy), intro captions (WebVTT)
lib/            content.ts (data access), vtt.ts, enquiry.ts, supabase*.ts
supabase/       migrations/, seed.sql, README.md
tests/          unit/ (Vitest), e2e/ (Playwright)
docs/           this documentation
```

## Data flow

`lib/content.ts` reads published rows from Supabase with the anon key; if Supabase is not configured, errors or is empty it returns the local files in `/content`. Pages revalidate every 5 minutes, so admin edits appear within that window.

## Home film (`components/film/`)

`Film.tsx` owns one clock (seconds into the current scene). The clock drives the scene, its inner animation, the captions and the timeline, so pausing pauses everything. Scene list, durations and narration live in `content/film.ts`; `buildVtt()` turns the narration into one WebVTT track on the film timeline. The `intro` row of the `scenes` table can override that track and add an opening video (from `/admin`).
- Autoplay only when the tab is visible; reduced-motion visitors start paused.
- Controls: play/pause, previous/next, timeline segments, arrow keys, space, swipe, scene list, captions toggle. Sound is disabled with an explanation until a video exists.
- `Scenes.tsx` holds one component per scene. `OrderExplainer.tsx` is the animated order flow (shared-layout order card moving node to node). `ConnectorScene.tsx` is the reference site's 3D BNC model without its drei `<Html>` labels, which crashed on unmount.

## Security model

- Browser bundle holds only the Supabase URL and publishable key. No service-role key is used anywhere.
- RLS: public can read `status = 'published'` rows only; only users listed in `admin_users` can write content or read/delete enquiries; the public can insert enquiries (column CHECK constraints bound size).
- Admin pages and every server action call `requireAdmin()` (verifies the JWT with Supabase and the allow-list).
- `/admin` and `/api` are disallowed in `robots.txt`, and admin pages are `noindex`.
- Enquiries: zod validation, honeypot field, in-memory rate limit (5 per 10 minutes per IP). The limiter is per server instance; move to a shared store if abuse appears.
