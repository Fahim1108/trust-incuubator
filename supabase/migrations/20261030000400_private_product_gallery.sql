begin;
-- Draft-only gallery. Private object bytes never become public through this table.
create table public.product_media (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete restrict,
 storage_object_id uuid not null unique references storage.objects(id) on delete restrict,
 storage_path text not null unique,
 alt_text text not null default '' check(length(alt_text)<=300),
 position integer not null check(position between 0 and 19),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 unique(product_id,position) deferrable initially deferred
);
create index product_media_product_idx on public.product_media(product_id);
alter table public.product_media enable row level security;
revoke all on public.product_media from public,anon,authenticated;
grant select on public.product_media to authenticated;
create policy product_media_staff_read on public.product_media for select to authenticated
 using ((select private.has_permission('catalogue.read')));
-- Restrictive policies compose with existing ownership/MFA rules. Linked bytes
-- cannot be overwritten or removed by any authenticated Storage request.
create policy product_media_no_linked_delete on storage.objects as restrictive for delete to authenticated
 using(bucket_id<>'attires-product-drafts' or not exists(select 1 from public.product_media where storage_path=name));
create policy product_media_no_linked_update on storage.objects as restrictive for update to authenticated
 using(bucket_id<>'attires-product-drafts' or not exists(select 1 from public.product_media where storage_path=name))
 with check(bucket_id<>'attires-product-drafts' or not exists(select 1 from public.product_media where storage_path=name));

create function public.admin_edit_product_gallery(target_id uuid,expected_updated_at timestamptz,command jsonb)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare p public.products; saved timestamptz; op text; path text; image_id uuid; object_id uuid;
 before_images jsonb; after_images jsonb; ids uuid[]; media_count integer;
begin
 perform private.require_admin('catalogue.manage');
 if target_id is null or expected_updated_at is null or jsonb_typeof(command)<>'object' then
  raise exception 'Invalid gallery command' using errcode='22023';
 end if;
 select * into p from public.products where id=target_id for update;
 if not found or p.status<>'draft' then raise exception 'Only draft galleries can be edited' using errcode='22023'; end if;
 if p.updated_at is distinct from expected_updated_at then raise exception 'Product changed; reload' using errcode='PT409'; end if;
 select coalesce(jsonb_agg(to_jsonb(m) order by position),'[]') into before_images from public.product_media m where product_id=target_id;
 op:=command->>'operation';
 if op='attach' then
  path:=command->>'path';
  if path is null or path !~ ('^'||auth.uid()::text||'/[0-9a-f-]{36}\.(jpg|png|webp)$') then
   raise exception 'Only your uploaded image may be attached' using errcode='22023';
  end if;
  -- Lock the object row as well, so attachment cannot race Storage deletion.
  select id into object_id from storage.objects where bucket_id='attires-product-drafts' and name=path
   and metadata->>'mimetype' in ('image/jpeg','image/png','image/webp') for update;
  if not found then raise exception 'Uploaded image not found' using errcode='22023'; end if;
  if length(coalesce(command->>'alt',''))>300 then raise exception 'Alt text too long' using errcode='22023'; end if;
  if exists(select 1 from public.product_media where product_id=target_id and storage_path=path) then return p.updated_at; end if;
  select count(*) into media_count from public.product_media where product_id=target_id;
  if media_count>=20 then raise exception 'Maximum 20 images per product' using errcode='22023'; end if;
  insert into public.product_media(product_id,storage_object_id,storage_path,alt_text,position,created_by)
   values(target_id,object_id,path,coalesce(command->>'alt',''),media_count,auth.uid());
 elsif op='remove' then
  image_id:=(command->>'id')::uuid;
  delete from public.product_media where id=image_id and product_id=target_id;
  if not found then raise exception 'Gallery image not found' using errcode='22023'; end if;
  with numbered as(select id,row_number() over(order by position)-1 as n from public.product_media where product_id=target_id)
   update public.product_media m set position=numbered.n from numbered where m.id=numbered.id;
 elsif op='alt' then
  if command->>'alt' is null or length(command->>'alt')>300 then raise exception 'Invalid alt text' using errcode='22023'; end if;
  update public.product_media set alt_text=command->>'alt' where id=(command->>'id')::uuid and product_id=target_id;
  if not found then raise exception 'Gallery image not found' using errcode='22023'; end if;
 elsif op='reorder' then
  if jsonb_typeof(command->'ids')<>'array' then raise exception 'Invalid gallery order' using errcode='22023'; end if;
  select array_agg(value::uuid) into ids from jsonb_array_elements_text(command->'ids');
  select count(*) into media_count from public.product_media where product_id=target_id;
  if coalesce(cardinality(ids),0)<>media_count or (select count(distinct x) from unnest(ids) x)<>media_count
   or exists(select 1 from unnest(ids) x where not exists(select 1 from public.product_media where id=x and product_id=target_id)) then
   raise exception 'Order must contain every gallery image exactly once' using errcode='22023';
  end if;
  update public.product_media set position=array_position(ids,id)-1 where product_id=target_id;
 else raise exception 'Unsupported gallery operation' using errcode='22023';
 end if;
 select coalesce(jsonb_agg(to_jsonb(m) order by position),'[]') into after_images from public.product_media m where product_id=target_id;
 if before_images=after_images then return p.updated_at; end if;
 update public.products set updated_at=clock_timestamp() where id=target_id returning updated_at into saved;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes)
 values(auth.uid(),'product.gallery_updated',target_id,jsonb_build_object('operation',op,'before',before_images,'after',after_images));
 return saved;
end $$;
revoke all on function public.admin_edit_product_gallery(uuid,timestamptz,jsonb) from public,anon;
grant execute on function public.admin_edit_product_gallery(uuid,timestamptz,jsonb) to authenticated;
commit;
