-- Drawtiq first-party visitor analytics
--
-- Privacy model:
--   * visitor IDs are random UUIDs generated in the browser, not fingerprints.
--   * no IP addresses, names, emails, or cross-site identifiers are stored.
--   * public clients may only call the validated RPC below.
--   * only users in public.admin_users can read analytics rows.
--
-- Retention:
--   * call public.prune_analytics(180) from the SQL editor or an admin task to
--     remove sessions and page views older than the retention window.

create table if not exists public.analytics_sessions (
  id uuid primary key,
  visitor_id uuid not null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  entry_path text not null,
  exit_path text not null,
  pageview_count integer not null default 0,
  is_new_visitor boolean not null default false,
  referrer text,
  referrer_host text,
  source text not null default 'direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text not null default 'unknown',
  browser text not null default 'unknown',
  os text not null default 'unknown',
  country_code text,
  region text,
  city text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_sessions_entry_path_length check (
    char_length(entry_path) between 1 and 2048
  ),
  constraint analytics_sessions_exit_path_length check (
    char_length(exit_path) between 1 and 2048
  ),
  constraint analytics_sessions_pageview_count_nonnegative check (
    pageview_count >= 0
  ),
  constraint analytics_sessions_referrer_length check (
    referrer is null or char_length(referrer) <= 2048
  ),
  constraint analytics_sessions_referrer_host_length check (
    referrer_host is null or char_length(referrer_host) <= 255
  ),
  constraint analytics_sessions_source_length check (
    char_length(source) between 1 and 32
  ),
  constraint analytics_sessions_device_length check (
    char_length(device_type) between 1 and 32
  ),
  constraint analytics_sessions_browser_length check (
    char_length(browser) between 1 and 32
  ),
  constraint analytics_sessions_os_length check (
    char_length(os) between 1 and 32
  ),
  constraint analytics_sessions_country_length check (
    country_code is null or char_length(country_code) between 2 and 8
  ),
  constraint analytics_sessions_region_length check (
    region is null or char_length(region) <= 128
  ),
  constraint analytics_sessions_city_length check (
    city is null or char_length(city) <= 128
  ),
  constraint analytics_sessions_seen_order check (
    last_seen_at >= started_at
  )
);

create table if not exists public.analytics_pageviews (
  id uuid primary key,
  session_id uuid not null references public.analytics_sessions (id) on delete cascade,
  visitor_id uuid not null,
  path text not null,
  title text,
  referrer text,
  occurred_at timestamptz not null default now(),
  duration_ms integer not null default 0,
  created_at timestamptz not null default now(),
  constraint analytics_pageviews_path_length check (
    char_length(path) between 1 and 2048
  ),
  constraint analytics_pageviews_title_length check (
    title is null or char_length(title) <= 320
  ),
  constraint analytics_pageviews_referrer_length check (
    referrer is null or char_length(referrer) <= 2048
  ),
  constraint analytics_pageviews_duration_range check (
    duration_ms between 0 and 86400000
  )
);

create index if not exists analytics_sessions_started_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_visitor_idx
  on public.analytics_sessions (visitor_id, started_at desc);

create index if not exists analytics_sessions_source_idx
  on public.analytics_sessions (source, started_at desc);

create index if not exists analytics_sessions_last_seen_idx
  on public.analytics_sessions (last_seen_at desc);

create index if not exists analytics_pageviews_occurred_idx
  on public.analytics_pageviews (occurred_at desc);

create index if not exists analytics_pageviews_session_idx
  on public.analytics_pageviews (session_id, occurred_at desc);

create index if not exists analytics_pageviews_visitor_idx
  on public.analytics_pageviews (visitor_id, occurred_at desc);

create index if not exists analytics_pageviews_path_idx
  on public.analytics_pageviews (path, occurred_at desc);

drop trigger if exists analytics_sessions_set_updated_at
  on public.analytics_sessions;
create trigger analytics_sessions_set_updated_at
  before update on public.analytics_sessions
  for each row execute function public.set_updated_at();

alter table public.analytics_sessions enable row level security;
alter table public.analytics_pageviews enable row level security;

drop policy if exists "Admins can read analytics sessions"
  on public.analytics_sessions;
create policy "Admins can read analytics sessions"
  on public.analytics_sessions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read analytics pageviews"
  on public.analytics_pageviews;
create policy "Admins can read analytics pageviews"
  on public.analytics_pageviews
  for select
  to authenticated
  using (public.is_admin());

revoke all on public.analytics_sessions from anon, authenticated;
revoke all on public.analytics_pageviews from anon, authenticated;
grant select on public.analytics_sessions to authenticated;
grant select on public.analytics_pageviews to authenticated;

-- The public tracker writes only through this function. It validates every
-- value and derives the session's referral source from the request context.
create or replace function public.record_analytics_event(
  p_event_id uuid,
  p_event_type text,
  p_session_id uuid,
  p_visitor_id uuid,
  p_path text,
  p_title text default null,
  p_referrer text default null,
  p_duration_ms integer default 0,
  p_context jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context jsonb := case
    when p_context is null or jsonb_typeof(p_context) <> 'object' then '{}'::jsonb
    else p_context
  end;
  v_referrer text := nullif(btrim(coalesce(p_referrer, '')), '');
  v_referrer_host text := nullif(btrim(coalesce(v_context ->> 'referrer_host', '')), '');
  v_site_host text := nullif(btrim(coalesce(v_context ->> 'site_host', '')), '');
  v_source text := nullif(btrim(coalesce(v_context ->> 'source', '')), '');
  v_device_type text := nullif(btrim(coalesce(v_context ->> 'device_type', '')), '');
  v_browser text := nullif(btrim(coalesce(v_context ->> 'browser', '')), '');
  v_os text := nullif(btrim(coalesce(v_context ->> 'os', '')), '');
  v_country_code text := nullif(btrim(coalesce(v_context ->> 'country_code', '')), '');
  v_region text := nullif(btrim(coalesce(v_context ->> 'region', '')), '');
  v_city text := nullif(btrim(coalesce(v_context ->> 'city', '')), '');
  v_inserted integer := 0;
begin
  if p_event_id is null
    or p_session_id is null
    or p_visitor_id is null then
    raise exception 'A valid analytics event, session, and visitor id are required.';
  end if;

  if p_event_type not in ('pageview', 'pageview_end') then
    raise exception 'Unsupported analytics event type.';
  end if;

  if p_path is null
    or p_path !~ '^/'
    or char_length(p_path) > 2048 then
    raise exception 'A valid analytics path is required.';
  end if;

  if p_title is not null and char_length(p_title) > 320 then
    raise exception 'Analytics title is too long.';
  end if;

  if v_referrer is not null and char_length(v_referrer) > 2048 then
    raise exception 'Analytics referrer is too long.';
  end if;

  if p_duration_ms is null or p_duration_ms < 0 or p_duration_ms > 86400000 then
    raise exception 'Analytics duration is out of range.';
  end if;

  if v_referrer_host is not null then
    v_referrer_host := left(v_referrer_host, 255);
  end if;

  if v_source is null then
    if v_referrer_host is null then
      v_source := 'direct';
    elsif v_site_host is not null and v_referrer_host = v_site_host then
      v_source := 'internal';
    elsif v_referrer_host ~* '(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu)\.' then
      v_source := 'search';
    elsif v_referrer_host ~* '(^|\.)(facebook|instagram|linkedin|twitter|x|t|pinterest|youtube|tiktok|reddit)\.' then
      v_source := 'social';
    else
      v_source := 'referral';
    end if;
  end if;

  v_source := left(v_source, 32);
  v_device_type := left(coalesce(v_device_type, 'unknown'), 32);
  v_browser := left(coalesce(v_browser, 'unknown'), 32);
  v_os := left(coalesce(v_os, 'unknown'), 32);

  if v_country_code is not null then
    v_country_code := upper(left(v_country_code, 8));
    if v_country_code !~ '^[A-Z]{2,8}$' then
      v_country_code := null;
    end if;
  end if;

  if v_region is not null then
    v_region := left(v_region, 128);
  end if;

  if v_city is not null then
    v_city := left(v_city, 128);
  end if;

  if p_event_type = 'pageview' then
    -- A session may legitimately send several page views in quick succession,
    -- but a single visitor should not be able to flood the table.
    if (
      select count(*)
      from public.analytics_pageviews
      where visitor_id = p_visitor_id
        and occurred_at > now() - interval '10 seconds'
    ) > 60 then
      return;
    end if;

    insert into public.analytics_sessions (
      id,
      visitor_id,
      started_at,
      last_seen_at,
      entry_path,
      exit_path,
      is_new_visitor,
      referrer,
      referrer_host,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      device_type,
      browser,
      os,
      country_code,
      region,
      city,
      user_id
    )
    values (
      p_session_id,
      p_visitor_id,
      now(),
      now(),
      p_path,
      p_path,
      not exists (
        select 1
        from public.analytics_sessions
        where visitor_id = p_visitor_id
      ),
      v_referrer,
      v_referrer_host,
      v_source,
      nullif(left(btrim(coalesce(v_context ->> 'utm_source', '')), 128), ''),
      nullif(left(btrim(coalesce(v_context ->> 'utm_medium', '')), 128), ''),
      nullif(left(btrim(coalesce(v_context ->> 'utm_campaign', '')), 128), ''),
      v_device_type,
      v_browser,
      v_os,
      v_country_code,
      v_region,
      v_city,
      auth.uid()
    )
    on conflict (id) do update
    set
      last_seen_at = greatest(
        public.analytics_sessions.last_seen_at,
        excluded.last_seen_at
      ),
      exit_path = excluded.exit_path,
      referrer = coalesce(public.analytics_sessions.referrer, excluded.referrer),
      referrer_host = coalesce(
        public.analytics_sessions.referrer_host,
        excluded.referrer_host
      ),
      source = case
        when public.analytics_sessions.referrer is null then excluded.source
        else public.analytics_sessions.source
      end,
      utm_source = coalesce(
        public.analytics_sessions.utm_source,
        excluded.utm_source
      ),
      utm_medium = coalesce(
        public.analytics_sessions.utm_medium,
        excluded.utm_medium
      ),
      utm_campaign = coalesce(
        public.analytics_sessions.utm_campaign,
        excluded.utm_campaign
      ),
      device_type = case
        when public.analytics_sessions.device_type = 'unknown'
          then excluded.device_type
        else public.analytics_sessions.device_type
      end,
      browser = case
        when public.analytics_sessions.browser = 'unknown'
          then excluded.browser
        else public.analytics_sessions.browser
      end,
      os = case
        when public.analytics_sessions.os = 'unknown'
          then excluded.os
        else public.analytics_sessions.os
      end,
      country_code = coalesce(
        public.analytics_sessions.country_code,
        excluded.country_code
      ),
      region = coalesce(public.analytics_sessions.region, excluded.region),
      city = coalesce(public.analytics_sessions.city, excluded.city)
    where public.analytics_sessions.visitor_id = excluded.visitor_id;

    -- Ignore an id collision with a different visitor rather than attaching a
    -- page view to somebody else's session.
    if not exists (
      select 1
      from public.analytics_sessions
      where id = p_session_id
        and visitor_id = p_visitor_id
    ) then
      return;
    end if;

    insert into public.analytics_pageviews (
      id,
      session_id,
      visitor_id,
      path,
      title,
      referrer,
      occurred_at,
      duration_ms
    )
    values (
      p_event_id,
      p_session_id,
      p_visitor_id,
      p_path,
      nullif(left(btrim(coalesce(p_title, '')), 320), ''),
      v_referrer,
      now(),
      0
    )
    on conflict (id) do nothing;

    get diagnostics v_inserted = row_count;

    if v_inserted > 0 then
      update public.analytics_sessions
      set
        last_seen_at = now(),
        exit_path = p_path,
        pageview_count = pageview_count + 1
      where id = p_session_id
        and visitor_id = p_visitor_id;
    end if;
  else
    update public.analytics_pageviews
    set duration_ms = greatest(duration_ms, p_duration_ms)
    where id = p_event_id
      and session_id = p_session_id
      and visitor_id = p_visitor_id;

    -- The page-view insert already set exit_path. Do not let a late end event
    -- from an earlier page overwrite the session's current exit path.
    update public.analytics_sessions
    set last_seen_at = greatest(last_seen_at, now())
    where id = p_session_id
      and visitor_id = p_visitor_id;
  end if;
end;
$$;

revoke all on function public.record_analytics_event(
  uuid,
  text,
  uuid,
  uuid,
  text,
  text,
  text,
  integer,
  jsonb
) from public;
grant execute on function public.record_analytics_event(
  uuid,
  text,
  uuid,
  uuid,
  text,
  text,
  text,
  integer,
  jsonb
) to anon, authenticated;

-- An admin-only maintenance helper. The database does not run this
-- automatically; call it from an admin task or the SQL editor on a schedule.
create or replace function public.prune_analytics(p_days integer default 180)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sessions integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: admin access required.';
  end if;

  if p_days is null or p_days < 30 or p_days > 3650 then
    raise exception 'Retention must be between 30 and 3650 days.';
  end if;

  delete from public.analytics_pageviews
  where occurred_at < now() - make_interval(days => p_days);

  delete from public.analytics_sessions
  where last_seen_at < now() - make_interval(days => p_days);

  get diagnostics v_sessions = row_count;
  return v_sessions;
end;
$$;

revoke all on function public.prune_analytics(integer) from public;
grant execute on function public.prune_analytics(integer) to authenticated;
