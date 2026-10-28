-- Drawtiq CMS unique constraints
--
-- Adds UNIQUE constraints on business-key columns so the content migration
-- script can use ON CONFLICT upserts. Additive only — no tables dropped or
-- truncated. No existing data is modified.
--
-- Rerunnable: each constraint is added only if it does not already exist.
-- If existing data contains duplicates, the ALTER TABLE still fails rather
-- than deleting or merging content.

do $$
declare
  rec record;
begin
  for rec in
    select *
    from (values
      ('nav_items', 'nav_items_href_key', 'unique (href)'),
      ('footer_links', 'footer_links_href_key', 'unique (href)'),
      ('footer_social', 'footer_social_href_key', 'unique (href)'),
      ('testimonials', 'testimonials_number_key', 'unique (number)'),
      ('team_members', 'team_members_role_key', 'unique (role)'),
      ('about_values', 'about_values_index_label_key', 'unique (index_label)'),
      ('careers_roles', 'careers_roles_title_key', 'unique (title)'),
      ('careers_perks', 'careers_perks_number_key', 'unique (number)'),
      ('careers_process', 'careers_process_number_key', 'unique (number)'),
      ('careers_faqs', 'careers_faqs_question_key', 'unique (question)'),
      ('pricing_plans', 'pricing_plans_name_key', 'unique (name)'),
      ('pricing_plan_features', 'pricing_plan_features_plan_feature_key', 'unique (plan_id, feature_text)'),
      ('pricing_addons', 'pricing_addons_title_key', 'unique (title)'),
      ('pricing_faqs', 'pricing_faqs_question_key', 'unique (question)'),
      ('pricing_included_features', 'pricing_included_features_feature_text_key', 'unique (feature_text)'),
      ('pricing_engagement_models', 'pricing_engagement_models_number_key', 'unique (number)'),
      ('contact_form_fields', 'contact_form_fields_field_name_key', 'unique (field_name)')
    ) as constraints(table_name, constraint_name, definition)
  loop
    if not exists (
      select 1
      from pg_constraint
      where conname::text = rec.constraint_name
        and conrelid = format('public.%I', rec.table_name)::regclass
    ) then
      execute format(
        'alter table public.%I add constraint %I %s;',
        rec.table_name,
        rec.constraint_name,
        rec.definition
      );
    end if;
  end loop;
end $$;
