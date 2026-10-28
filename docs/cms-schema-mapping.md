# Drawtiq CMS Schema Mapping

**Date:** 2026-10-26
**Phase:** 2 — CMS Architecture Design
**Target Supabase project:** `cpirkzcffqkzktdlboip`

---

## Design Principles

1. **Reuse existing tables** — `projects`, `services`, `blog_posts`, `inquiries`, `admin_users`, `inquiry_rate_limits` are already in place and have working CRUD + RLS. No duplicate tables for the same concept.
2. **Additive only** — All migrations are `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `ALTER TABLE ... ENABLE RLS`, `CREATE POLICY`, `GRANT`, `CREATE INDEX`. No `DROP TABLE`, `DELETE`, or `TRUNCATE`.
3. **Stable identifiers** — Every content table has `slug` (unique) or `id` (uuid PK) for idempotent upserts.
4. **Explicit ordering** — Every list-type table has `sort_order` or `order` integer.
5. **Draft/published states** — Content tables have `status` (draft/published/archived) where applicable, matching the existing `content_status` enum.
6. **Timestamps** — `created_at` and `updated_at` on every table.
7. **RLS on every table** — Public read for published content; admin-only for everything else. No weakening of existing security.
8. **JSONB for structured content** — Used where content is inherently nested (deliverables, FAQs, visual meta, section content). Not used as a substitute for proper relational tables where relationships/filtering are needed.
9. **No executable code or arbitrary HTML** — Content is structured data only.

---

## Schema Overview

### Existing Tables (Reused, No Changes)

| Table | Purpose | Already Has |
|-------|---------|-------------|
| `admin_users` | Admin allowlist | user_id, email, RLS |
| `projects` | Portfolio / case studies | slug, title, status, visual_key, gallery, featured, sort_order, SEO |
| `services` | Service offerings | slug, title, blurb, tags, deliverables, faqs, status, sort_order, SEO |
| `blog_posts` | Insights / blog | slug, title, excerpt, body, display, status, sort_order, SEO |
| `inquiries` | Contact form submissions | name, email, service, budget, message, status |
| `inquiry_rate_limits` | Rate limiting | rate_key, window, count |

### New CMS Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `global_settings` | Singleton site-wide settings | logo_path, contact_email, social_links (jsonb), seo defaults, copyright |
| `nav_items` | Main navigation menu | label, href, order, is_visible, is_external |
| `footer_links` | Footer link columns | label, href, order, is_visible |
| `footer_social` | Footer social/contact links | label, href, order, is_visible |
| `homepage_sections` | Homepage composition | section_key, section_type, content (jsonb), order, is_visible |
| `testimonials` | Testimonial carousel | quote, emphasis, number, label, order, is_visible |
| `team_members` | About team grid | role, discipline, order, is_visible |
| `about_values` | About values cards | index_label, title, body, order, is_visible |
| `about_sections` | About page sections | section_key, title, content (jsonb), order, is_visible |
| `careers_roles` | Job openings | title, meta, body, order, is_visible |
| `careers_perks` | Benefits | number, title, body, order, is_visible |
| `careers_process` | Hiring steps | number, title, body, order, is_visible |
| `careers_faqs` | Careers FAQs | question, answer, order, is_visible |
| `pricing_plans` | Pricing plans | name, tagline, monthly_price, quarterly_price, cta_label, is_featured, order, is_visible |
| `pricing_plan_features` | Plan features | plan_id (FK), feature_text, order |
| `pricing_addons` | Add-on services | title, price, note, order, is_visible |
| `pricing_faqs` | Pricing FAQs | question, answer, order, is_visible |
| `pricing_included_features` | Included features | feature_text, order, is_visible |
| `pricing_engagement_models` | Ways to work | number, title, body, order, is_visible |
| `contact_settings` | Contact page config | hero/eyebrow/heading/lead, email, form config, hint |
| `contact_form_fields` | Contact form config | field_name, label, type, required, options (jsonb), order, is_visible |

---

## Detailed Table Definitions

### global_settings (singleton)

```sql
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
  constraint global_settings_singleton check (id = gen_random_uuid() is not null),
  constraint global_settings_email_format check (
    contact_email is null or contact_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint global_settings_social_array check (jsonb_typeof(social_links) = 'array')
);
```

*Note: The singleton pattern uses application-level enforcement (only one row should exist). The `id` default ensures a new UUID per insert; the application is responsible for upserting by id or deleting before insert.*

### nav_items

```sql
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
```

### footer_links

```sql
create table if not exists public.footer_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### footer_social

```sql
create table if not exists public.footer_social (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### homepage_sections

```sql
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
```

### testimonials

```sql
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
```

### team_members

```sql
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
```

### about_values

```sql
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
```

### about_sections

```sql
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
```

### careers_roles

```sql
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
```

### careers_perks

```sql
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
```

### careers_process

```sql
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
```

### careers_faqs

```sql
create table if not exists public.careers_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### pricing_plans

```sql
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
```

### pricing_plan_features

```sql
create table if not exists public.pricing_plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.pricing_plans (id) on delete cascade,
  feature_text text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
```

### pricing_addons

```sql
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
```

### pricing_faqs

```sql
create table if not exists public.pricing_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### pricing_included_features

```sql
create table if not exists public.pricing_included_features (
  id uuid primary key default gen_random_uuid(),
  feature_text text not null,
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### pricing_engagement_models

```sql
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
```

### contact_settings

```sql
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
```

### contact_form_fields

```sql
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
```

---

## RLS Policies (consistent with existing schema)

For all new CMS tables:
- Enable RLS: `alter table public.<table> enable row level security;`
- Public read: `create policy "Published <table> are publicly readable" ... for select to anon, authenticated using (is_visible = true and (status is null or status = 'published'))`
- Admin manage: `create policy "Admins can manage <table>" ... for all to authenticated using (public.is_admin()) with check (public.is_admin())`
- Grants: `grant select on public.<table> to anon, authenticated; grant insert, update, delete on public.<table> to authenticated;`

For singleton tables (`global_settings`, `contact_settings`), the admin policy applies; public read is allowed.

---

## Field Mapping: Inventory → Database

| Inventory Item | DB Table | Column(s) |
|----------------|----------|-----------|
| Site title/tagline | `global_settings` | site_name, site_tagline |
| Logo paths | `global_settings` | logo_path, footer_logo_path |
| Contact/careers email | `global_settings` | contact_email, careers_email |
| Footer text/social | `global_settings`, `footer_social` | footer_tagline, footer_bottom_text, copyright_holder |
| Nav links | `nav_items` | label, href, order_index, is_visible |
| Footer links | `footer_links` | label, href, order_index, is_visible |
| Homepage sections | `homepage_sections` | section_key, section_type, title, subtitle, content, order_index, is_visible |
| Testimonials | `testimonials` | quote, emphasis, number, label, order_index, is_visible |
| Team members | `team_members` | role, discipline, order_index, is_visible |
| About values | `about_values` | index_label, title, body, order_index, is_visible |
| About sections | `about_sections` | section_key, title, content, order_index, is_visible |
| Careers roles | `careers_roles` | title, meta, body, order_index, is_visible |
| Careers perks | `careers_perks` | number, title, body, order_index, is_visible |
| Careers process | `careers_process` | number, title, body, order_index, is_visible |
| Careers FAQs | `careers_faqs` | question, answer, order_index, is_visible |
| Pricing plans | `pricing_plans` | name, tagline, monthly_price, quarterly_price, cta_label, is_featured, order_index, is_visible |
| Plan features | `pricing_plan_features` | plan_id, feature_text, order_index |
| Pricing addons | `pricing_addons` | title, price, note, order_index, is_visible |
| Pricing FAQs | `pricing_faqs` | question, answer, order_index, is_visible |
| Included features | `pricing_included_features` | feature_text, order_index, is_visible |
| Engagement models | `pricing_engagement_models` | number, title, body, order_index, is_visible |
| Contact settings | `contact_settings` | hero/copy/email/form fields |
| Contact form fields | `contact_form_fields` | field_name, label, type, required, options, order_index, is_visible |

---

## Frontend Integration Strategy

The existing `lib/content/data.ts` already uses an `auto` mode:
- If `PUBLIC_CONTENT_SOURCE=auto` (default), uses Supabase when published records exist, otherwise falls back to hardcoded content.
- If `PUBLIC_CONTENT_SOURCE=fallback`, always uses hardcoded.
- If `PUBLIC_CONTENT_SOURCE=database`, always uses Supabase.

New content fetchers will follow the same pattern, returning `ContentResult<T>` with `source: 'database' | 'fallback'` and an optional `error`.

Each page will be migrated one section at a time (Phase 5), with the original hardcoded content preserved as fallback until the database records are validated.

---

## Security Summary

- RLS enabled on all new tables
- Anon role: `SELECT` only on published/visible content
- Authenticated role: `SELECT` on all, `INSERT/UPDATE/DELETE` only when `is_admin()` returns true
- `is_admin()` security-definer function already exists and checks `public.admin_users`
- No service_role key in `.env.local` or browser code
- No executable code stored in database
