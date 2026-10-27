-- Simulated claims only. Run in disposable PostgreSQL alongside foundation helpers.
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
select test.denied('select public.admin_catalogue_snapshot()','42501','anonymous admin snapshot denied');
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000009","role":"authenticated","aal":"aal1"}',true);
select test.denied('select public.admin_catalogue_snapshot()','42501','owner needs MFA');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000011","role":"authenticated","aal":"aal2"}',true);
select test.denied('select public.admin_catalogue_snapshot()','42501','MFA customer cannot read admin snapshot');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000009","role":"authenticated","aal":"aal2"}',true);
select test.assert_true(jsonb_array_length(public.admin_catalogue_snapshot()->'items')>=18,'MFA owner sees actual intake');
select public.admin_save_thrift_draft(p.id,p.updated_at,'{"name":"Admin SQL test draft","description":"Original photo preserved","price_minor":55000,"stock_quantity":1,"actual_size":"","actual_color":""}') from public.products p join public.thrift_intake i on i.product_id=p.id where i.source_id='AA-SHIRT-018';
select test.assert_true((select count(*)=1 from public.admin_audit_logs where action='thrift.draft_saved'),'draft save audited');
select test.assert_true((select p.status='draft' and i.actual_size is null and not i.size_verified from public.products p join public.thrift_intake i on p.id=i.product_id where i.source_id='AA-SHIRT-018'),'unknown size stays blank and unpublished');
select test.denied($q$select public.admin_save_thrift_draft(p.id,'2000-01-01'::timestamptz,'{"name":"stale","description":"","price_minor":50000,"stock_quantity":1}') from public.products p join public.thrift_intake i on p.id=i.product_id where i.source_id='AA-SHIRT-018'$q$,'PT409','stale editor cannot overwrite');
select test.denied($q$select public.admin_save_thrift_draft(p.id,p.updated_at,'{"name":"invalid","description":"","price_minor":1,"stock_quantity":2}') from public.products p join public.thrift_intake i on p.id=i.product_id where i.source_id='AA-SHIRT-018'$q$,'22023','intake cannot invent quantity');
select test.denied('insert into public.admin_audit_logs(actor_id,action,target_id,changes) values(auth.uid(),''forged'',gen_random_uuid(),''{}'')','42501','staff cannot forge audit logs');
reset role;
-- Force audit failure and verify transactional rollback.
create function test.reject_admin_audit() returns trigger language plpgsql as $$begin raise exception 'Injected audit failure' using errcode='23514';end $$;
create trigger test_admin_audit_failure before insert on public.admin_audit_logs for each row execute function test.reject_admin_audit();
set local role authenticated;
select test.denied($q$select public.admin_save_thrift_draft(p.id,p.updated_at,'{"name":"must rollback","description":"","price_minor":1,"stock_quantity":0}') from public.products p join public.thrift_intake i on p.id=i.product_id where i.source_id='AA-SHIRT-018'$q$,'23514','audit failure rolls back draft write');
select test.assert_true((select p.name='Admin SQL test draft' and i.price_minor=55000 and i.stock_quantity=1 from public.products p join public.thrift_intake i on p.id=i.product_id where i.source_id='AA-SHIRT-018'),'audit failure preserves original draft');
reset role;
drop trigger test_admin_audit_failure on public.admin_audit_logs;
