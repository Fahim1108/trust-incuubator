begin;
-- An outdated editor is a business conflict, not a retriable database serialization fault.
-- PT409 makes PostgREST return HTTP 409 immediately.
create or replace function public.admin_save_thrift_draft(target_id uuid, expected_updated_at timestamptz, draft jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare old_product public.products; old_intake public.thrift_intake;
 new_name text:=btrim(draft->>'name'); new_description text:=draft->>'description';
 new_size text:=nullif(btrim(draft->>'actual_size'),'');
 new_color text:=nullif(btrim(draft->>'actual_color'),'');
 new_price bigint; new_stock integer;
begin
 perform private.require_admin('catalogue.manage');
 if draft is null or jsonb_typeof(draft)<>'object' or length(new_name) not between 1 and 200
  or new_description is null or length(new_description)>20000
  or (new_size is not null and (length(new_size)>40 or upper(new_size) in ('N/A','NA','UNKNOWN')))
  or (new_color is not null and length(new_color)>80)
  or coalesce(draft->>'price_minor','') !~ '^[0-9]{1,15}$'
  or coalesce(draft->>'stock_quantity','') !~ '^[01]$' then
  raise exception 'Invalid intake fields' using errcode='22023';
 end if;
 new_price:=(draft->>'price_minor')::bigint; new_stock:=(draft->>'stock_quantity')::integer;
 select * into old_product from public.products where id=target_id for update;
 if not found then raise exception 'Product not found' using errcode='22023'; end if;
 if expected_updated_at is null or old_product.updated_at<>expected_updated_at then
  raise exception 'Product changed; reload before editing' using errcode='PT409';
 end if;
 select * into old_intake from public.thrift_intake where product_id=target_id for update;
 if not found then raise exception 'Imported intake required' using errcode='22023'; end if;
 -- Do not desynchronise an active SKU or change reserved stock through intake editing.
 if exists(select 1 from public.product_variants where product_id=target_id) then
  raise exception 'SKU-backed intake requires the inventory workflow' using errcode='22023';
 end if;
 update public.products set name=new_name,description=new_description,status='draft' where id=target_id;
 update public.thrift_intake set price_minor=new_price,stock_quantity=new_stock,
  actual_size=new_size,actual_color=new_color,size_verified=false,details_verified=false,
  updated_at=clock_timestamp() where product_id=target_id;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes)
 values(auth.uid(),'thrift.draft_saved',target_id,jsonb_build_object(
  'before',jsonb_build_object('name',old_product.name,'description',old_product.description,'price_minor',old_intake.price_minor,'stock_quantity',old_intake.stock_quantity,'actual_size',old_intake.actual_size,'actual_color',old_intake.actual_color),
  'after',draft));
end $$;
commit;
