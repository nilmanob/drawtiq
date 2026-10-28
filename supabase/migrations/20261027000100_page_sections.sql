-- Generic, additive editorial sections for public pages not covered by a
-- specialised CMS collection. Existing content tables remain authoritative.
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  content jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_sections_page_key_format check (page_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint page_sections_section_key_format check (section_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint page_sections_content_object check (jsonb_typeof(content) = 'object'),
  constraint page_sections_page_section_key unique (page_key, section_key)
);

drop trigger if exists page_sections_set_updated_at on public.page_sections;
create trigger page_sections_set_updated_at before update on public.page_sections
  for each row execute function public.set_updated_at();

alter table public.page_sections enable row level security;

-- Keep the migration safely re-runnable. Postgres has no
-- CREATE POLICY IF NOT EXISTS, so drop the names first.
drop policy if exists "Public can read visible page sections" on public.page_sections;
drop policy if exists "Admins can manage page sections" on public.page_sections;

create policy "Public can read visible page sections" on public.page_sections
  for select to anon, authenticated using (is_visible = true);
create policy "Admins can manage page sections" on public.page_sections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.page_sections from anon;
grant select on public.page_sections to anon, authenticated;
grant insert, update, delete on public.page_sections to authenticated;
create index if not exists page_sections_page_order_idx on public.page_sections (page_key, order_index);
comment on table public.page_sections is 'Generic editable editorial sections and page SEO for public pages.';
