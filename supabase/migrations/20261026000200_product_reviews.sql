begin;
create table public.product_reviews (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete restrict,
 customer_id uuid not null references public.profiles(id) on delete cascade,
 rating integer not null check(rating between 1 and 5),
 title text not null default '' check(length(title)<=160),
 body text not null check(length(btrim(body)) between 10 and 3000),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 author_display_name text not null default '',
 created_at timestamptz not null default now(),
 unique(product_id,customer_id)
);
alter table public.product_reviews enable row level security;
grant select(id,product_id,rating,title,body,status,author_display_name,created_at) on public.product_reviews to anon,authenticated;
create policy approved_reviews on public.product_reviews for select to anon,authenticated using (status='approved' and exists(select 1 from public.products p where p.id=product_id and p.status='published'));
create policy own_or_staff_reviews on public.product_reviews for select to authenticated using(customer_id=(select auth.uid()) or (select private.has_permission('catalogue.manage')));
create function public.submit_product_review(target_product uuid,stars integer,review_body text,review_title text default '') returns uuid
language plpgsql security definer set search_path='' as $$
declare customer uuid:=auth.uid(); result uuid;
begin
 if customer is null or coalesce((nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'is_anonymous')::boolean,false) then raise exception 'Sign in to write a review' using errcode='42501'; end if;
 if stars is null or stars not between 1 and 5 or review_body is null or length(btrim(review_body)) not between 10 and 3000 or review_title is null or length(review_title)>160 then raise exception 'Invalid review' using errcode='22023'; end if;
 if not exists(select 1 from public.products where id=target_product and status='published') then raise exception 'Product unavailable' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(customer::text,0));
 if (select count(*) from public.product_reviews where customer_id=customer and created_at>now()-interval '15 minutes')>=3 then raise exception 'Review rate limit reached' using errcode='54000'; end if;
 insert into public.product_reviews(product_id,customer_id,rating,title,body) values(target_product,customer,stars,btrim(review_title),btrim(review_body)) returning id into result;
 return result;
end $$;
revoke all on function public.submit_product_review(uuid,integer,text,text) from public,anon;
grant execute on function public.submit_product_review(uuid,integer,text,text) to authenticated;
create table public.review_moderation_log (
 id bigint generated always as identity primary key,
 review_id uuid not null references public.product_reviews(id) on delete restrict,
 actor_id uuid not null references public.profiles(id),
 previous_status text not null,new_status text not null,
 created_at timestamptz not null default now()
);
alter table public.review_moderation_log enable row level security;
grant select on public.review_moderation_log to authenticated;
create policy review_audit_staff on public.review_moderation_log for select to authenticated using((select private.has_permission('catalogue.manage')));
create function public.moderate_product_review(target_review uuid,approved boolean) returns void language plpgsql security definer set search_path='' as $$
declare previous text; customer uuid;
begin
 if not private.has_permission('catalogue.manage') then raise exception 'Review moderation denied' using errcode='42501'; end if;
 if approved is null then raise exception 'Approval required' using errcode='22023'; end if;
 select status,customer_id into previous,customer from public.product_reviews where id=target_review for update;
 if not found then raise exception 'Review not found' using errcode='22023'; end if;
 update public.product_reviews set status=case when approved then 'approved' else 'rejected' end,author_display_name=coalesce(nullif((select display_name from public.profiles where id=customer),''),'Customer') where id=target_review;
 insert into public.review_moderation_log(review_id,actor_id,previous_status,new_status) values(target_review,auth.uid(),previous,case when approved then 'approved' else 'rejected' end);
end $$;
revoke all on function public.moderate_product_review(uuid,boolean) from public,anon;
grant execute on function public.moderate_product_review(uuid,boolean) to authenticated;
-- No verified-purchase field exists: purchase ownership cannot be asserted without the real order service.
commit;
