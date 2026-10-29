-- Team & access management.
--
-- Builds on 20261028000400_admin_roles.sql (apply that first). Additive and
-- safe to re-run: no rows are deleted, every existing admin_users row keeps its
-- role and becomes 'active', and the existing owner keeps full access.
--
-- What this adds:
--   * admin_users.status (active / suspended) so access can be revoked without
--     deleting the row. Suspended users fail every RLS check immediately.
--   * display_name, invitation and status-change metadata.
--   * admin_audit_log, written by a trigger for every team change, whatever
--     path made it (Team screen, SQL editor, service role).
--   * A trigger that keeps at least one active owner (Super Admin), so nobody
--     can lock the studio out of its own admin.
--   * Team writes only through owner-checked SECURITY DEFINER functions. Direct
--     INSERT/UPDATE/DELETE on admin_users is revoked from API users.
--   * Site settings (global settings, navigation, footer) restricted to owner
--     and admin. Inquiry changes restricted to owner and admin.
--   * list_admin_team(): owner-only team listing with Supabase Auth sign-in and
--     invitation state, so the website never needs to read auth.users itself.

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_users'
      and column_name = 'role'
  ) then
    raise exception 'Apply 20261028000400_admin_roles.sql before this migration.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

do $$
begin
  create type public.admin_access_status as enum ('active', 'suspended');
exception
  when duplicate_object then null;
end $$;

alter table public.admin_users
  add column if not exists status public.admin_access_status not null default 'active',
  add column if not exists display_name text,
  add column if not exists invited_by uuid references auth.users (id) on delete set null,
  add column if not exists invited_at timestamptz,
  add column if not exists status_changed_at timestamptz,
  add column if not exists status_changed_by uuid references auth.users (id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  alter table public.admin_users
    add constraint admin_users_display_name_length check (
      display_name is null or char_length(btrim(display_name)) between 1 and 120
    );
exception
  when duplicate_object then null;
end $$;

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

create index if not exists admin_users_role_status_idx
  on public.admin_users (role, status);

-- ---------------------------------------------------------------------------
-- Role helpers: only active members count
-- ---------------------------------------------------------------------------

create or replace function public.current_admin_role()
returns public.admin_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.admin_users
  where user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

revoke all on function public.current_admin_role() from public;
grant execute on function public.current_admin_role() to authenticated;

-- Return a strict boolean for non-members and suspended members instead of
-- NULL, so callers in application code never have to treat NULL as "no".
create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_admin_role() in ('owner', 'admin', 'editor'), false);
$$;

revoke all on function public.can_manage_content() from public;
grant execute on function public.can_manage_content() to authenticated;

create or replace function public.can_manage_users()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_admin_role() = 'owner', false);
$$;

revoke all on function public.can_manage_users() from public;
grant execute on function public.can_manage_users() to authenticated;

create or replace function public.can_manage_retention()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_admin_role() in ('owner', 'admin'), false);
$$;

revoke all on function public.can_manage_retention() from public;
grant execute on function public.can_manage_retention() to authenticated;

-- Global site settings are owner/admin. Editors manage page content only.
create or replace function public.can_manage_settings()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_admin_role() in ('owner', 'admin'), false);
$$;

revoke all on function public.can_manage_settings() from public;
grant execute on function public.can_manage_settings() to authenticated;

-- Inquiries hold client contact details: only owner/admin can change them.
-- Every active team member can still read them.
create or replace function public.can_manage_inquiries()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_admin_role() in ('owner', 'admin'), false);
$$;

revoke all on function public.can_manage_inquiries() from public;
grant execute on function public.can_manage_inquiries() to authenticated;

do $$
declare
  tbl text;
  policy_name text;
begin
  foreach tbl in array array['global_settings', 'nav_items', 'footer_links', 'footer_social']
  loop
    if to_regclass('public.' || tbl) is null then
      continue;
    end if;

    policy_name := 'Admins can manage ' || tbl;
    execute format('drop policy if exists %I on public.%I', policy_name, tbl);
    execute format(
      'create policy %I on public.%I for all to authenticated ' ||
      'using (public.can_manage_settings()) ' ||
      'with check (public.can_manage_settings())',
      policy_name,
      tbl
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- admin_users access: owners read everything, writes go through functions
-- ---------------------------------------------------------------------------

drop policy if exists "Owners can manage admin users" on public.admin_users;
drop policy if exists "Owners can read the team" on public.admin_users;
create policy "Owners can read the team"
  on public.admin_users
  for select
  to authenticated
  using (public.can_manage_users());

-- The self-read policy from the initial schema stays, so a suspended user can
-- still see why they were denied.
revoke insert, update, delete on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

-- ---------------------------------------------------------------------------
-- Keep at least one active owner
-- ---------------------------------------------------------------------------

create or replace function public.protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_remaining integer;
begin
  if old.role = 'owner'
     and old.status = 'active'
     and (
       tg_op = 'DELETE'
       or new.role <> 'owner'
       or new.status <> 'active'
     ) then
    -- Serialize concurrent owner changes so two owners cannot demote each
    -- other at the same moment.
    perform pg_advisory_xact_lock(hashtext('public.admin_users.owner_guard'));

    select count(*)
    into v_remaining
    from public.admin_users
    where role = 'owner'
      and status = 'active'
      and user_id <> old.user_id;

    if v_remaining = 0 then
      raise exception 'At least one active Super Admin must remain.' using errcode = 'DT409';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function public.protect_last_owner() from public;

drop trigger if exists admin_users_protect_last_owner on public.admin_users;
create trigger admin_users_protect_last_owner
  before update or delete on public.admin_users
  for each row execute function public.protect_last_owner();

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  actor_email text,
  action text not null,
  -- No foreign key: history must survive the auth user being deleted.
  target_user_id uuid,
  target_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_audit_log_details_object check (jsonb_typeof(details) = 'object')
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log (target_user_id, created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Owners can read the audit log" on public.admin_audit_log;
create policy "Owners can read the audit log"
  on public.admin_audit_log
  for select
  to authenticated
  using (public.can_manage_users());

revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;

create or replace function public.log_admin_user_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text;
  v_action text;
  v_details jsonb := '{}'::jsonb;
  v_row public.admin_users;
begin
  if v_actor is not null then
    select email into v_actor_email from auth.users where id = v_actor;
  end if;

  if tg_op = 'INSERT' then
    v_row := new;
    v_action := 'member.added';
    v_details := jsonb_build_object('role', new.role, 'status', new.status);
  elsif tg_op = 'DELETE' then
    v_row := old;
    v_action := 'member.removed';
    v_details := jsonb_build_object('role', old.role, 'status', old.status);
  else
    v_row := new;
    if new.role is distinct from old.role then
      v_action := 'role.changed';
      v_details := jsonb_build_object('from', old.role, 'to', new.role);
    elsif new.status is distinct from old.status then
      v_action := case when new.status = 'active' then 'access.restored' else 'access.suspended' end;
      v_details := jsonb_build_object('from', old.status, 'to', new.status);
    elsif new.invited_at is distinct from old.invited_at then
      v_action := 'invite.sent';
    elsif new.display_name is distinct from old.display_name then
      v_action := 'profile.updated';
      v_details := jsonb_build_object('display_name', new.display_name);
    else
      return new;
    end if;
  end if;

  insert into public.admin_audit_log (
    actor_user_id,
    actor_email,
    action,
    target_user_id,
    target_email,
    details
  )
  values (
    v_actor,
    v_actor_email,
    v_action,
    v_row.user_id,
    v_row.email,
    v_details
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function public.log_admin_user_change() from public;

drop trigger if exists admin_users_audit on public.admin_users;
create trigger admin_users_audit
  after insert or update or delete on public.admin_users
  for each row execute function public.log_admin_user_change();

-- ---------------------------------------------------------------------------
-- Team functions (owner-only unless stated)
-- ---------------------------------------------------------------------------

-- Replace the two-argument version so PostgREST has a single match.
drop function if exists public.add_admin_user(text, public.admin_role);

create or replace function public.add_admin_user(
  p_email text,
  p_role public.admin_role,
  p_display_name text default null,
  p_invited boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
  v_name text := nullif(btrim(coalesce(p_display_name, '')), '');
  v_user_id uuid;
  v_existing public.admin_users;
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: Super Admin access required.' using errcode = 'DT403';
  end if;

  if v_email = '' then
    raise exception 'Enter the email address of the user.' using errcode = 'DT422';
  end if;

  select id
  into v_user_id
  from auth.users
  where lower(email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'No Supabase Auth user found for that email. Send an invitation instead.' using errcode = 'DT404';
  end if;

  select *
  into v_existing
  from public.admin_users
  where user_id = v_user_id;

  if found then
    if v_existing.status = 'suspended' then
      raise exception 'That user is already on the team but suspended. Restore their access from the team list.' using errcode = 'DT409';
    end if;
    raise exception 'That user is already on the team. Change their role in the team list.' using errcode = 'DT409';
  end if;

  insert into public.admin_users (
    user_id,
    email,
    role,
    display_name,
    invited_by,
    invited_at
  )
  values (
    v_user_id,
    v_email,
    p_role,
    v_name,
    auth.uid(),
    case when p_invited then now() else null end
  );

  return v_user_id;
end;
$$;

revoke all on function public.add_admin_user(text, public.admin_role, text, boolean) from public;
grant execute on function public.add_admin_user(text, public.admin_role, text, boolean) to authenticated;

create or replace function public.set_admin_role(
  p_user_id uuid,
  p_role public.admin_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: Super Admin access required.' using errcode = 'DT403';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own role. Ask another Super Admin.' using errcode = 'DT422';
  end if;

  update public.admin_users
  set role = p_role
  where user_id = p_user_id;

  if not found then
    raise exception 'Team member not found.' using errcode = 'DT404';
  end if;
end;
$$;

revoke all on function public.set_admin_role(uuid, public.admin_role) from public;
grant execute on function public.set_admin_role(uuid, public.admin_role) to authenticated;

create or replace function public.set_admin_status(
  p_user_id uuid,
  p_status public.admin_access_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: Super Admin access required.' using errcode = 'DT403';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot suspend your own access.' using errcode = 'DT422';
  end if;

  update public.admin_users
  set status = p_status,
      status_changed_at = now(),
      status_changed_by = auth.uid()
  where user_id = p_user_id
    and status is distinct from p_status;

  if not found and not exists (
    select 1 from public.admin_users where user_id = p_user_id
  ) then
    raise exception 'Team member not found.' using errcode = 'DT404';
  end if;
end;
$$;

revoke all on function public.set_admin_status(uuid, public.admin_access_status) from public;
grant execute on function public.set_admin_status(uuid, public.admin_access_status) to authenticated;

create or replace function public.remove_admin_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: Super Admin access required.' using errcode = 'DT403';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot remove your own admin access.' using errcode = 'DT422';
  end if;

  -- Only the allowlist row is removed. The auth user and any content they
  -- created stay intact, and the audit trigger records the removal.
  delete from public.admin_users where user_id = p_user_id;

  if not found then
    raise exception 'Team member not found.' using errcode = 'DT404';
  end if;
end;
$$;

revoke all on function public.remove_admin_user(uuid) from public;
grant execute on function public.remove_admin_user(uuid) to authenticated;

-- Owners can rename anyone. Active members can rename themselves. Nothing else
-- on the row can be changed through this function.
create or replace function public.update_admin_profile(
  p_user_id uuid,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := nullif(btrim(coalesce(p_display_name, '')), '');
begin
  if not (
    public.can_manage_users()
    or (p_user_id = auth.uid() and public.current_admin_role() is not null)
  ) then
    raise exception 'Forbidden: you can only edit your own profile.' using errcode = 'DT403';
  end if;

  update public.admin_users
  set display_name = v_name
  where user_id = p_user_id;

  if not found then
    raise exception 'Team member not found.' using errcode = 'DT404';
  end if;
end;
$$;

revoke all on function public.update_admin_profile(uuid, text) from public;
grant execute on function public.update_admin_profile(uuid, text) to authenticated;

-- Called after the server re-sends an invitation email.
create or replace function public.record_admin_invite(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: Super Admin access required.' using errcode = 'DT403';
  end if;

  update public.admin_users
  set invited_at = now(),
      invited_by = auth.uid()
  where user_id = p_user_id;

  if not found then
    raise exception 'Team member not found.' using errcode = 'DT404';
  end if;
end;
$$;

revoke all on function public.record_admin_invite(uuid) from public;
grant execute on function public.record_admin_invite(uuid) to authenticated;

create or replace function public.list_admin_team()
returns table (
  user_id uuid,
  email text,
  display_name text,
  role public.admin_role,
  status public.admin_access_status,
  created_at timestamptz,
  invited_at timestamptz,
  invited_by_email text,
  status_changed_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  auth_invited_at timestamptz,
  has_auth_user boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: Super Admin access required.' using errcode = 'DT403';
  end if;

  return query
  select
    a.user_id,
    -- Supabase Auth is the source of truth if the user changed their email.
    coalesce(u.email::text, a.email),
    a.display_name,
    a.role,
    a.status,
    a.created_at,
    a.invited_at,
    inviter.email::text,
    a.status_changed_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    u.invited_at,
    u.id is not null
  from public.admin_users a
  left join auth.users u on u.id = a.user_id
  left join auth.users inviter on inviter.id = a.invited_by
  order by a.created_at asc, a.user_id asc;
end;
$$;

revoke all on function public.list_admin_team() from public;
grant execute on function public.list_admin_team() to authenticated;

comment on column public.admin_users.status is 'active members pass RLS checks; suspended members keep their row but lose all admin access.';
comment on table public.admin_audit_log is 'Append-only record of team and access changes, written by the admin_users_audit trigger.';
comment on function public.set_admin_status(uuid, public.admin_access_status) is 'Super Admin only: suspend or restore a team member without deleting their row.';
comment on function public.list_admin_team() is 'Super Admin only: team list with Supabase Auth sign-in and invitation state.';
