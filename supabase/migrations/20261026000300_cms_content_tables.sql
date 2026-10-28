-- Drawtiq CMS content tables
--
-- Additive migration. Creates new tables for CMS-managed content that is not
-- already covered by the existing projects, services, blog_posts, and inquiries
-- tables. No existing tables are altered, dropped, or truncated.
--
-- Security model (consistent with existing migrations):
--   * anon / authenticated can read visible/published content.
--   * only users listed in public.admin_users can manage content.
--   * RLS is the final authority, not the UI.

-- ---------------------------------------------------------------------------
-- Global settings (singleton)
-- ---------------------------------------------------------------------------

create table if not exists public.global_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Drawtiq',
  site_tagline text,
  logo_path text,
  footer_logo_path text,
  contact_email text,
  careers_email text,
  footer_tagline text,
  footer_bottom_text text,
  copyright_holder text,
  social_links jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint global_settings_email_format check (
    contact_email is null or contact_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint global_settings_careers_email_format check (
    careers_email is null or careers_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint global_settings_social_array check (jsonb_typeof(social_links) = 'array')
);

-- ---------------------------------------------------------------------------
-- Navigation items
-- ---------------------------------------------------------------------------

create table if not exists public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  is_external boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nav_items_label_length check (char_length(btrim(label)) between 1 and 120),
  constraint nav_items_href_length check (char_length(btrim(href)) between 1 and 500)
);

-- ---------------------------------------------------------------------------
-- Footer links
-- ---------------------------------------------------------------------------

create table if not exists public.footer_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Footer social / contact links
-- ---------------------------------------------------------------------------

create table if not exists public.footer_social (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Homepage sections (flexible page composition)
-- ---------------------------------------------------------------------------

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  section_type text not null default 'content',
  title text,
  subtitle text,
  content jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_sections_section_key_format check (
    section_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint homepage_sections_content_object check (jsonb_typeof(content) = 'object')
);

-- ---------------------------------------------------------------------------
-- Testimonials (carousel)
-- ---------------------------------------------------------------------------

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  emphasis text,
  number text,
  label text,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_quote_length check (char_length(btrim(quote)) between 1 and 2000)
);

-- ---------------------------------------------------------------------------
-- Team members (about page)
-- ---------------------------------------------------------------------------

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  discipline text,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_members_role_length check (char_length(btrim(role)) between 1 and 120)
);

-- ---------------------------------------------------------------------------
-- About values
-- ---------------------------------------------------------------------------

create table if not exists public.about_values (
  id uuid primary key default gen_random_uuid(),
  index_label text not null,
  title text not null,
  body text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint about_values_index_label_length check (char_length(btrim(index_label)) between 1 and 80)
);

-- ---------------------------------------------------------------------------
-- About sections
-- ---------------------------------------------------------------------------

create table if not exists public.about_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  content jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint about_sections_section_key_format check (
    section_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint about_sections_content_object check (jsonb_typeof(content) = 'object')
);

-- ---------------------------------------------------------------------------
-- Careers roles
-- ---------------------------------------------------------------------------

create table if not exists public.careers_roles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meta text,
  body text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint careers_roles_title_length check (char_length(btrim(title)) between 1 and 200)
);

-- ---------------------------------------------------------------------------
-- Careers perks
-- ---------------------------------------------------------------------------

create table if not exists public.careers_perks (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null,
  body text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Careers process steps
-- ---------------------------------------------------------------------------

create table if not exists public.careers_process (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null,
  body text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Careers FAQs
-- ---------------------------------------------------------------------------

create table if not exists public.careers_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pricing plans
-- ---------------------------------------------------------------------------

create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  monthly_price integer not null default 0,
  quarterly_price integer not null default 0,
  cta_label text,
  is_featured boolean not null default false,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_plans_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint pricing_plans_prices_nonnegative check (monthly_price >= 0 and quarterly_price >= 0)
);

-- ---------------------------------------------------------------------------
-- Pricing plan features (child of pricing_plans)
-- ---------------------------------------------------------------------------

create table if not exists public.pricing_plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.pricing_plans (id) on delete cascade,
  feature_text text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pricing add-ons
-- ---------------------------------------------------------------------------

create table if not exists public.pricing_addons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price text not null,
  note text,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pricing FAQs
-- ---------------------------------------------------------------------------

create table if not exists public.pricing_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pricing included features
-- ---------------------------------------------------------------------------

create table if not exists public.pricing_included_features (
  id uuid primary key default gen_random_uuid(),
  feature_text text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pricing engagement models
-- ---------------------------------------------------------------------------

create table if not exists public.pricing_engagement_models (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null,
  body text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contact settings (singleton)
-- ---------------------------------------------------------------------------

create table if not exists public.contact_settings (
  id uuid primary key default gen_random_uuid(),
  hero_eyebrow text,
  hero_heading text,
  hero_lead text,
  copy_eyebrow text,
  copy_heading text,
  copy_paragraph text,
  email_label text,
  email_address text,
  form_heading text,
  form_subheading text,
  submit_label text,
  hint_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_settings_email_format check (
    email_address is null or email_address ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  )
);

-- ---------------------------------------------------------------------------
-- Contact form fields
-- ---------------------------------------------------------------------------

create table if not exists public.contact_form_fields (
  id uuid primary key default gen_random_uuid(),
  field_name text not null,
  field_label text not null,
  field_type text not null default 'text',
  is_required boolean not null default true,
  placeholder text,
  options jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_form_fields_type_check check (
    field_type in ('text', 'email', 'select', 'textarea', 'file')
  ),
  constraint contact_form_fields_options_array check (jsonb_typeof(options) = 'array')
);

-- ---------------------------------------------------------------------------
-- Updated-at triggers
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

create table if not exists public._cms_tables_needing_updated_at (
  table_name text primary key
);

insert into public._cms_tables_needing_updated_at (table_name) values
  ('global_settings'),
  ('nav_items'),
  ('footer_links'),
  ('footer_social'),
  ('homepage_sections'),
  ('testimonials'),
  ('team_members'),
  ('about_values'),
  ('about_sections'),
  ('careers_roles'),
  ('careers_perks'),
  ('careers_process'),
  ('careers_faqs'),
  ('pricing_plans'),
  ('pricing_addons'),
  ('pricing_faqs'),
  ('pricing_included_features'),
  ('pricing_engagement_models'),
  ('contact_settings'),
  ('contact_form_fields')
on conflict (table_name) do nothing;

do $$
declare
  rec record;
begin
  for rec in
    select table_name from public._cms_tables_needing_updated_at
  loop
    execute format(
      'drop trigger if exists %I_set_updated_at on public.%I; ' ||
      'create trigger %I_set_updated_at ' ||
      'before update on public.%I ' ||
      'for each row execute function public.set_updated_at();',
      rec.table_name, rec.table_name, rec.table_name, rec.table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.global_settings enable row level security;
alter table public.nav_items enable row level security;
alter table public.footer_links enable row level security;
alter table public.footer_social enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.testimonials enable row level security;
alter table public.team_members enable row level security;
alter table public.about_values enable row level security;
alter table public.about_sections enable row level security;
alter table public.careers_roles enable row level security;
alter table public.careers_perks enable row level security;
alter table public.careers_process enable row level security;
alter table public.careers_faqs enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.pricing_plan_features enable row level security;
alter table public.pricing_addons enable row level security;
alter table public.pricing_faqs enable row level security;
alter table public.pricing_included_features enable row level security;
alter table public.pricing_engagement_models enable row level security;
alter table public.contact_settings enable row level security;
alter table public.contact_form_fields enable row level security;

-- Public read:
--   * Collections with is_visible expose visible rows only.
--   * global_settings, contact_settings, and pricing_plan_features have no
--     is_visible column; their rows are public content.
-- Admin manage: full access via is_admin().

do $$
declare
  rec record;
  tbl text;
  policy_name text;
begin
  for rec in
    select table_name
    from public._cms_tables_needing_updated_at
    where table_name not in ('global_settings', 'contact_settings')
  loop
    tbl := rec.table_name;
    policy_name := 'Public can read visible ' || tbl;

    execute format(
      'drop policy if exists %I on public.%I; ' ||
      'create policy %I on public.%I ' ||
      'for select to anon, authenticated using (is_visible = true);',
      policy_name, tbl, policy_name, tbl
    );

    policy_name := 'Admins can manage ' || tbl;
    execute format(
      'drop policy if exists %I on public.%I; ' ||
      'create policy %I on public.%I ' ||
      'for all to authenticated ' ||
      'using (public.is_admin()) with check (public.is_admin());',
      policy_name, tbl, policy_name, tbl
    );
  end loop;
end $$;

do $$
declare
  rec record;
  tbl text;
  policy_name text;
begin
  for rec in
    select table_name
    from (values
      ('global_settings'),
      ('contact_settings'),
      ('pricing_plan_features')
    ) as settings_tables(table_name)
  loop
    tbl := rec.table_name;
    policy_name := 'Public can read ' || tbl;

    -- Also remove the older visibility policy name in case this migration was
    -- previously applied with an is_visible predicate on these tables.
    execute format(
      'drop policy if exists %I on public.%I; ' ||
      'drop policy if exists %I on public.%I; ' ||
      'create policy %I on public.%I ' ||
      'for select to anon, authenticated using (true);',
      'Public can read visible ' || tbl, tbl,
      policy_name, tbl,
      policy_name, tbl
    );

    policy_name := 'Admins can manage ' || tbl;
    execute format(
      'drop policy if exists %I on public.%I; ' ||
      'create policy %I on public.%I ' ||
      'for all to authenticated ' ||
      'using (public.is_admin()) with check (public.is_admin());',
      policy_name, tbl, policy_name, tbl
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- API privileges
-- ---------------------------------------------------------------------------

do $$
declare
  rec record;
  tbl text;
begin
  for rec in
    select table_name from public._cms_tables_needing_updated_at
    union
    select 'pricing_plan_features'
  loop
    tbl := rec.table_name;

    execute format('revoke all on public.%I from anon;', tbl);
    execute format(
      'grant select on public.%I to anon, authenticated; ',
      tbl
    );
    execute format(
      'grant insert, update, delete on public.%I to authenticated; ',
      tbl
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------------

create index if not exists nav_items_order_idx
  on public.nav_items (order_index);

create index if not exists homepage_sections_order_idx
  on public.homepage_sections (order_index);

create index if not exists testimonials_order_idx
  on public.testimonials (order_index);

create index if not exists team_members_order_idx
  on public.team_members (order_index);

create index if not exists about_values_order_idx
  on public.about_values (order_index);

create index if not exists careers_roles_order_idx
  on public.careers_roles (order_index);

create index if not exists careers_perks_order_idx
  on public.careers_perks (order_index);

create index if not exists careers_process_order_idx
  on public.careers_process (order_index);

create index if not exists careers_faqs_order_idx
  on public.careers_faqs (order_index);

create index if not exists pricing_plans_order_idx
  on public.pricing_plans (order_index);

create index if not exists pricing_plan_features_plan_idx
  on public.pricing_plan_features (plan_id);

create index if not exists pricing_addons_order_idx
  on public.pricing_addons (order_index);

create index if not exists pricing_faqs_order_idx
  on public.pricing_faqs (order_index);

create index if not exists pricing_included_features_order_idx
  on public.pricing_included_features (order_index);

create index if not exists pricing_engagement_models_order_idx
  on public.pricing_engagement_models (order_index);

create index if not exists contact_form_fields_order_idx
  on public.contact_form_fields (order_index);

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------

comment on table public.global_settings is 'Singleton site-wide settings (logo, email, SEO, footer).';
comment on table public.nav_items is 'Main navigation menu items.';
comment on table public.footer_links is 'Footer link columns.';
comment on table public.footer_social is 'Footer social/contact links.';
comment on table public.homepage_sections is 'Flexible homepage section records for CMS composition.';
comment on table public.testimonials is 'Testimonial / carousel items.';
comment on table public.team_members is 'About page team member profiles.';
comment on table public.about_values is 'About page belief/value cards.';
comment on table public.about_sections is 'About page section content.';
comment on table public.careers_roles is 'Job openings.';
comment on table public.careers_perks is 'Careers benefits / perks.';
comment on table public.careers_process is 'Hiring process steps.';
comment on table public.careers_faqs is 'Careers FAQs.';
comment on table public.pricing_plans is 'Pricing plans.';
comment on table public.pricing_plan_features is 'Features included in each pricing plan.';
comment on table public.pricing_addons is 'Pricing add-on services.';
comment on table public.pricing_faqs is 'Pricing FAQs.';
comment on table public.pricing_included_features is 'Features included in every plan.';
comment on table public.pricing_engagement_models is 'Ways to work / engagement models.';
comment on table public.contact_settings is 'Contact page configuration.';
comment on table public.contact_form_fields is 'Contact form field configuration.';
