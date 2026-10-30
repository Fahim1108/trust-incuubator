begin;
create function public.admin_save_product_variant(target_id uuid,expected_updated_at timestamptz,target_variant uuid,variant jsonb)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare p public.products; previous public.product_variants; saved timestamptz;
 sku_value text:=btrim(variant->>'sku'); size_value text:=btrim(variant->>'size'); color_value text:=btrim(variant->>'color');
 regular bigint; sale bigint; enabled boolean;
begin
 perform private.require_admin('catalogue.manage');
 if target_id is null or target_variant is null or expected_updated_at is null or variant is null or jsonb_typeof(variant)<>'object'
  or coalesce(sku_value,'') !~ '[^[:space:]]' or length(sku_value)>100
  or coalesce(size_value,'') !~ '[^[:space:]]' or length(size_value)>40 or upper(size_value) in ('N/A','NA','UNKNOWN')
  or coalesce(color_value,'') !~ '[^[:space:]]' or length(color_value)>80
  or coalesce(variant->>'price_minor','') !~ '^[0-9]{1,16}$'
  or (variant->>'sale_price_minor' is not null and variant->>'sale_price_minor' !~ '^[0-9]{1,16}$')
  or coalesce(variant->>'active','') not in ('true','false') then
  raise exception 'Invalid SKU, actual size, color or price' using errcode='22023';
 end if;
 regular:=(variant->>'price_minor')::bigint; sale:=(variant->>'sale_price_minor')::bigint; enabled:=(variant->>'active')::boolean;
 if regular>9007199254740991 or sale>regular or (enabled and regular=0) then raise exception 'Invalid prices' using errcode='22023'; end if;
 select * into p from public.products where id=target_id for update;
 if not found or p.status<>'draft' then raise exception 'Edit SKUs on a draft only' using errcode='22023'; end if;
 if p.updated_at is distinct from expected_updated_at then raise exception 'Product changed; reload' using errcode='PT409'; end if;
 if exists(select 1 from public.thrift_intake where product_id=target_id) then raise exception 'Use physical garment verification; do not invent thrift variants' using errcode='22023'; end if;
 select * into previous from public.product_variants where id=target_variant for update;
 if found then
  if previous.product_id<>target_id then raise exception 'SKU belongs to another product' using errcode='22023'; end if;
  if previous.sku=sku_value and previous.size=size_value and previous.color=color_value and previous.price_minor=regular and previous.sale_price_minor is not distinct from sale and previous.active=enabled then return p.updated_at; end if;
  update public.product_variants set sku=sku_value,size=size_value,color=color_value,price_minor=regular,sale_price_minor=sale,active=enabled where id=target_variant;
 else
  if (select count(*) from public.product_variants where product_id=target_id)>=100 then raise exception 'Maximum 100 SKUs per product' using errcode='22023'; end if;
  insert into public.product_variants(id,product_id,sku,size,color,price_minor,sale_price_minor,active)
   values(target_variant,target_id,sku_value,size_value,color_value,regular,sale,enabled);
  insert into public.inventory(variant_id) values(target_variant);
 end if;
 update public.products set updated_at=clock_timestamp() where id=target_id returning updated_at into saved;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes)
 values(auth.uid(),'product.variant_saved',target_id,jsonb_build_object('variant_id',target_variant,'before',to_jsonb(previous),'after',variant));
 return saved;
end $$;
revoke all on function public.admin_save_product_variant(uuid,timestamptz,uuid,jsonb) from public,anon;
grant execute on function public.admin_save_product_variant(uuid,timestamptz,uuid,jsonb) to authenticated;

create function public.admin_adjust_product_stock(target_id uuid,expected_updated_at timestamptz,target_variant uuid,quantity_delta integer,adjustment_reason text)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare p public.products; saved timestamptz;
begin
 perform private.require_admin('inventory.adjust');
 select * into p from public.products where id=target_id for update;
 if not found or expected_updated_at is null then raise exception 'Product and version required' using errcode='22023'; end if;
 if p.updated_at is distinct from expected_updated_at then raise exception 'Product changed; reload' using errcode='PT409'; end if;
 if not exists(select 1 from public.product_variants where id=target_variant and product_id=target_id) then raise exception 'SKU does not belong to product' using errcode='22023'; end if;
 if exists(select 1 from public.thrift_intake where product_id=target_id) then
  perform 1 from public.inventory where variant_id=target_variant for update;
  if exists(select 1 from public.inventory where variant_id=target_variant and on_hand::bigint+quantity_delta>1) then raise exception 'One physical thrift garment cannot have multiple units' using errcode='22023'; end if;
 end if;
 perform public.adjust_inventory(target_variant,quantity_delta,adjustment_reason);
 update public.products set updated_at=clock_timestamp() where id=target_id returning updated_at into saved;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes)
 values(auth.uid(),'inventory.adjusted',target_id,jsonb_build_object('variant_id',target_variant,'delta',quantity_delta,'reason',btrim(adjustment_reason),'on_hand_after',(select on_hand from public.inventory where variant_id=target_variant)));
 return saved;
end $$;
revoke all on function public.admin_adjust_product_stock(uuid,timestamptz,uuid,integer,text) from public,anon;
grant execute on function public.admin_adjust_product_stock(uuid,timestamptz,uuid,integer,text) to authenticated;
commit;
