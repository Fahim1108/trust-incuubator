begin;
create function public.admin_create_product_draft(request_id uuid, product_name text, product_description text)
returns uuid language plpgsql security definer set search_path='' as $$
declare existing public.products;
begin
 perform private.require_admin('catalogue.manage');
 if request_id is null or product_name is null or length(btrim(product_name)) not between 1 and 200 or product_description is null or length(product_description)>20000 then
 raise exception 'Provide a product name and valid description' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 select * into existing from public.products where id=request_id;
 if found then
  if existing.name=btrim(product_name) and existing.description=product_description and exists(select 1 from public.admin_audit_logs where target_id=request_id and actor_id=auth.uid() and action='product.draft_created') then return request_id; end if;
  raise exception 'Request already used; reload before creating another product' using errcode='PT409';
 end if;
 insert into public.products(id,name,slug,description,status) values(request_id,btrim(product_name),'product-'||request_id::text,product_description,'draft');
 insert into public.admin_audit_logs(actor_id,action,target_id,changes) values(auth.uid(),'product.draft_created',request_id,jsonb_build_object('name',btrim(product_name),'status','draft'));
 return request_id;
end $$;
revoke all on function public.admin_create_product_draft(uuid,text,text) from public,anon;
grant execute on function public.admin_create_product_draft(uuid,text,text) to authenticated;
commit;
