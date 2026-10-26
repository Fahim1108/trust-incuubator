begin;
-- Staff-only physical intake, before a purchasable size/SKU can truthfully exist.
create table public.thrift_intake (
 source_id text primary key check(source_id ~ '^AA-SHIRT-[0-9]{3}$'),
 product_id uuid not null unique references public.products(id) on delete restrict,
 image_path text not null check(image_path like '/inventory/thrift-shirts/%'),
 image_sha256 text not null unique check(image_sha256 ~ '^[a-f0-9]{64}$'),
 price_minor bigint not null check(price_minor between 0 and 9007199254740991),
 stock_quantity integer not null default 1 check(stock_quantity between 0 and 1),
 actual_size text check(actual_size is null or (length(btrim(actual_size)) between 1 and 40 and upper(btrim(actual_size)) not in ('N/A','NA','UNKNOWN'))),
 actual_color text check(actual_color is null or length(btrim(actual_color)) between 1 and 80),
 size_verified boolean not null default false,
 details_verified boolean not null default false,
 proposed_metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(not size_verified or actual_size is not null)
);
alter table public.thrift_intake enable row level security;
revoke all on public.thrift_intake from anon, authenticated;
grant select,insert,update on public.thrift_intake to authenticated;
create policy thrift_staff_read on public.thrift_intake for select to authenticated using ((select private.has_permission('catalogue.read')));
create policy thrift_staff_insert on public.thrift_intake for insert to authenticated with check ((select private.has_permission('catalogue.manage')));
create policy thrift_staff_update on public.thrift_intake for update to authenticated using ((select private.has_permission('catalogue.manage'))) with check ((select private.has_permission('catalogue.manage')));
-- Cannot bypass verification using an ordinary product publish update.
create function private.guard_thrift_publication() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='published' and exists(select 1 from public.thrift_intake i where i.product_id=new.id and (not i.size_verified or not i.details_verified or i.actual_size is null or i.actual_color is null)) then
  raise exception 'Thrift size and essential details must be verified before publication' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function private.guard_thrift_publication() from public,anon,authenticated;
create function private.guard_thrift_verification() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not new.size_verified or not new.details_verified or new.actual_size is null or new.actual_color is null then
  update public.products set status='draft' where id=new.product_id and status='published';
 end if;
 return new;
end $$;
revoke all on function private.guard_thrift_verification() from public,anon,authenticated;
create trigger thrift_verification_change after insert or update on public.thrift_intake for each row execute function private.guard_thrift_verification();
create trigger thrift_publication_gate before update of status on public.products for each row execute function private.guard_thrift_publication();
create function public.published_thrift_catalogue() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'slug',p.slug,'name',p.name,'description',p.description,'variant_id',v.id,'sku',v.sku,'size',i.actual_size,'color',i.actual_color,'price_minor',i.price_minor,'in_stock',i.stock_quantity>0 and s.available>0,'image_path',i.image_path,'created_at',p.created_at)), '[]'::jsonb)
 from public.thrift_intake i join public.products p on p.id=i.product_id
 join public.product_variants v on v.product_id=p.id and v.size=i.actual_size and v.color=i.actual_color and v.active
 join public.inventory s on s.variant_id=v.id
 where p.status='published' and i.size_verified and i.details_verified and i.actual_size is not null and i.actual_color is not null;
$$;
revoke all on function public.published_thrift_catalogue() from public;
grant execute on function public.published_thrift_catalogue() to anon,authenticated;
commit;
