\set ON_ERROR_STOP on
begin;
create schema test;
grant usage on schema test to anon, authenticated;
create function test.assert_true(condition boolean, label text) returns void language plpgsql as $$
begin
 if condition is distinct from true then raise exception 'FAIL: %', label; end if;
 raise notice 'PASS: %', label;
end $$;
create function test.denied(command text, expected_code text, label text) returns void language plpgsql as $$
begin
 begin
   execute command;
 exception when others then
   if sqlstate = expected_code then raise notice 'PASS: %', label; return; end if;
   raise;
 end;
 raise exception 'FAIL (operation unexpectedly succeeded): %', label;
end $$;
grant execute on all functions in schema test to anon, authenticated;
insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003'),
 ('00000000-0000-0000-0000-000000000004');
update public.profiles set display_name='Test profile';
insert into public.user_roles(user_id,role) values
 ('00000000-0000-0000-0000-000000000003','product_manager'),
 ('00000000-0000-0000-0000-000000000004','analyst');
insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000005'),
 ('00000000-0000-0000-0000-000000000006'),
 ('00000000-0000-0000-0000-000000000007'),
 ('00000000-0000-0000-0000-000000000008');
insert into public.user_roles(user_id,role) values
 ('00000000-0000-0000-0000-000000000005','owner'),
 ('00000000-0000-0000-0000-000000000006','order_manager'),
 ('00000000-0000-0000-0000-000000000007','marketing_manager'),
 ('00000000-0000-0000-0000-000000000008','customer_support');
insert into public.products(id,name,slug,status) values
 ('10000000-0000-0000-0000-000000000001','Published fixture','published-fixture','published'),
 ('10000000-0000-0000-0000-000000000002','Draft fixture','draft-fixture','draft');
insert into public.product_variants(id,product_id,sku,size,color,price_minor,active) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','PUB','M','Black',10000,true),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','DRAFT','M','Black',10000,true),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','INACTIVE','L','Black',10000,false);
insert into public.inventory(variant_id,on_hand,reserved) values ('20000000-0000-0000-0000-000000000001',10,2);
select test.assert_true((select count(*)=15 and bool_and(relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'), 'all fifteen exposed tables enable RLS');
select test.denied($q$update public.product_variants set sale_price_minor=10001$q$,'23514','sale price cannot exceed regular price');
select test.denied($q$update public.inventory set on_hand=1$q$,'23514','stock cannot fall below reserved quantity');
select test.denied($q$update public.inventory set reserved=-1$q$,'23514','reserved stock cannot be negative');
set local role anon;
select test.assert_true((select count(*)=1 from public.products),'anonymous sees only published products');
select test.assert_true((select count(*)=1 from public.product_variants),'anonymous cannot see draft or inactive variants');
select test.denied('select * from public.profiles','42501','anonymous cannot read customer profiles');
select test.denied('select * from public.inventory','42501','anonymous cannot read exact stock');
select test.denied($q$select public.adjust_inventory('20000000-0000-0000-0000-000000000001',1,'Unauthorized')$q$,'42501','anonymous cannot execute inventory mutation');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select test.assert_true((select count(*)=1 from public.profiles),'customer reads only their own profile');
update public.profiles set display_name='Updated' where id=auth.uid();
select test.assert_true((select display_name='Updated' from public.profiles),'customer can update own profile');
with changed as (update public.profiles set display_name='Forbidden' where id='00000000-0000-0000-0000-000000000002' returning id)
select test.assert_true((select count(*)=0 from changed),'customer cannot update another profile');
select test.denied($q$insert into public.user_roles values (auth.uid(),'owner',now())$q$,'42501','customer cannot self-assign owner');
select test.denied($q$insert into public.role_permissions values ('customer_support','inventory.adjust')$q$,'42501','customer cannot change permission mapping');
select test.assert_true((select count(*)=0 from public.inventory),'customer cannot read private inventory');
select test.denied($q$select public.adjust_inventory('20000000-0000-0000-0000-000000000001',1,'Unauthorized')$q$,'42501','customer cannot mutate inventory via RPC');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
select test.assert_true((select count(*)=1 from public.products),'analyst without MFA cannot read drafts');
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
select test.assert_true((select count(*)=2 from public.products),'MFA analyst can read drafts');
select test.denied($q$select public.adjust_inventory('20000000-0000-0000-0000-000000000001',1,'Unauthorized')$q$,'42501','read-only analyst cannot adjust stock');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
select test.denied('update public.inventory set on_hand=100','42501','staff cannot bypass inventory ledger');
select set_config('request.jwt.claims','{"aal":"aal1"}',true);
select test.denied($q$select public.adjust_inventory('20000000-0000-0000-0000-000000000001',-3,'MFA required')$q$,'42501','staff password alone cannot adjust inventory');
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
select public.adjust_inventory('20000000-0000-0000-0000-000000000001',-3,'Stock reconciliation');
select test.assert_true((select on_hand=7 and reserved=2 and available=5 from public.inventory),'authorized adjustment preserves reserved stock');
select test.assert_true((select count(*)=1 from public.inventory_movements where delta=-3 and on_hand_after=7 and actor_id=auth.uid()),'adjustment creates attributable ledger record');
select test.denied($q$select public.adjust_inventory('20000000-0000-0000-0000-000000000001',-6,'Too much')$q$,'22023','adjustment cannot consume reserved stock');
select test.denied($q$select public.adjust_inventory('20000000-0000-0000-0000-000000000001',1,' ')$q$,'22023','adjustment requires a meaningful reason');
select test.assert_true((select on_hand=7 from public.inventory) and (select count(*)=1 from public.inventory_movements),'failed adjustments leave stock and ledger unchanged');
select test.denied('delete from public.inventory_movements','42501','staff cannot delete movement history');
-- A ledger failure must roll back the stock update within the RPC.
reset role;
create function test.reject_movement() returns trigger language plpgsql as $$ begin raise exception 'Injected ledger failure' using errcode='23514'; end $$;
create trigger reject_movement before insert on public.inventory_movements for each row execute function test.reject_movement();
set local role authenticated;
select test.denied($q$select public.adjust_inventory('20000000-0000-0000-0000-000000000001',2,'Rollback test')$q$,'23514','ledger failure is propagated');
select test.assert_true((select on_hand=7 from public.inventory) and (select count(*)=1 from public.inventory_movements),'ledger failure rolls back the entire adjustment');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000005',true);
select test.assert_true(private.has_permission('inventory.adjust') and private.has_permission('catalogue.manage'),'owner has defined management permissions');
select test.assert_true(not private.has_permission('roles.manage'),'undefined permissions are denied even to owner');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000006',true);
select test.assert_true(private.has_permission('inventory.read') and not private.has_permission('inventory.adjust'),'order manager may read but not adjust stock');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000007',true);
select test.assert_true(not private.has_permission('inventory.read') and not private.has_permission('inventory.adjust'),'marketing role receives no inventory permissions');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000008',true);
select test.assert_true(not private.has_permission('inventory.read') and not private.has_permission('inventory.adjust'),'support role receives no inventory permissions');
select test.assert_true((select count(*)=1 and bool_and(id=auth.uid()) from public.profiles),'staff cannot read arbitrary customer profiles');
-- Additional auth assertions are concatenated by the test runner.
reset role;
rollback;
