-- Contact email and copyright cleanup (content only, no schema changes).
--
-- Safe to re-run. Replaces the old studio addresses with contact@drawtiq.com
-- wherever the CMS stores them, and removes the "Made with care." that was
-- saved inside the copyright holder (the footer already adds it, which showed
-- the phrase twice). Only rows that contain the old values are touched.

-- Global settings (every row, including legacy duplicates, so none can bring
-- the old address back).
update public.global_settings
set contact_email = 'contact@drawtiq.com'
where contact_email in ('hello@drawtiq.studio', 'careers@drawtiq.studio');

update public.global_settings
set careers_email = 'contact@drawtiq.com'
where careers_email in ('hello@drawtiq.studio', 'careers@drawtiq.studio');

update public.global_settings
set copyright_holder = regexp_replace(copyright_holder, '\s*\.?\s*Made with care\.?\s*$', '', 'i')
where copyright_holder ~* 'Made with care\.?\s*$';

-- Footer social links: the mailto link and its visible label.
update public.footer_social
set href = replace(replace(href, 'hello@drawtiq.studio', 'contact@drawtiq.com'), 'careers@drawtiq.studio', 'contact@drawtiq.com'),
    label = replace(replace(label, 'hello@drawtiq.studio', 'contact@drawtiq.com'), 'careers@drawtiq.studio', 'contact@drawtiq.com')
where href ~ '@drawtiq\.studio' or label ~ '@drawtiq\.studio';

-- JSON content (contact settings, homepage contact section, careers copy).
-- Every text column and JSON value containing the old addresses is rewritten
-- through a text round-trip, which keeps the JSON structure intact.
do $$
declare
  rec record;
begin
  for rec in
    select c.table_name, c.column_name, c.data_type
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name in ('contact_settings', 'homepage_sections', 'page_sections', 'about_sections', 'careers_roles')
      and c.data_type in ('text', 'jsonb', 'character varying')
  loop
    if rec.data_type = 'jsonb' then
      execute format(
        'update public.%I set %I = replace(replace(%I::text, %L, %L), %L, %L)::jsonb where %I::text ~ %L',
        rec.table_name, rec.column_name, rec.column_name,
        'hello@drawtiq.studio', 'contact@drawtiq.com',
        'careers@drawtiq.studio', 'contact@drawtiq.com',
        rec.column_name, '@drawtiq\.studio'
      );
    else
      execute format(
        'update public.%I set %I = replace(replace(%I, %L, %L), %L, %L) where %I ~ %L',
        rec.table_name, rec.column_name, rec.column_name,
        'hello@drawtiq.studio', 'contact@drawtiq.com',
        'careers@drawtiq.studio', 'contact@drawtiq.com',
        rec.column_name, '@drawtiq\.studio'
      );
    end if;
  end loop;
end $$;
