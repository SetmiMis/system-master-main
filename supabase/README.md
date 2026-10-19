# Supabase

Project: `aleguxaxeusmvspvgipg` (system-master-main, ap-northeast-2). It was empty (no tables, no migrations) when this work started.

## Applied on 2026-10-19
- `migrations/20261019000000_content_schema.sql`: tables `admin_users`, `categories`, `faqs`, `scenes`, `enquiries`; helper functions `is_admin()` and `touch_updated_at()`; RLS policies. Additive only.
- `seed.sql`: 8 categories, 8 FAQs, 1 `intro` scene (generated from `/content` by `npm run seed:sql`; idempotent).

## Tables
| Table | Public | Admin |
| --- | --- | --- |
| `categories`, `faqs`, `scenes` | read rows where `status = 'published'` | read all, write |
| `enquiries` | insert only | read, delete |
| `admin_users` | none | read (rows are added in the SQL editor) |

## Verified against the live project (anon key)
Reads return published rows only; a draft FAQ was invisible; inserting a category and updating a FAQ were refused; enquiries could not be read; an enquiry insert through `/api/enquiry` succeeded (test row then removed). Admin sign-in and admin writes have **not** been exercised: no admin user exists yet.

## Advisor notes
`is_admin()` is `SECURITY DEFINER` and callable by `anon` by design (RLS policies evaluate it as the caller). It returns only a boolean about the caller. `rls_auto_enable()` is not part of this repo's migration; it already existed in the project.

## Applied on 2026-10-19 (later)
- `migrations/20261019010000_systems.sql`: `systems` table (public reads published rows, admins write), seeded with the five public systems. Verified: anon read returns 5 rows; anon insert is refused by RLS.
- The film caption row (`scenes.intro.vtt`) was set to null so the built-in English track is used.
