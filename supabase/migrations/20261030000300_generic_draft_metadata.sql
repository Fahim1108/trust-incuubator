begin;
-- Additive only. Does not modify existing rows, policies, tables or RPCs.
-- NOT applied remotely until explicit Staging migration authorization.
create function public.admin_update_product_draft(
 target_id uuid, expected_updated_at timestamptz,
 product_name text, product_description text
) returns timestamptz
language plpgsql security definer set search_path='' as $$
declare previous public.products; saved_at timestamptz;
begin
 perform private.require_admin('catalogue.manage');
 if target_id is null or expected_updated_at is null or product_name is null
    or length(btrim(product_name)) not between 1 and 200 or product_name !~ '[^[:space:]]'
    or product_description is null or length(product_description)>20000 then
  raise exception 'Provide a valid name, description and saved version' using errcode='22023';
 end if;
 select * into previous from public.products where id=target_id for update;
 if not found then raise exception 'Product not found' using errcode='22023'; end if;
 if previous.updated_at is distinct from expected_updated_at then
  raise exception 'Product changed; reload before editing' using errcode='PT409';
 end if;
 if previous.status<>'draft' then
  raise exception 'Only unpublished drafts can be edited here' using errcode='22023';
 end if;
 if exists(select 1 from public.thrift_intake where product_id=target_id) then
  raise exception 'Use the audited garment intake editor' using errcode='22023';
 end if;
 if previous.name=btrim(product_name) and previous.description=product_description then
  return previous.updated_at;
 end if;
 update public.products set name=btrim(product_name),description=product_description
 where id=target_id returning updated_at into saved_at;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes)
 values(auth.uid(),'product.draft_updated',target_id,jsonb_build_object(
  'before',jsonb_build_object('name',previous.name,'description',previous.description),
  'after',jsonb_build_object('name',btrim(product_name),'description',product_description)));
 return saved_at;
end $$;
revoke all on function public.admin_update_product_draft(uuid,timestamptz,text,text) from public,anon;
grant execute on function public.admin_update_product_draft(uuid,timestamptz,text,text) to authenticated;
commit;
