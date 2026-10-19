# Content guide

## Two places content lives

1. **Supabase** (edit in `/admin`): opening-scene video, poster and captions, product categories, FAQs. Changes appear within 5 minutes. Drafts are invisible to the public.
2. **`/content` files** (needs a code change and deploy): site contact details, the "who we are", "where it is used", "how we work" and "why" copy, and the fallback copies of everything above.

## Becoming an admin

1. Supabase dashboard, Authentication, Users: add a user with email and password.
2. SQL editor: `insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com';`
3. Sign in at `/admin`.

## The home film: captions, timing and video

- Scene order, length (seconds) and narration: `content/film.ts` (code change and deploy).
- Caption track without a deploy: `/admin`, Opening scene, Captions (WebVTT). Times are on the whole film timeline (scene 2 starts at 8 s, and so on). Run `npm run seed:sql` to see the default track.
- Opening video: upload an MP4 (H.264, 1080p, under about 15 MB) to an HTTPS host, paste the URL in `/admin`, publish. It plays muted behind the first scene; the Sound button then works.

WebVTT format:
```
WEBVTT

00:00.500 --> 00:04.500
First caption line.
```

## Systems (no deploy needed)

`/admin`, Systems: add a system (name, https link, short description, group, icon, order), set it to published, save. It appears on `/systems` and in the film within 5 minutes. Draft systems stay hidden.

## Customer map

The map is built from the Pincode column of the CUSTOMER_MASTER sheet. Export that column to a text file, then run:
`node scripts/build-customer-map.ts pincodes.txt "C:/Users/SETMI INDIA/appscript/PincodeGeo.js"`
It writes `content/customer-map.json` with counts per ~50 km cell only (no names, addresses or individual pincodes). Commit that file. Do not commit the pincode export.

## Hindi captions

Each caption in `content/film.ts` has `en` and `hi`. The Hindi track is read by the browser's Hindi voice when the visitor picks हिं.

## Registrations

`content/trust.ts` lists GSTIN, IEC and Udyam numbers with links to the official verification portals. The certificate PDFs are not published: they contain PAN, bank account, turnover and personal contact details.

## Company figures, certificate, marketplaces, systems

`content/trust.ts` (code change and deploy): company figures (orders, customers, staff, years), ISO certificate details and files (`public/certificates/`), marketplace links, and the fallback systems list (used only if the database is unavailable). These were copied from the company reference site at the owner's request on 2026-10-19; keep them in step with it.

## Change product information

`/admin`, Product categories. One item per line for Range, Used for and Examples. **Only enter facts that are on setmiindia.com or approved by the company.** Set status to draft to hide a category. Images: put a file in `public/products/` and enter `/products/name.png`, or paste an HTTPS URL (then add its host to `images.remotePatterns` in `next.config.ts`).

Source URLs must stay on `https://setmiindia.com/` (enforced by the database).

## FAQs

`/admin`, FAQs: edit, reorder with the Order number, delete, or add (bottom card). New FAQs start as draft; set published.

## Claims that need company approval

The owner approved on 2026-10-19: the how-we-work steps, the opening tagline, and the use of "serving since 1983". Not used anywhere on the site: certifications, customer names or counts, "leading importer" wording, delivery promises, prices, star ratings. Add these only with written approval.
