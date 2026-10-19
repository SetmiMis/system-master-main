# SETMI INDIA: Beyond Connections

An interactive introduction to SETMI INDIA (connectors, cables and AV accessories, Delhi, since 1983). It is a real website, not a video: the opening scene is optional, every section works without media, autoplay or animation, and visitors can go straight to a product category or send an enquiry.

Live reference site: <https://setmiindia.com/> (source of all company facts and product images).

## Run locally (Windows)

```bash
npm install
cp .env.example .env.local     # then fill in the Supabase URL and publishable key
npm run dev                    # http://localhost:3000
```

Without `.env.local` the site still works: it falls back to the content in `/content`, and the enquiry form shows a "use WhatsApp, phone or email" message.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (strict) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright, desktop and mobile; builds and serves on port 3100) |
| `npm run seed:sql` | Regenerate `supabase/seed.sql` from `/content` |

First e2e run: `npx playwright install chromium`.

## What is in it

- `/` : a short auto-playing film (9 scenes, about 90 seconds) instead of a long scroll page. Visitors can pause, step, jump on the timeline, use arrow keys or swipe; captions run from one WebVTT track. Scenes: welcome, who we are, what we supply, a 3D BNC connector, where it is used, how an order moves (animated system explainer), expos, why SETMI, and a closing call to action.
- `/products`, `/products/[slug]` : category pages linking to setmiindia.com.
- `/expo` : expo photo gallery with lightbox. `/faq` : questions and answers. `/enquiry` : enquiry and quotation form.
- `/api/enquiry` : validated, rate-limited enquiry endpoint (stores to Supabase).
- `/admin` : sign-in protected editor for the film caption track and opening video, categories, FAQs, and the enquiry inbox.

Look and feel follow the company reference site (system-master-mu.vercel.app): same colour tokens, Inter + IBM Plex Mono, white grid sections and navy/teal dark sections.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Content guide](docs/CONTENT-GUIDE.md) : edit text, FAQs, products, captions, video
- [Media production checklist](docs/MEDIA-PRODUCTION-CHECKLIST.md) : footage and approvals still needed
- [Deployment](docs/DEPLOYMENT.md)
- [Maintenance and backups](docs/MAINTENANCE.md)
- [Supabase schema and migrations](supabase/README.md)

## Git workflow

Work happens on feature branches and is pushed to `SetmiMis/system-master-main`. Do not commit `.env.local`. Never push directly to `main` without review.
