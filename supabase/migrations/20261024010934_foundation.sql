-- Apply through the Supabase migration runner, never from a browser.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.role_permissions (
  role text not null check (role in ('owner','product_manager','order_manager','customer_support','marketing_manager','analyst')),
  permission text not null check (permission in ('catalogue.read','catalogue.manage','inventory.read','inventory.adjust')),
  primary key (role, permission)
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','product_manager','order_manager','customer_support','marketing_manager','analyst')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
insert into public.role_permissions(role, permission) values
 ('owner','catalogue.read'),('owner','catalogue.manage'),('owner','inventory.read'),('owner','inventory.adjust'),
 ('product_manager','catalogue.read'),('product_manager','catalogue.manage'),('product_manager','inventory.read'),('product_manager','inventory.adjust'),
 ('order_manager','catalogue.read'),('order_manager','inventory.read'),
 ('analyst','catalogue.read'),('analyst','inventory.read');

create function private.has_permission(required_permission text) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists (
   select 1 from public.user_roles ur
   join public.role_permissions rp on rp.role = ur.role
   where ur.user_id = (select auth.uid()) and rp.permission = required_permission
 );
$$;
revoke all on function private.has_permission(text) from public;
grant execute on function private.has_permission(text) to authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  name text not null check (length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is distinct from id)
);
create index categories_parent_idx on public.categories(parent_id);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null check (length(name) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '' check (length(description) <= 20000),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_listing_idx on public.products(status, created_at desc, id);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  sku text not null unique check (length(sku) between 1 and 100),
  size text not null check (length(size) between 1 and 40),
  color text not null check (length(color) between 1 and 80),
  price_minor bigint not null check (price_minor between 0 and 9007199254740991),
  sale_price_minor bigint check (sale_price_minor between 0 and price_minor),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, size, color)
);
create table public.inventory (
  variant_id uuid primary key references public.product_variants(id) on delete restrict,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= on_hand),
  available integer generated always as (on_hand - reserved) stored,
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.inventory(variant_id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  delta integer not null check (delta <> 0),
  on_hand_after integer not null check (on_hand_after >= 0),
  reason text not null check (length(btrim(reason)) between 3 and 500),
  created_at timestamptz not null default now()
);
create index inventory_movements_history_idx on public.inventory_movements(variant_id, created_at desc);

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := clock_timestamp(); return new; end;
$$;
revoke all on function private.touch_updated_at() from public;
do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','categories','products','product_variants','inventory'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()', table_name);
  end loop;
  foreach table_name in array array['profiles','user_roles','role_permissions','categories','products','product_variants','inventory','inventory_movements'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
  end loop;
end $$;

grant select, insert, update on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profile_insert on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profile_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Role membership is provisioned only through a trusted operator; no client writes.
grant select on public.user_roles to authenticated;
create policy own_roles on public.user_roles for select to authenticated using (user_id = (select auth.uid()));
grant select on public.categories, public.products, public.product_variants to anon, authenticated;
create policy category_public on public.categories for select to anon, authenticated using (published);
create policy product_public on public.products for select to anon, authenticated using (status = 'published');
create policy variant_public on public.product_variants for select to anon, authenticated using (
 active and exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy category_staff on public.categories for select to authenticated using ((select private.has_permission('catalogue.read')));
create policy product_staff on public.products for select to authenticated using ((select private.has_permission('catalogue.read')));
create policy variant_staff on public.product_variants for select to authenticated using ((select private.has_permission('catalogue.read')));
-- Exact stock and movement history are private. Public availability will use a scoped catalogue query later.
grant select on public.inventory, public.inventory_movements to authenticated;
create policy inventory_staff on public.inventory for select to authenticated using ((select private.has_permission('inventory.read')));
create policy movements_staff on public.inventory_movements for select to authenticated using ((select private.has_permission('inventory.read')));

create function public.adjust_inventory(target_variant uuid, quantity_delta integer, adjustment_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare resulting_stock integer;
begin
  if not private.has_permission('inventory.adjust') then
    raise exception 'Inventory adjustment is not authorized' using errcode = '42501';
  end if;
  if quantity_delta is null or quantity_delta = 0 or adjustment_reason is null
     or length(btrim(adjustment_reason)) not between 3 and 500 then
    raise exception 'Invalid adjustment' using errcode = '22023';
  end if;
  -- UPDATE takes a row lock; the WHERE is reevaluated after concurrent updates.
  update public.inventory set on_hand = on_hand + quantity_delta
   where variant_id = target_variant and on_hand::bigint + quantity_delta >= reserved
   returning on_hand into resulting_stock;
  if not found then
    raise exception 'Inventory missing or insufficient unreserved stock' using errcode = '22023';
  end if;
  insert into public.inventory_movements(variant_id, actor_id, delta, on_hand_after, reason)
  values (target_variant, auth.uid(), quantity_delta, resulting_stock, btrim(adjustment_reason));
end;
$$;
revoke all on function public.adjust_inventory(uuid, integer, text) from public, anon;
grant execute on function public.adjust_inventory(uuid, integer, text) to authenticated;
commit;
