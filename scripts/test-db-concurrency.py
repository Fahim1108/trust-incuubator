"""Exercise the inventory RPC from two independent PostgreSQL connections."""
import subprocess
import sys
import time

container = sys.argv[1]
base = ['docker', 'exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-Atq']

def query(sql):
    return subprocess.run(base, input=sql, text=True, capture_output=True, check=True).stdout.strip()

query("""
insert into auth.users(id) values ('00000000-0000-0000-0000-000000000003');
insert into public.user_roles(user_id,role) values ('00000000-0000-0000-0000-000000000003','product_manager');
insert into public.products(id,name,slug) values ('10000000-0000-0000-0000-000000000001','Concurrency fixture','concurrency-fixture');
insert into public.product_variants(id,product_id,sku,size,color,price_minor) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','CONCURRENT','M','Black',10000);
insert into public.inventory(variant_id,on_hand) values ('20000000-0000-0000-0000-000000000001',1);
""")
worker = """
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
select public.adjust_inventory('20000000-0000-0000-0000-000000000001',-1,'Concurrent adjustment');
"""
first = subprocess.Popen(base, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
first.stdin.write("set application_name='attire_inventory_first';\n" + worker + 'select pg_sleep(4); commit;\n')
first.stdin.close()
first.stdin = None
second = None
try:
    deadline = time.monotonic() + 15
    while query("select count(*) from pg_stat_activity where application_name='attire_inventory_first' and wait_event='PgSleep';") != '1':
        if first.poll() is not None or time.monotonic() > deadline:
            raise AssertionError('First transaction did not acquire and hold the stock row')
        time.sleep(0.05)
    second = subprocess.Popen(base, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    second.stdin.write("set application_name='attire_inventory_second';\n" + worker + 'commit;\n')
    second.stdin.close()
    second.stdin = None
    while query("select count(*) from pg_stat_activity where application_name='attire_inventory_second' and wait_event_type='Lock';") != '1':
        if second.poll() is not None or time.monotonic() > deadline:
            raise AssertionError('Second transaction did not wait for the inventory row lock')
        time.sleep(0.05)
    _, first_error = first.communicate(timeout=15)
    _, second_error = second.communicate(timeout=15)
    assert first.returncode == 0, first_error
    assert second.returncode != 0 and '22023' in second_error and 'insufficient unreserved stock' in second_error, second_error
    assert query('select on_hand from public.inventory;') == '0'
    assert query('select count(*) from public.inventory_movements;') == '1'
    print('PASS: concurrent stock adjustments serialize; exactly one succeeds, one fails, stock stays zero and one movement is recorded')
finally:
    for process in (first, second):
        if process is not None and process.poll() is None:
            process.kill()
            process.wait()
