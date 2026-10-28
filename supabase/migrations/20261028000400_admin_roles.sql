-- Team roles for the admin.
--
-- Roles live in public.admin_users, not in user-editable metadata. The table is
-- the single allowlist for the admin, and RLS uses these helpers as the final
-- authority. New rows default to viewer. Existing allowlisted accounts were
-- full admins before roles existed, so the one-time backfill keeps them as
-- owners.

do $$
begin
  create type public.admin_role as enum ('owner', 'admin', 'editor', 'viewer');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_users'
      and column_name = 'role'
  ) then
    alter table public.admin_users
      add column role public.admin_role not null default 'viewer';

    update public.admin_users set role = 'owner';
  end if;
end $$;

alter table public.admin_users alter column role set default 'viewer';

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
  limit 1;
$$;

revoke all on function public.current_admin_role() from public;
grant execute on function public.current_admin_role() to authenticated;

-- Any allowlisted team member can read admin-only data.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_admin_role() is not null;
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_admin_role() in ('owner', 'admin', 'editor');
$$;

revoke all on function public.can_manage_content() from public;
grant execute on function public.can_manage_content() to authenticated;

create or replace function public.can_manage_inquiries()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_admin_role() in ('owner', 'admin', 'editor');
$$;

revoke all on function public.can_manage_inquiries() from public;
grant execute on function public.can_manage_inquiries() to authenticated;

create or replace function public.can_manage_users()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_admin_role() = 'owner';
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
  select public.current_admin_role() in ('owner', 'admin');
$$;

revoke all on function public.can_manage_retention() from public;
grant execute on function public.can_manage_retention() to authenticated;

-- Content writes are editor and above. This replaces every policy that granted
-- full content management to any allowlisted user.
do $$
declare
  rec record;
begin
  for rec in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and cmd = 'ALL'
      and policyname like 'Admins can manage%'
      and qual like '%is_admin()%'
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      rec.policyname,
      rec.tablename
    );
    execute format(
      'create policy %I on public.%I for all to authenticated ' ||
      'using (public.can_manage_content()) ' ||
      'with check (public.can_manage_content())',
      rec.policyname,
      rec.tablename
    );
  end loop;
end $$;

-- Everyone on the team can read inquiries, but only editors and above can
-- change their status or delete them.
drop policy if exists "Admins can update inquiries" on public.inquiries;
create policy "Admins can update inquiries"
  on public.inquiries
  for update
  to authenticated
  using (public.can_manage_inquiries())
  with check (public.can_manage_inquiries());

drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries"
  on public.inquiries
  for delete
  to authenticated
  using (public.can_manage_inquiries());

-- Owners can see and manage the whole team. Everyone can still read their own
-- allowlist row through the original self-read policy.
drop policy if exists "Owners can manage admin users" on public.admin_users;
create policy "Owners can manage admin users"
  on public.admin_users
  for all
  to authenticated
  using (public.can_manage_users())
  with check (public.can_manage_users());

grant insert, update, delete on public.admin_users to authenticated;

-- Add an existing Supabase Auth user to the team. Creating/inviting the auth
-- user itself still happens in Supabase Authentication.
create or replace function public.add_admin_user(
  p_email text,
  p_role public.admin_role
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
  v_user_id uuid;
  v_existing_role public.admin_role;
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: owner access required.';
  end if;

  if v_email = '' then
    raise exception 'Enter the email of an existing auth user.';
  end if;

  select id
  into v_user_id
  from auth.users
  where lower(email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'No Supabase Auth user found for that email. Invite them in Supabase Authentication first.';
  end if;

  select role
  into v_existing_role
  from public.admin_users
  where user_id = v_user_id;

  if found then
    raise exception 'That user is already on the team. Change their role in the list below.';
  end if;

  insert into public.admin_users (user_id, email, role)
  values (v_user_id, v_email, p_role);

  return v_user_id;
end;
$$;

revoke all on function public.add_admin_user(text, public.admin_role) from public;
grant execute on function public.add_admin_user(text, public.admin_role) to authenticated;

create or replace function public.set_admin_role(
  p_user_id uuid,
  p_role public.admin_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_role public.admin_role;
  v_owner_count integer;
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: owner access required.';
  end if;

  select role
  into v_current_role
  from public.admin_users
  where user_id = p_user_id;

  if not found then
    raise exception 'Team member not found.';
  end if;

  if v_current_role = 'owner' and p_role <> 'owner' then
    select count(*)
    into v_owner_count
    from public.admin_users
    where role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'At least one owner must remain.';
    end if;
  end if;

  update public.admin_users
  set role = p_role
  where user_id = p_user_id;
end;
$$;

revoke all on function public.set_admin_role(uuid, public.admin_role) from public;
grant execute on function public.set_admin_role(uuid, public.admin_role) to authenticated;

create or replace function public.remove_admin_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_role public.admin_role;
  v_owner_count integer;
begin
  if not public.can_manage_users() then
    raise exception 'Forbidden: owner access required.';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot remove your own admin access.';
  end if;

  select role
  into v_current_role
  from public.admin_users
  where user_id = p_user_id;

  if not found then
    raise exception 'Team member not found.';
  end if;

  if v_current_role = 'owner' then
    select count(*)
    into v_owner_count
    from public.admin_users
    where role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'At least one owner must remain.';
    end if;
  end if;

  delete from public.admin_users where user_id = p_user_id;
end;
$$;

revoke all on function public.remove_admin_user(uuid) from public;
grant execute on function public.remove_admin_user(uuid) to authenticated;

-- Retention is destructive, so viewers and editors cannot run it.
create or replace function public.prune_analytics(p_days integer default 180)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sessions integer := 0;
begin
  if not public.can_manage_retention() then
    raise exception 'Forbidden: admin or owner access required.';
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

comment on column public.admin_users.role is 'Admin role: owner, admin, editor, or viewer.';
comment on function public.add_admin_user(text, public.admin_role) is 'Owner-only: add an existing auth user to the admin allowlist.';
comment on function public.set_admin_role(uuid, public.admin_role) is 'Owner-only: change a team member role.';
comment on function public.remove_admin_user(uuid) is 'Owner-only: remove admin access without deleting the auth user.';
