begin;
-- Existing audited RPCs are the only customer-session draft mutation boundary.
revoke insert,update on public.thrift_intake from authenticated;
drop policy thrift_staff_insert on public.thrift_intake;
drop policy thrift_staff_update on public.thrift_intake;
-- Preserve the existing read-permission vocabulary; harden privileged mutations.
create or replace function public.adjust_inventory(target_variant uuid, quantity_delta integer, adjustment_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare resulting_stock integer;
begin
  perform private.require_admin('inventory.adjust');
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
create or replace function public.moderate_product_review(target_review uuid,approved boolean) returns void language plpgsql security definer set search_path='' as $$
declare previous text; customer uuid;
begin
 perform private.require_admin('catalogue.manage');
 if approved is null then raise exception 'Approval required' using errcode='22023'; end if;
 select status,customer_id into previous,customer from public.product_reviews where id=target_review for update;
 if not found then raise exception 'Review not found' using errcode='22023'; end if;
 update public.product_reviews set status=case when approved then 'approved' else 'rejected' end,author_display_name=coalesce(nullif((select display_name from public.profiles where id=customer),''),'Customer') where id=target_review;
 insert into public.review_moderation_log(review_id,actor_id,previous_status,new_status) values(target_review,auth.uid(),previous,case when approved then 'approved' else 'rejected' end);
end $$;

-- Private staging/product draft media. No public delivery or image transformation.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('attires-product-drafts','attires-product-drafts',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
do $$ begin
 if exists(select 1 from storage.buckets where id='attires-product-drafts' and
   (public or file_size_limit is distinct from 5242880 or allowed_mime_types is distinct from array['image/jpeg','image/png','image/webp'])) then
   raise exception 'Existing draft bucket configuration differs; operator review required';
 end if;
end $$;
create policy attire_draft_media_read on storage.objects for select to authenticated
 using(bucket_id='attires-product-drafts' and auth.jwt()->>'aal'='aal2' and (select private.has_permission('catalogue.read')));
create policy attire_draft_media_insert on storage.objects for insert to authenticated
 with check(bucket_id='attires-product-drafts' and auth.jwt()->>'aal'='aal2' and
  (storage.foldername(name))[1]=(select auth.uid())::text and (select private.has_permission('catalogue.manage')));
create policy attire_draft_media_update on storage.objects for update to authenticated
 using(bucket_id='attires-product-drafts' and auth.jwt()->>'aal'='aal2' and
  (storage.foldername(name))[1]=(select auth.uid())::text and (select private.has_permission('catalogue.manage')))
 with check(bucket_id='attires-product-drafts' and auth.jwt()->>'aal'='aal2' and
  (storage.foldername(name))[1]=(select auth.uid())::text and (select private.has_permission('catalogue.manage')));
create policy attire_draft_media_delete on storage.objects for delete to authenticated
 using(bucket_id='attires-product-drafts' and auth.jwt()->>'aal'='aal2' and
  (storage.foldername(name))[1]=(select auth.uid())::text and (select private.has_permission('catalogue.manage')));
commit;
