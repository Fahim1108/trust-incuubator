begin;
-- All staff-only reads and capabilities require MFA at the database boundary.
-- The own_roles policy remains available at AAL1 for MFA enrollment/sign-in.
create or replace function private.has_permission(required_permission text) returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce(auth.jwt()->>'aal','')='aal2'
  and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false)
  and exists(select 1 from public.user_roles ur join public.role_permissions rp on rp.role=ur.role
   where ur.user_id=(select auth.uid()) and rp.permission=required_permission);
$$;
revoke all on function private.has_permission(text) from public,anon;
grant execute on function private.has_permission(text) to authenticated;
commit;
