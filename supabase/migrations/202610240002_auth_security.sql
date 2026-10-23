begin;
-- Customer registration creates a profile only. Never derive staff roles from metadata.
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger attire_create_customer_profile after insert on auth.users
for each row execute function private.handle_new_user();
insert into public.profiles(id) select id from auth.users on conflict (id) do nothing;

revoke insert, update on public.profiles from authenticated;
grant insert (id, display_name), update (display_name) on public.profiles to authenticated;

create table private.owner_provisioning_log (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  operator_name text not null,
  reason text not null check (length(btrim(reason)) between 10 and 500),
  created_at timestamptz not null default now()
);
alter table private.owner_provisioning_log enable row level security;
revoke all on private.owner_provisioning_log from public, anon, authenticated;
revoke all on sequence private.owner_provisioning_log_id_seq from public, anon, authenticated;

-- SECURITY INVOKER: only an operator with database privileges may call this.
-- Not exposed through PostgREST; no browser or service-role EXECUTE grant.
create function private.provision_owner(target_user uuid, expected_email text, provisioning_reason text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if provisioning_reason is null or length(btrim(provisioning_reason)) not between 10 and 500
    or expected_email is null or btrim(expected_email) = '' then
    raise exception 'Verified identity and provisioning reason required' using errcode = '22023';
  end if;
  perform 1 from auth.users
   where id = target_user and lower(email) = lower(btrim(expected_email))
     and email_confirmed_at is not null and not coalesce(is_anonymous, false)
   for update;
  if not found then
    raise exception 'Verified non-anonymous account did not match' using errcode = '22023';
  end if;
  insert into public.user_roles(user_id, role) values (target_user, 'owner') on conflict do nothing;
  if found then
    insert into private.owner_provisioning_log(user_id, operator_name, reason)
    values (target_user, session_user, btrim(provisioning_reason));
  end if;
end;
$$;
revoke all on function private.provision_owner(uuid, text, text) from public, anon, authenticated;

-- Anonymous Auth accounts never receive staff access, even if misprovisioned.
create or replace function private.has_permission(required_permission text) returns boolean
language sql stable security definer set search_path = '' as $$
 select not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) and exists (
   select 1 from public.user_roles ur join public.role_permissions rp on rp.role = ur.role
   where ur.user_id = (select auth.uid()) and rp.permission = required_permission
 );
$$;
revoke all on function private.has_permission(text) from public, anon;
grant execute on function private.has_permission(text) to authenticated;
commit;
