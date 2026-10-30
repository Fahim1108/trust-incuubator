"""Two real local PostgreSQL sessions; simulated Auth claims, no remote access."""
import subprocess
import sys
import time

container = sys.argv[1]
base = ['docker', 'exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-Atq']

def query(sql):
    return subprocess.run(base, input=sql, text=True, capture_output=True, check=True).stdout.strip()

query("""
insert into auth.users(id,email,email_confirmed_at) values ('30000000-0000-4000-8000-000000000001','concurrent-draft@example.invalid',now());
insert into public.user_roles(user_id,role) values ('30000000-0000-4000-8000-000000000001','product_manager');
insert into public.products(id,name,slug) values ('40000000-0000-4000-8000-000000000001','Concurrent draft','generic-concurrent-draft');
""")
version = query("select updated_at from public.products where id='40000000-0000-4000-8000-000000000001'")
worker = """
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claim','',true);
select set_config('request.jwt.claims','{"sub":"30000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select public.admin_update_product_draft('40000000-0000-4000-8000-000000000001','VERSION','NAME','Concurrent details');
""".replace('VERSION', version)
first = subprocess.Popen(base, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
first.stdin.write("set application_name='attire_draft_first';\n" + worker.replace('NAME', 'First editor') + 'select pg_sleep(4); commit;\n')
first.stdin.close()
first.stdin = None
second = None
try:
    deadline = time.monotonic() + 15
    while query("select count(*) from pg_stat_activity where application_name='attire_draft_first' and wait_event='PgSleep'") != '1':
        if first.poll() is not None or time.monotonic() > deadline:
            raise AssertionError('First draft transaction did not acquire and hold the row')
        time.sleep(0.05)
    second = subprocess.Popen(base, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    second.stdin.write("set application_name='attire_draft_second';\n" + worker.replace('NAME', 'Second editor') + 'commit;\n')
    second.stdin.close()
    second.stdin = None
    while query("select count(*) from pg_stat_activity where application_name='attire_draft_second' and wait_event_type='Lock'") != '1':
        if second.poll() is not None or time.monotonic() > deadline:
            raise AssertionError('Second draft editor did not wait for the row lock')
        time.sleep(0.05)
    _, first_error = first.communicate(timeout=15)
    _, second_error = second.communicate(timeout=15)
    assert first.returncode == 0, first_error
    assert second.returncode != 0 and 'PT409' in second_error, second_error
    assert query("select name from public.products where id='40000000-0000-4000-8000-000000000001'") == 'First editor'
    assert query("select count(*) from public.admin_audit_logs where target_id='40000000-0000-4000-8000-000000000001'") == '1'
    print('PASS: overlapping draft edits serialize; stale waiting editor gets PT409; winning values and one audit row persist')
finally:
    for process in (first, second):
        if process is not None and process.poll() is None:
            process.kill()
            process.wait()
