# Maintenance

## Routine
- **Dependencies:** monthly `npm outdated`; update, then `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`.
- **Content:** edit in `/admin` (see CONTENT-GUIDE.md). Check that product names and categories still match setmiindia.com.
- **Enquiries:** read in `/admin`. Retention policy: delete enquiries older than 12 months. Run in the Supabase SQL editor:
  `delete from public.enquiries where created_at < now() - interval '12 months';`

## Backups
- Supabase dashboard, Database, Backups (plan dependent). Before any migration, take a manual export: `supabase db dump` or the dashboard's backup.
- Content is also in Git (`/content`, `supabase/seed.sql`), so the public site can always be rebuilt from the repository.

## Migrations
Add a new numbered file in `supabase/migrations/`, additive and idempotent. Apply it in the SQL editor or with `supabase db push`, and commit the file. Never edit an applied migration; add a new one.

## Troubleshooting
| Symptom | Likely cause |
| --- | --- |
| Site shows old content | Pages cache for 5 minutes; wait or redeploy |
| Enquiry says "not available right now" | Supabase env vars missing or wrong on the server |
| `/admin` says "not an administrator" | Add the user to `admin_users` (CONTENT-GUIDE.md) |
| Intro shows "Footage pending" | No published `intro` video URL, or the URL failed to load |
| Images missing | File not in `public/products/` or host not in `images.remotePatterns` |
| Supabase advisor warns about `is_admin()` | Expected: it only reports whether the caller is an admin and must be callable by RLS |
