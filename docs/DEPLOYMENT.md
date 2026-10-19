# Deployment (Vercel)

Status: **not deployed from this repository yet.** Nothing here has been verified as live.

## Steps
1. In Vercel, import `SetmiMis/system-master-main` (or use the existing project if there is one: Project Settings, Git, connect this repo). Do not create a duplicate project for the same domain.
2. Environment variables (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (the public origin, for canonical URLs, sitemap and Open Graph)
3. Framework preset Next.js; build command `npm run build`.
4. In Supabase, Authentication, URL Configuration: add the Vercel URL to allowed redirect URLs.

## How changes flow
Vercel builds every push. The **production branch** (Project Settings, Git) deploys to the production URL; every other branch and pull request gets a preview URL. Check which branch is production before merging: merging into that branch publishes.

Recommended: push feature branches, open a pull request, test the preview URL, then merge.

## After the first deploy, verify
- `/`, `/products`, `/products/cables`, `/robots.txt`, `/sitemap.xml` return 200.
- Submit a test enquiry and confirm it appears in `/admin`, then delete the row.
- `/admin` redirects to the login page when signed out.
