-- ---------------------------------------------------------------------------
-- Inquiry rate limiting and the public submission path
--
-- Direct anon inserts into public.inquiries are replaced by a SECURITY DEFINER
-- function that validates rate limits and inserts in one transaction. Email and
-- IP keys are stored as hashes only, never as raw values.
-- ---------------------------------------------------------------------------

create table if not exists public.inquiry_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  constraint inquiry_rate_limits_count_nonnegative check (request_count >= 0)
);

alter table public.inquiry_rate_limits enable row level security;

revoke all on public.inquiry_rate_limits from public, anon, authenticated;

create index if not exists inquiry_rate_limits_window_idx
  on public.inquiry_rate_limits (window_started_at);

-- Internal helper. Not executable by anon/authenticated; submit_inquiry runs as
-- the function owner and calls it inside the same transaction.
create or replace function public.consume_inquiry_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_key is null or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.inquiry_rate_limits as limit_row (
    rate_key,
    window_started_at,
    request_count
  )
  values (p_key, now(), 1)
  on conflict (rate_key) do update
    set request_count = case
          when limit_row.window_started_at <=
            now() - make_interval(secs => p_window_seconds)
          then 1
          else limit_row.request_count + 1
        end,
        window_started_at = case
          when limit_row.window_started_at <=
            now() - make_interval(secs => p_window_seconds)
          then now()
          else limit_row.window_started_at
        end
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_inquiry_rate_limit(text, integer, integer)
  from public, anon, authenticated;

create or replace function public.submit_inquiry(
  p_name text,
  p_email text,
  p_service text,
  p_budget text,
  p_message text,
  p_ip_hash text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
  email_key text;
begin
  -- Keep the rate-limit table bounded. Only old windows are removed.
  delete from public.inquiry_rate_limits
  where window_started_at < now() - interval '1 day';

  email_key := md5(lower(btrim(coalesce(p_email, ''))));

  -- Five submissions per email address in 15 minutes.
  if not public.consume_inquiry_rate_limit('email:' || email_key, 5, 900) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  -- Fifteen submissions per IP hash in 10 minutes. The API only sends a
  -- SHA-256 hex digest; ignore malformed values rather than storing them.
  if p_ip_hash is not null and p_ip_hash ~ '^[a-f0-9]{64}$' then
    if not public.consume_inquiry_rate_limit('ip:' || p_ip_hash, 15, 600) then
      raise exception 'rate_limited' using errcode = 'P0001';
    end if;
  end if;

  insert into public.inquiries (
    name,
    email,
    service,
    budget,
    message,
    source,
    status
  )
  values (
    btrim(p_name),
    lower(btrim(p_email)),
    nullif(btrim(p_service), ''),
    nullif(btrim(p_budget), ''),
    btrim(p_message),
    'website',
    'new'
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_inquiry(text, text, text, text, text, text)
  from public;
grant execute on function public.submit_inquiry(text, text, text, text, text, text)
  to anon, authenticated;

-- Remove the old direct insert path. The function above is now the only public
-- write path into inquiries. Column-level grants must be revoked explicitly.
drop policy if exists "Anyone can submit an inquiry" on public.inquiries;

revoke insert (name, email, service, budget, message, source)
  on public.inquiries from anon, authenticated;
revoke insert on public.inquiries from anon, authenticated;

comment on function public.submit_inquiry(text, text, text, text, text, text)
  is 'Public inquiry insert with per-email and per-IP rate limiting.';
