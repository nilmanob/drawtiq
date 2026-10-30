-- Theme & colors.
--
-- Additive and safe to re-run. Adds five optional color columns to the
-- existing public.global_settings table instead of a new table. NULL means
-- "use the built-in default", so no existing row changes and the public site
-- looks exactly the same until a Super Admin or Admin saves new colors from
-- Admin → Site settings → Theme & colors.
--
-- Access is unchanged: the public can read global_settings, and only owner and
-- admin roles can write it (can_manage_settings(), from
-- 20261029000100_team_access.sql).

alter table public.global_settings
  add column if not exists theme_primary text,
  add column if not exists theme_background text,
  add column if not exists theme_text text,
  add column if not exists theme_white text,
  add column if not exists theme_black text;

-- Only lowercase #rrggbb is stored. The app normalizes input before saving,
-- and this keeps arbitrary text out of the CSS the site renders.
do $$
declare
  col text;
begin
  foreach col in array array[
    'theme_primary',
    'theme_background',
    'theme_text',
    'theme_white',
    'theme_black'
  ]
  loop
    begin
      execute format(
        'alter table public.global_settings add constraint %I check (%I is null or %I ~ %L)',
        'global_settings_' || col || '_hex',
        col,
        col,
        '^#[0-9a-f]{6}$'
      );
    exception
      when duplicate_object then null;
    end;
  end loop;
end $$;

comment on column public.global_settings.theme_primary is 'Theme primary/accent color (#rrggbb). NULL uses the default #c8ff43.';
comment on column public.global_settings.theme_background is 'Theme background color (#rrggbb). NULL uses the default #f5f3ed.';
comment on column public.global_settings.theme_text is 'Theme text color (#rrggbb). NULL uses the default #171916.';
comment on column public.global_settings.theme_white is 'Theme white/surface color (#rrggbb). NULL uses the default #fffef9.';
comment on column public.global_settings.theme_black is 'Theme black/dark-section color (#rrggbb). NULL uses the default #171916.';
