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

-- Minimal Storage SQL simulation only: not the real Storage API or upload validation.
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text not null,unique(bucket_id,name));
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(regexp_replace(name,'/[^/]*$',''),'/')$$;
grant usage on schema storage to anon,authenticated;
grant select,insert,update,delete on storage.objects to anon,authenticated;
grant execute on function storage.foldername(text) to anon,authenticated;
