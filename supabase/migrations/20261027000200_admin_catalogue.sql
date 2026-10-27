begin;
-- New staff entry points require real Auth MFA as well as database permissions.
create function private.require_admin(required_permission text) returns void
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or auth.jwt()->>'aal' is distinct from 'aal2'
    or not private.has_permission(required_permission) then
  raise exception 'Staff permission and MFA required' using errcode='42501';
 end if;
end $$;
revoke all on function private.require_admin(text) from public,anon,authenticated;
create table public.admin_audit_logs (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references auth.users(id) on delete set null,
 action text not null,
 target_id uuid not null,
 changes jsonb not null,
 created_at timestamptz not null default now()
);
create index admin_audit_created_idx on public.admin_audit_logs(created_at desc);
alter table public.admin_audit_logs enable row level security;
revoke all on public.admin_audit_logs from public,anon,authenticated;
grant select on public.admin_audit_logs to authenticated;
create policy admin_audit_read on public.admin_audit_logs for select to authenticated
 using(auth.jwt()->>'aal'='aal2' and (select private.has_permission('catalogue.manage')));

create function public.admin_catalogue_snapshot() returns jsonb
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
   'size_verified',i.size_verified,'details_verified',i.details_verified
  ) order by i.source_id),'[]'::jsonb) from public.thrift_intake i join public.products p on p.id=i.product_id)
 );
end $$;
revoke all on function public.admin_catalogue_snapshot() from public,anon;
grant execute on function public.admin_catalogue_snapshot() to authenticated;

-- Editing imported physical intake is distinct from manufacturing new variants.
-- Every write remains a draft in this increment. Publication is deliberately separate.
create function public.admin_save_thrift_draft(target_id uuid, expected_updated_at timestamptz, draft jsonb)
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
  raise exception 'Product changed; reload before editing' using errcode='40001';
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
revoke all on function public.admin_save_thrift_draft(uuid,timestamptz,jsonb) from public,anon;
grant execute on function public.admin_save_thrift_draft(uuid,timestamptz,jsonb) to authenticated;
commit;
