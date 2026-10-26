-- Included within the disposable foundation test transaction. This orders table
-- is an isolated test double, never a deployment migration or a real order claim.
reset role;
select test.denied($q$select private.assign_customer_order_number(null)$q$,'22023','numeric reference requires an order UUID');
select test.denied($q$select private.assign_customer_order_number('70000000-0000-0000-0000-000000000001')$q$,'55000','missing real order service cannot mint references');
select test.assert_true((select count(*)=0 from private.customer_order_numbers),'missing order service leaves reference ledger empty');
create table public.orders(id uuid primary key);
alter table public.orders enable row level security;
insert into public.orders(id) values
 ('70000000-0000-0000-0000-000000000001'),
 ('70000000-0000-0000-0000-000000000002'),
 ('70000000-0000-0000-0000-000000000003'),
 ('70000000-0000-0000-0000-000000000004');
select test.denied($q$select private.assign_customer_order_number('70000000-0000-0000-0000-000000000099')$q$,'22023','nonexistent order cannot mint references');
select test.assert_true(private.assign_customer_order_number('70000000-0000-0000-0000-000000000001')=10000,'server assigns first five-digit reference');
select test.assert_true(private.assign_customer_order_number('70000000-0000-0000-0000-000000000001')=10000,'reference remains identical on retries');
select test.assert_true((select count(*)=1 from private.customer_order_numbers),'retries create one reference only');
-- Rewind the disposable test sequence to simulate an inconsistent restore.
select setval('private.customer_order_number_sequence',10000,false);
select test.assert_true(private.assign_customer_order_number('70000000-0000-0000-0000-000000000002')=10001,'sequence collision skips already assigned reference safely');
select test.denied($q$insert into private.customer_order_numbers(order_id,customer_number) values ('70000000-0000-0000-0000-000000000003',10001)$q$,'23505','database rejects duplicate numeric references');
select setval('private.customer_order_number_sequence',99999,false);
select test.assert_true(private.assign_customer_order_number('70000000-0000-0000-0000-000000000003')=99999,'last five-digit reference can be assigned');
select test.denied($q$select private.assign_customer_order_number('70000000-0000-0000-0000-000000000004')$q$,'54000','namespace exhaustion fails closed instead of wrapping/reusing references');
select test.assert_true((select count(*)=3 from private.customer_order_numbers),'exhaustion does not create a false reference');
set local role anon;
select test.denied('select * from private.customer_order_numbers','42501','anonymous cannot read private numeric reference mappings');
select test.denied($q$select private.assign_customer_order_number('70000000-0000-0000-0000-000000000001')$q$,'42501','anonymous cannot generate numeric references');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000005',true);
select test.denied('select * from private.customer_order_numbers','42501','even owner JWT cannot enumerate private reference mappings');
select test.denied($q$select private.assign_customer_order_number('70000000-0000-0000-0000-000000000001')$q$,'42501','even owner JWT cannot bypass future trusted order service');
select test.denied($q$select nextval('private.customer_order_number_sequence')$q$,'42501','authenticated callers cannot exhaust the order-number sequence');
reset role;
-- Fixture is removed by the outer transaction rollback.
