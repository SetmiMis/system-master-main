-- Company systems shown on /systems and in the film. Managed from /admin. Additive only.
create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text not null check (char_length(description) <= 300),
  url text not null check (url ~ '^https://'),
  grp text not null default 'Other' check (char_length(grp) <= 60),
  icon text not null default 'records' check (icon in ('records', 'truck', 'success', 'quality', 'support', 'shield', 'handshake')),
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);
create index if not exists systems_status_sort_idx on public.systems (status, sort);

drop trigger if exists touch_systems on public.systems;
create trigger touch_systems before update on public.systems for each row execute function public.touch_updated_at();

alter table public.systems enable row level security;
drop policy if exists "public reads published" on public.systems;
create policy "public reads published" on public.systems for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "admin writes" on public.systems;
create policy "admin writes" on public.systems for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- The five public systems from the company reference site.
insert into public.systems (name, description, url, grp, icon, sort, status)
select * from (values
  ('Sales FMS', 'Sales orders and client billing.', 'https://sales-fms.vercel.app', 'Sales & Orders', 'records', 0, 'published'),
  ('Purchase FMS', 'Purchase orders and vendor management.', 'https://setmi-purchase-fms.vercel.app', 'Purchase & Production', 'truck', 1, 'published'),
  ('Work Checklist', 'Daily task and checklist tracking.', 'https://work-checklist-xi.vercel.app', 'People & Tasks', 'success', 2, 'published'),
  ('Budget vs Actual', 'Monthly budget tracking against actual spend.', 'https://budget-vs-actual-three.vercel.app', 'Finance & Reporting', 'quality', 3, 'published'),
  ('MIS Control Center', 'Cross-system reporting and MIS dashboards.', 'https://mis-control-center.vercel.app', 'Finance & Reporting', 'support', 4, 'published')
) v(name, description, url, grp, icon, sort, status)
where not exists (select 1 from public.systems);
