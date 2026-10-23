-- Run in the same transaction and test helper schema as foundation.sql.
reset role;
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-0000-0000-000000000009','owner-test@example.invalid','{"role":"owner","roles":["owner"],"is_admin":true}');
select test.assert_true((select count(*)=1 from public.profiles where id='00000000-0000-0000-0000-000000000009'),'registration creates a customer profile');
select test.assert_true((select count(*)=0 from public.user_roles where user_id='00000000-0000-0000-0000-000000000009'),'registration metadata cannot provision owner');
select test.denied($q$select private.provision_owner('00000000-0000-0000-0000-000000000009','owner-test@example.invalid','Approved local test')$q$,'22023','unconfirmed email cannot be provisioned');
update auth.users set email_confirmed_at=now() where id='00000000-0000-0000-0000-000000000009';
select test.denied($q$select private.provision_owner('00000000-0000-0000-0000-000000000009','wrong@example.invalid','Approved local test')$q$,'22023','operator must match verified email and UUID');
set local role authenticated;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000009","role":"authenticated","user_metadata":{"role":"owner","is_admin":true}}',true);
select test.assert_true(auth.uid()='00000000-0000-0000-0000-000000000009'::uuid and auth.role()='authenticated','JSON JWT subject and role resolve');
select test.assert_true(not private.has_permission('inventory.adjust'),'JWT user metadata cannot grant staff access');
select test.assert_true((select count(*)=1 from public.profiles),'JSON JWT claims preserve customer isolation');
select test.denied('update public.product_variants set price_minor=1','42501','customer cannot change product prices');
select test.denied('update public.inventory set reserved=0','42501','customer cannot change reserved stock');
select test.denied('update public.profiles set created_at=now()','42501','customer cannot rewrite profile system fields');
select test.denied($q$select private.provision_owner(auth.uid(),'owner-test@example.invalid','Self provision attempt')$q$,'42501','customer cannot execute owner provisioning');
select test.denied('select * from private.owner_provisioning_log','42501','customer cannot read operator audit records');
select set_config('request.jwt.claims','{"role":"authenticated"}',true);
select test.assert_true(auth.uid() is null and not private.has_permission('inventory.adjust'),'missing JWT subject fails closed');
reset role;
select private.provision_owner('00000000-0000-0000-0000-000000000009','owner-test@example.invalid','Approved isolated test owner');
select private.provision_owner('00000000-0000-0000-0000-000000000009','owner-test@example.invalid','Approved isolated test owner');
select test.assert_true((select count(*)=1 from public.user_roles where user_id='00000000-0000-0000-0000-000000000009') and (select count(*)=1 from private.owner_provisioning_log),'trusted provisioning is idempotent and audited');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000009","role":"authenticated"}',true);
select test.assert_true(private.has_permission('inventory.adjust'),'verified database role grants owner access');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000009","role":"authenticated","is_anonymous":true}',true);
select test.assert_true(not private.has_permission('inventory.adjust'),'anonymous Auth claim denies staff permission');
reset role;
-- No payment schema or public payment mutation API exists yet: do not claim payment RLS coverage.

reset role;
insert into auth.users(id,email,email_confirmed_at,is_anonymous) values
 ('00000000-0000-0000-0000-000000000010','anonymous@example.invalid',now(),true),
 ('00000000-0000-0000-0000-000000000011','rollback@example.invalid',now(),false);
select test.denied($q$select private.provision_owner('00000000-0000-0000-0000-000000000010','anonymous@example.invalid','Approved isolated test')$q$,'22023','anonymous Auth accounts cannot be provisioned as owner');
create function test.reject_owner_audit() returns trigger language plpgsql as $$ begin raise exception 'Injected audit failure' using errcode='23514'; end $$;
create trigger reject_owner_audit before insert on private.owner_provisioning_log for each row execute function test.reject_owner_audit();
select test.denied($q$select private.provision_owner('00000000-0000-0000-0000-000000000011','rollback@example.invalid','Approved isolated test')$q$,'23514','owner audit write failure is propagated');
select test.assert_true((select count(*)=0 from public.user_roles where user_id='00000000-0000-0000-0000-000000000011'),'audit failure rolls back owner role assignment');
set local role anon;
select test.denied($q$select private.provision_owner('00000000-0000-0000-0000-000000000011','rollback@example.invalid','Public caller attempt')$q$,'42501','anonymous visitor cannot provision an owner');
reset role;
