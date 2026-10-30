-- Theme & colors: button text color.
--
-- Additive and safe to re-run. NULL means "automatic": buttons keep their
-- original label colors, so nothing on the site changes until a Super Admin or
-- Admin picks a button text color in Admin → Site settings → Theme & colors.
-- Requires 20261030000100_theme_colors.sql.

alter table public.global_settings
  add column if not exists theme_button_text text;

do $$
begin
  alter table public.global_settings
    add constraint global_settings_theme_button_text_hex
    check (theme_button_text is null or theme_button_text ~ '^#[0-9a-f]{6}$');
exception
  when duplicate_object then null;
end $$;

comment on column public.global_settings.theme_button_text is 'Text color on primary-colored buttons (#rrggbb). NULL keeps the automatic original colors.';
