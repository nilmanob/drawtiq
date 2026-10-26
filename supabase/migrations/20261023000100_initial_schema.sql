-- Drawtiq initial content schema
--
-- Security model:
--   * anon / authenticated can read published projects, services and posts.
--   * anon / authenticated can insert new inquiries, but cannot read them.
--   * only users listed in public.admin_users can manage content or read
--     inquiries. RLS is the final authority, not the UI.
--
-- The admin allowlist is managed manually after the auth user is created:
--
--   insert into public.admin_users (user_id, email)
--   select id, email from auth.users where email = 'the-admin@example.com';

create extension if not exists pgcrypto;

do $$
begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.inquiry_status as enum ('new', 'read', 'replied', 'archived');
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint admin_users_email_length check (
    char_length(btrim(email)) between 3 and 254
  )
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  category text,
  discipline text,
  industry text,
  scope text,
  summary text,
  challenge text,
  approach text,
  solution text,
  outcome text,
  visual_key text not null default 'custom',
  cover_image_path text,
  gallery jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint projects_gallery_array check (jsonb_typeof(gallery) = 'array'),
  constraint projects_sort_order_nonnegative check (sort_order >= 0)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  blurb text,
  intro text,
  icon text,
  preview_path text,
  tags text[] not null default '{}'::text[],
  deliverables jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint services_deliverables_array check (jsonb_typeof(deliverables) = 'array'),
  constraint services_faqs_array check (jsonb_typeof(faqs) = 'array'),
  constraint services_sort_order_nonnegative check (sort_order >= 0)
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  category text,
  read_time text,
  visual text,
  label text,
  display jsonb not null default '{}'::jsonb,
  body jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint blog_posts_display_object check (jsonb_typeof(display) = 'object'),
  constraint blog_posts_body_array check (jsonb_typeof(body) = 'array'),
  constraint blog_posts_sort_order_nonnegative check (sort_order >= 0)
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  service text,
  budget text,
  message text not null,
  source text not null default 'website',
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiries_name_length check (
    char_length(btrim(name)) between 1 and 120
  ),
  constraint inquiries_email_format check (
    char_length(email) <= 254
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint inquiries_service_length check (
    service is null or char_length(service) <= 120
  ),
  constraint inquiries_budget_length check (
    budget is null or char_length(budget) <= 80
  ),
  constraint inquiries_message_length check (
    char_length(btrim(message)) between 10 and 5000
  ),
  constraint inquiries_source_length check (
    char_length(source) between 1 and 80
  )
);

-- ---------------------------------------------------------------------------
-- Shared triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status <> 'published' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_published_at on public.projects;
create trigger projects_set_published_at
  before insert or update on public.projects
  for each row execute function public.set_published_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists services_set_published_at on public.services;
create trigger services_set_published_at
  before insert or update on public.services
  for each row execute function public.set_published_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_set_published_at on public.blog_posts;
create trigger blog_posts_set_published_at
  before insert or update on public.blog_posts
  for each row execute function public.set_published_at();

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin check
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.blog_posts enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Admins can read their own admin record" on public.admin_users;
create policy "Admins can read their own admin record"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Published projects are publicly readable" on public.projects;
create policy "Published projects are publicly readable"
  on public.projects
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
  on public.projects
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Published services are publicly readable" on public.services;
create policy "Published services are publicly readable"
  on public.services
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins can manage services" on public.services;
create policy "Admins can manage services"
  on public.services
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Published blog posts are publicly readable" on public.blog_posts;
create policy "Published blog posts are publicly readable"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins can manage blog posts" on public.blog_posts;
create policy "Admins can manage blog posts"
  on public.blog_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can submit an inquiry" on public.inquiries;
create policy "Anyone can submit an inquiry"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and char_length(btrim(name)) between 1 and 120
    and char_length(email) <= 254
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and (service is null or char_length(service) <= 120)
    and (budget is null or char_length(budget) <= 80)
    and char_length(btrim(message)) between 10 and 5000
    and char_length(source) between 1 and 80
  );

drop policy if exists "Admins can read inquiries" on public.inquiries;
create policy "Admins can read inquiries"
  on public.inquiries
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update inquiries" on public.inquiries;
create policy "Admins can update inquiries"
  on public.inquiries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries"
  on public.inquiries
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- API privileges (RLS still decides which rows are allowed)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant usage on type public.content_status, public.inquiry_status
  to anon, authenticated;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

revoke all on public.projects, public.services, public.blog_posts from anon, authenticated;
grant select on public.projects, public.services, public.blog_posts to anon, authenticated;
grant insert, update, delete on public.projects, public.services, public.blog_posts to authenticated;

revoke all on public.inquiries from anon, authenticated;
grant insert (name, email, service, budget, message, source)
  on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

-- ---------------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------------

create index if not exists projects_status_sort_idx
  on public.projects (status, sort_order);

create index if not exists services_status_sort_idx
  on public.services (status, sort_order);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);

create index if not exists inquiries_status_created_idx
  on public.inquiries (status, created_at desc);
