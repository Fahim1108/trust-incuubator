begin;
create table public.catalogue_terms (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('brand','collection','tag')),
 name text not null check(length(btrim(name)) between 1 and 120),
 slug text not null check(length(slug)<=160 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 published boolean not null default false,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(kind,slug)
);
create trigger touch_updated_at before update on public.catalogue_terms for each row execute function private.touch_updated_at();
create table public.product_catalogue_terms (
 product_id uuid not null references public.products(id) on delete restrict,
 term_id uuid not null references public.catalogue_terms(id) on delete restrict,
 primary key(product_id,term_id)
);
create index product_catalogue_terms_term_idx on public.product_catalogue_terms(term_id);
alter table public.catalogue_terms enable row level security;
alter table public.product_catalogue_terms enable row level security;
revoke all on public.catalogue_terms,public.product_catalogue_terms from public,anon,authenticated;
grant select on public.catalogue_terms,public.product_catalogue_terms to anon,authenticated;
create policy terms_staff_read on public.catalogue_terms for select to authenticated using((select private.has_permission('catalogue.read')));
create policy product_terms_staff_read on public.product_catalogue_terms for select to authenticated using((select private.has_permission('catalogue.read')));
create policy product_terms_public_read on public.product_catalogue_terms for select to anon,authenticated
 using(exists(select 1 from public.products where id=product_id and status='published'));
create policy terms_public_read on public.catalogue_terms for select to anon,authenticated
 using(published and exists(select 1 from public.product_catalogue_terms r join public.products p on p.id=r.product_id where r.term_id=catalogue_terms.id and p.status='published'));

create function public.admin_save_catalogue_term(term_type text,target_id uuid,expected_updated_at timestamptz,term jsonb)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare previous jsonb; saved timestamptz; title text:=btrim(term->>'name'); url_slug text:=term->>'slug'; enabled boolean;
begin
 perform private.require_admin('catalogue.manage');
 if target_id is null or term_type not in ('category','brand','collection','tag') or term_type is null
  or term is null or jsonb_typeof(term)<>'object' or coalesce(title,'') !~ '[^[:space:]]' or length(title)>120
  or coalesce(url_slug,'') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(url_slug)>160
  or coalesce(term->>'published','') not in ('true','false') then raise exception 'Invalid catalogue term' using errcode='22023'; end if;
 enabled:=(term->>'published')::boolean;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('catalogue-term:'||target_id::text,0));
 if term_type='category' then
  select to_jsonb(c) into previous from public.categories c where id=target_id for update;
 else
  select to_jsonb(c) into previous from public.catalogue_terms c where id=target_id and kind=term_type for update;
 end if;
 if (previous is null and expected_updated_at is not null) or (previous is not null and (expected_updated_at is null or (previous->>'updated_at')::timestamptz is distinct from expected_updated_at)) then raise exception 'Term changed; reload' using errcode='PT409'; end if;
 if term_type='category' then
  if previous is null then insert into public.categories(id,name,slug,published) values(target_id,title,url_slug,enabled) returning updated_at into saved;
  else update public.categories set name=title,slug=url_slug,published=enabled where id=target_id returning updated_at into saved; end if;
 else
  if previous is null then insert into public.catalogue_terms(id,kind,name,slug,published) values(target_id,term_type,title,url_slug,enabled) returning updated_at into saved;
  else update public.catalogue_terms set name=title,slug=url_slug,published=enabled where id=target_id returning updated_at into saved; end if;
 end if;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes) values(auth.uid(),'catalogue.term_saved',target_id,jsonb_build_object('kind',term_type,'before',previous,'after',term));
 return saved;
end $$;
revoke all on function public.admin_save_catalogue_term(text,uuid,timestamptz,jsonb) from public,anon;
grant execute on function public.admin_save_catalogue_term(text,uuid,timestamptz,jsonb) to authenticated;

create function public.admin_delete_catalogue_term(term_type text,target_id uuid,expected_updated_at timestamptz)
returns void language plpgsql security definer set search_path='' as $$
declare previous jsonb;
begin
 perform private.require_admin('catalogue.manage');
 if term_type not in ('category','brand','collection','tag') or term_type is null then raise exception 'Invalid term type' using errcode='22023'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('catalogue-term:'||target_id::text,0));
 if term_type='category' then select to_jsonb(c) into previous from public.categories c where id=target_id for update;
 else select to_jsonb(c) into previous from public.catalogue_terms c where id=target_id and kind=term_type for update; end if;
 if previous is null then raise exception 'Term not found' using errcode='22023'; end if;
 if expected_updated_at is null or (previous->>'updated_at')::timestamptz is distinct from expected_updated_at then raise exception 'Term changed; reload' using errcode='PT409'; end if;
 if (previous->>'published')::boolean then raise exception 'Unpublish before deleting' using errcode='22023'; end if;
 -- Existing foreign keys reject deleting any assigned term or parent category.
 if term_type='category' then delete from public.categories where id=target_id;
 else delete from public.catalogue_terms where id=target_id; end if;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes) values(auth.uid(),'catalogue.term_deleted',target_id,jsonb_build_object('kind',term_type,'before',previous));
end $$;
revoke all on function public.admin_delete_catalogue_term(text,uuid,timestamptz) from public,anon;
grant execute on function public.admin_delete_catalogue_term(text,uuid,timestamptz) to authenticated;

create function public.admin_set_product_taxonomy(target_id uuid,expected_updated_at timestamptz,category uuid,term_ids uuid[])
returns timestamptz language plpgsql security definer set search_path='' as $$
declare p public.products; saved timestamptz; old_terms uuid[];
begin
 perform private.require_admin('catalogue.manage');
 if term_ids is null or cardinality(term_ids)>40 or (select count(distinct x) from unnest(term_ids) x)<>cardinality(term_ids) then raise exception 'Invalid product terms' using errcode='22023'; end if;
 select * into p from public.products where id=target_id for update;
 if not found or p.status<>'draft' then raise exception 'Only draft taxonomy may be edited' using errcode='22023'; end if;
 if expected_updated_at is null or p.updated_at is distinct from expected_updated_at then raise exception 'Product changed; reload' using errcode='PT409'; end if;
 if category is not null and not exists(select 1 from public.categories where id=category) then raise exception 'Category not found' using errcode='22023'; end if;
 if (select count(*) from public.catalogue_terms where id=any(term_ids))<>cardinality(term_ids)
  or (select count(*) from public.catalogue_terms where id=any(term_ids) and kind='brand')>1 then raise exception 'Choose existing terms and at most one brand' using errcode='22023'; end if;
 select coalesce(array_agg(term_id order by term_id),'{}'::uuid[]) into old_terms from public.product_catalogue_terms where product_id=target_id;
 delete from public.product_catalogue_terms where product_id=target_id;
 insert into public.product_catalogue_terms(product_id,term_id) select target_id,x from unnest(term_ids) x;
 update public.products set category_id=category where id=target_id returning updated_at into saved;
 insert into public.admin_audit_logs(actor_id,action,target_id,changes) values(auth.uid(),'product.taxonomy_saved',target_id,jsonb_build_object('before',jsonb_build_object('category_id',p.category_id,'term_ids',old_terms),'after',jsonb_build_object('category_id',category,'term_ids',term_ids)));
 return saved;
end $$;
revoke all on function public.admin_set_product_taxonomy(uuid,timestamptz,uuid,uuid[]) from public,anon;
grant execute on function public.admin_set_product_taxonomy(uuid,timestamptz,uuid,uuid[]) to authenticated;
commit;
