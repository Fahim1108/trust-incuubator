begin;
-- Add nullable physical facts; never infer measurements for existing garments.
alter table public.thrift_intake
 add column chest_inches numeric(5,2) check(chest_inches>0 and chest_inches<=100),
 add column length_inches numeric(5,2) check(length_inches>0 and length_inches<=100),
 add column condition text check(condition in ('excellent','very_good','good','fair'));
create or replace function public.admin_save_thrift_draft(target_id uuid, expected_updated_at timestamptz, draft jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare old_product public.products; old_intake public.thrift_intake;
 new_name text:=btrim(draft->>'name'); new_description text:=draft->>'description';
 new_size text:=nullif(btrim(draft->>'actual_size'),'');
 new_color text:=nullif(btrim(draft->>'actual_color'),'');
 new_price bigint; new_stock integer; chest numeric; garment_length numeric; garment_condition text;
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
 if coalesce(draft->>'chest_inches','') !~ '^([0-9]{1,3}([.][0-9]{1,2})?)?$'
 or coalesce(draft->>'length_inches','') !~ '^([0-9]{1,3}([.][0-9]{1,2})?)?$' then
 raise exception 'Measurements must be numeric inches' using errcode='22023'; end if;
 chest:=nullif(draft->>'chest_inches','')::numeric;
 garment_length:=nullif(draft->>'length_inches','')::numeric;
 garment_condition:=nullif(draft->>'condition','');
 if (chest is not null and (chest<=0 or chest>100)) or (garment_length is not null and (garment_length<=0 or garment_length>100))
 or (garment_condition is not null and garment_condition not in ('excellent','very_good','good','fair')) then
 raise exception 'Check garment measurements and condition' using errcode='22023'; end if;
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
 if not draft ? 'chest_inches' then chest:=old_intake.chest_inches; end if;
 if not draft ? 'length_inches' then garment_length:=old_intake.length_inches; end if;
 if not draft ? 'condition' then garment_condition:=old_intake.condition; end if;
 update public.products set name=new_name,description=new_description,status='draft' where id=target_id;
 update public.thrift_intake set price_minor=new_price,stock_quantity=new_stock,
  actual_size=new_size,actual_color=new_color,chest_inches=chest,length_inches=garment_length,condition=garment_condition,size_verified=false,details_verified=false,
  updated_at=clock_timestamp() where product_id=target_id;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes)
 values(auth.uid(),'thrift.draft_saved',target_id,jsonb_build_object(
  'before',jsonb_build_object('name',old_product.name,'description',old_product.description,'price_minor',old_intake.price_minor,'stock_quantity',old_intake.stock_quantity,'actual_size',old_intake.actual_size,'actual_color',old_intake.actual_color,'chest_inches',old_intake.chest_inches,'length_inches',old_intake.length_inches,'condition',old_intake.condition),
  'after',draft));
end $$;
create or replace function public.admin_catalogue_snapshot() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform private.require_admin('catalogue.read');
 return jsonb_build_object(
  'products',(select count(*) from public.products),
  'published',(select count(*) from public.products where status='published'),
  'drafts',(select count(*) from public.products where status='draft'),
  'available',(select count(*) from public.inventory where available>0),
  'sold_out',(select count(*) from public.inventory where available=0),
  'pending_sizes',(select count(*) from public.thrift_intake where not size_verified),
  'items',(select coalesce(jsonb_agg(jsonb_build_object(
   'id',p.id,'name',p.name,'description',p.description,'status',p.status,'slug',p.slug,
   'updated_at',p.updated_at,'source_id',i.source_id,'image_path',i.image_path,
   'price_minor',i.price_minor,'stock_quantity',i.stock_quantity,
   'actual_size',i.actual_size,'actual_color',i.actual_color,
   'chest_inches',i.chest_inches,'length_inches',i.length_inches,'condition',i.condition,'size_verified',i.size_verified,'details_verified',i.details_verified
  ) order by i.source_id),'[]'::jsonb) from public.thrift_intake i join public.products p on p.id=i.product_id)
 );
end $$;
commit;
