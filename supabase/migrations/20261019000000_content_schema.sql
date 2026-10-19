-- SETMI INDIA experience: content tables, enquiries and admin allow-list.
-- Additive only: creates new tables, drops nothing. Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS).

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Admin check used by policies. SECURITY DEFINER so it can read admin_users despite RLS.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  summary text not null,
  family text[] not null default '{}',
  used_for text[] not null default '{}',
  examples text[] not null default '{}',
  source_url text not null check (source_url like 'https://setmiindia.com/%'),
  image_url text,
  focus text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenes (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  heading text not null default '',
  body text not null default '',
  video_url text,
  poster_url text,
  vtt text, -- WebVTT captions / transcript for this scene
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'enquiry' check (kind in ('enquiry', 'quote')),
  category text not null check (char_length(category) <= 60),
  name text not null check (char_length(name) between 2 and 100),
  contact text not null check (char_length(contact) between 5 and 120),
  message text not null check (char_length(message) between 5 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists categories_status_sort_idx on public.categories (status, sort);
create index if not exists faqs_status_sort_idx on public.faqs (status, sort);

do $$ declare t text; begin
  foreach t in array array['categories', 'faqs', 'scenes'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.faqs enable row level security;
alter table public.scenes enable row level security;
alter table public.enquiries enable row level security;

-- Public: published content only.
drop policy if exists "public reads published" on public.categories;
create policy "public reads published" on public.categories for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "public reads published" on public.faqs;
create policy "public reads published" on public.faqs for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "public reads published" on public.scenes;
create policy "public reads published" on public.scenes for select to anon, authenticated using (status = 'published' or public.is_admin());

-- Admins: full write on content.
drop policy if exists "admin writes" on public.categories;
create policy "admin writes" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin writes" on public.faqs;
create policy "admin writes" on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin writes" on public.scenes;
create policy "admin writes" on public.scenes for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Enquiries: anyone may insert (column checks above bound the data); only admins read or delete.
drop policy if exists "anyone inserts enquiry" on public.enquiries;
create policy "anyone inserts enquiry" on public.enquiries for insert to anon, authenticated with check (true);
drop policy if exists "admin reads enquiries" on public.enquiries;
create policy "admin reads enquiries" on public.enquiries for select to authenticated using (public.is_admin());
drop policy if exists "admin deletes enquiries" on public.enquiries;
create policy "admin deletes enquiries" on public.enquiries for delete to authenticated using (public.is_admin());

-- admin_users: an admin can see the list; nobody writes via the API (add rows in the SQL editor).
drop policy if exists "admins read admin list" on public.admin_users;
create policy "admins read admin list" on public.admin_users for select to authenticated using (public.is_admin());

-- Retention: delete enquiries older than 12 months (run from the SQL editor or a schedule):
--   delete from public.enquiries where created_at < now() - interval '12 months';
