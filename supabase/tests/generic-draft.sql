-- Isolated PostgreSQL tests only: JWT claims are simulated, not signed Auth sessions.
reset role;
select set_config('request.jwt.claim','',true);
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claim.role','',true);
insert into auth.users(id,email,email_confirmed_at) values
 ('20000000-0000-4000-8000-000000000001','generic-owner@example.invalid',now()),
 ('20000000-0000-4000-8000-000000000002','generic-customer@example.invalid',now()),
 ('20000000-0000-4000-8000-000000000003','generic-manager@example.invalid',now()),
 ('20000000-0000-4000-8000-000000000004','generic-analyst@example.invalid',now());
insert into public.user_roles(user_id,role) values
 ('20000000-0000-4000-8000-000000000001','owner'),
 ('20000000-0000-4000-8000-000000000003','product_manager'),
 ('20000000-0000-4000-8000-000000000004','analyst');
insert into public.products(id,name,slug,description,status) values
 ('10000000-0000-4000-8000-000000000001','Basic draft','test-generic-draft','Original notes','draft'),
 ('10000000-0000-4000-8000-000000000002','Published item','test-generic-published','','published'),
 ('10000000-0000-4000-8000-000000000003','Archived item','test-generic-archived','','archived'),
 ('10000000-0000-4000-8000-000000000004','Intake item','test-generic-intake','','draft');
insert into public.thrift_intake(source_id,product_id,image_path,image_sha256,price_minor)
 values('AA-SHIRT-888','10000000-0000-4000-8000-000000000004','/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',md5('local-generic-fixture')||md5('sha-tail'),55000);
create table test.generic_versions as select updated_at from public.products where id='10000000-0000-4000-8000-000000000001';
grant select on test.generic_versions to authenticated;
set local role anon;
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',now(),'Denied','')$q$,'42501','anonymous cannot invoke draft update');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal2","user_metadata":{"role":"owner"}}',true);
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',now(),'Denied','')$q$,'42501','customer metadata cannot grant draft editing');
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal2"}',true);
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',now(),'Denied','')$q$,'42501','analyst cannot edit generic drafts');
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',now(),'Denied','')$q$,'42501','Owner still requires MFA');
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',(select updated_at from test.generic_versions),'  Saved draft  ','Saved details');
select test.assert_true((select name='Saved draft' and description='Saved details' and status='draft' and slug='test-generic-draft' and category_id is null from public.products where id='10000000-0000-4000-8000-000000000001'),'only intended draft metadata changes');
select test.assert_true((select count(*)=1 from public.admin_audit_logs where target_id='10000000-0000-4000-8000-000000000001' and action='product.draft_updated' and actor_id='20000000-0000-4000-8000-000000000001' and changes->'before'->>'description'='Original notes' and changes->'after'->>'description'='Saved details'),'draft update records actual actor and before/after audit');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',(select updated_at from test.generic_versions),'Overwrite','')$q$,'PT409','stale write cannot overwrite another editor');
select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),'Saved draft','Saved details');
select test.assert_true((select count(*)=1 from public.admin_audit_logs where target_id='10000000-0000-4000-8000-000000000001'),'unchanged payload does not create duplicate audit rows');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000002',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000002'),'Changed published','')$q$,'22023','published product edits require a separate workflow');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000003',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000003'),'Changed archived','')$q$,'22023','archived product stays archived');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000004',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000004'),'Changed intake','')$q$,'22023','intake cannot bypass its dedicated audit and verification workflow');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),' ', '')$q$,'22023','blank name rejected');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',now(),E'\t', '')$q$,'22023','whitespace-only direct RPC name rejected');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',null,'Valid', '')$q$,'22023','missing version rejected');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',now(),'Valid',repeat('x',20001))$q$,'22023','oversized description rejected');
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000099',now(),'Valid','')$q$,'22023','nonexistent product rejected');
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}',true);
select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),'Manager saved draft','Manager details');
select test.assert_true((select count(*)=1 from public.admin_audit_logs where target_id='10000000-0000-4000-8000-000000000001' and actor_id='20000000-0000-4000-8000-000000000003'),'product manager has audited edit permission');
reset role;
create function test.reject_generic_audit() returns trigger language plpgsql as $$begin if new.action='product.draft_updated' then raise exception 'Injected audit failure' using errcode='23514'; end if; return new; end$$;
create trigger reject_generic_audit before insert on public.admin_audit_logs for each row execute function test.reject_generic_audit();
set local role authenticated;
select test.denied($q$select public.admin_update_product_draft('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),'Must roll back','Failed audit')$q$,'23514','audit failure aborts the mutation');
select test.assert_true((select name='Manager saved draft' and description='Manager details' from public.products where id='10000000-0000-4000-8000-000000000001'),'audit failure leaves previous draft unchanged');
reset role;
drop trigger reject_generic_audit on public.admin_audit_logs;
