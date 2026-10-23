-- TEST ONLY. Never deploy to Supabase. Auth/GoTrue and JWT signatures are NOT tested here.
-- Mirrors published Supabase Auth SQL helpers (see docs/AUTH_SECURITY.md).
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (
 id uuid primary key,
 email text,
 email_confirmed_at timestamptz,
 is_anonymous boolean default false,
 raw_user_meta_data jsonb default '{}'::jsonb,
 raw_app_meta_data jsonb default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
 select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
   (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid;
$$;
create function auth.role() returns text language sql stable as $$
 select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''),
   (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'))::text;
$$;
create function auth.jwt() returns jsonb language sql stable as $$
 select coalesce(nullif(current_setting('request.jwt.claim', true), ''),
   nullif(current_setting('request.jwt.claims', true), ''))::jsonb;
$$;
grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid(), auth.role(), auth.jwt() to anon, authenticated;
