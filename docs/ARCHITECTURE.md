# Architecture

## Stack and why

| Package | Why it is here |
| --- | --- |
| `next` 16 (App Router), `react` 19, TypeScript strict | Routing, server rendering, image optimisation, Vercel fit |
| `tailwindcss` 4 | Design tokens (`app/globals.css` `@theme`) and layout |
| `motion` (`motion/react`) | Reveals, crossfades, `MotionConfig reducedMotion="user"` strips transforms for users who prefer reduced motion |
| `lucide-react` | Interface icons |
| `@supabase/supabase-js`, `@supabase/ssr` | Public reads and enquiry inserts (anon key), cookie sessions for admin |
| `zod` | Server-side validation (enquiries, admin forms) |
| `vitest`, `@playwright/test` | Unit and browser tests |

Not installed, on purpose: GSAP (no scene needs timeline choreography; the diagram line-drawing is CSS) and Lenis (native scrolling keeps back/forward, anchors, keyboard and reduced motion correct).

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

## Intro player (`components/IntroPlayer.tsx`)

One timeline drives captions, scene markers, progress and the transcript.
- With a `video_url` on the `intro` scene, the `<video>` element is the clock (starts muted for autoplay policy; the Sound button unmutes).
- Without footage a virtual clock runs over catalogue stills and says "Footage pending". The Sound button is disabled with an explanation until a video exists. Nothing pretends to be final media.
- If the video errors, the player falls back to the stills automatically.
- Captions are WebVTT parsed from data (`lib/vtt.ts`), not hardcoded in a component.
- Modal behaviour: background `inert`, scroll lock, Escape closes, focus returns to the Start button.

## Security model

- Browser bundle holds only the Supabase URL and publishable key. No service-role key is used anywhere.
- RLS: public can read `status = 'published'` rows only; only users listed in `admin_users` can write content or read/delete enquiries; the public can insert enquiries (column CHECK constraints bound size).
- Admin pages and every server action call `requireAdmin()` (verifies the JWT with Supabase and the allow-list).
- `/admin` and `/api` are disallowed in `robots.txt`, and admin pages are `noindex`.
- Enquiries: zod validation, honeypot field, in-memory rate limit (5 per 10 minutes per IP). The limiter is per server instance; move to a shared store if abuse appears.
