// Real local GoTrue + PostgREST tests. Refuses hosted endpoints and never prints keys.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const cli = process.env.SUPABASE_CLI;
if (!cli) { console.error('Set SUPABASE_CLI to the installed CLI executable; start the documented disposable local project first.'); process.exit(2); }
let status;
try { status = JSON.parse(execFileSync(cli, ['status', '--workdir', '/tmp/attire-supabase-verification', '--output', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })); }
catch { console.error('Local Supabase status unavailable; integration tests did not run.'); process.exit(2); }
const url = new URL(status.API_URL);
assert(['127.0.0.1', 'localhost'].includes(url.hostname) && url.port === '54321', 'Refusing a nonlocal test destination');
const publicKey = status.PUBLISHABLE_KEY || status.ANON_KEY;
const secretKey = status.SECRET_KEY || status.SERVICE_ROLE_KEY;
assert(publicKey && secretKey, 'Local API keys are required');
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const client = () => createClient(url.origin, publicKey, options);
const admin = createClient(url.origin, secretKey, options);
const sql = (command) => execFileSync('docker', ['exec', '-i', 'supabase_db_attire-supabase-verification', 'psql', '-X', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-Atq'], { input: command, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
let passed = 0;
function pass(label) { passed++; console.log(`PASS: ${label}`); }
function noError(result) { assert.equal(result.error, null, 'Unexpected Supabase error (details withheld)'); return result.data; }
function denied(result) { assert(result.error, 'An unauthorized operation unexpectedly succeeded'); }
const users = [];
const product = randomUUID(), variant = randomUUID();
const suffix = randomUUID().replaceAll('-', '');
const trigger = `reject_${suffix}`;
const password = randomBytes(32).toString('base64url');
async function confirmedAccount() {
  const email = `security-${randomUUID()}@example.invalid`;
  const user = noError(await admin.auth.admin.createUser({ email, password, email_confirm: true })).user;
  users.push(user.id);
  const sessionClient = client();
  noError(await sessionClient.auth.signInWithPassword({ email, password }));
  return { email, user, sessionClient };
}
try {
  const firstClient = client();
  const firstEmail = `security-${randomUUID()}@example.invalid`;
  const signup = noError(await firstClient.auth.signUp({ email: firstEmail, password, options: { data: { role: 'owner', is_admin: true } } }));
  assert(signup.user); users.push(signup.user.id);
  assert.equal(signup.session, null, 'Email confirmation must be enabled for this test project');
  denied(await firstClient.auth.signInWithPassword({ email: firstEmail, password }));
  pass('real Auth registration requires email confirmation');
  // Test fixture confirmation via LOCAL admin API, not a production/email delivery test.
  noError(await admin.auth.admin.updateUserById(signup.user.id, { email_confirm: true }));
  noError(await firstClient.auth.signInWithPassword({ email: firstEmail, password }));
  const second = await confirmedAccount();
  const owner = await confirmedAccount();
  const analyst = await confirmedAccount();
  assert.match(signup.user.id, /^[0-9a-f-]{36}$/);
  const firstProfile = noError(await firstClient.from('profiles').select('id'));
  assert.deepEqual(firstProfile.map(x => x.id), [signup.user.id]);
  assert.equal(noError(await firstClient.from('profiles').select('id').eq('id', second.user.id)).length, 0);
  pass('real signed customer sessions see only their own profiles');
  assert.equal(noError(await firstClient.from('user_roles').select('*')).length, 0);
  denied(await firstClient.from('user_roles').insert({ user_id: signup.user.id, role: 'owner' }));
  denied(await firstClient.rpc('provision_owner', { target_user: signup.user.id, expected_email: firstEmail, provisioning_reason: 'Self provisioning attempt' }));
  pass('real registration metadata cannot grant owner and public owner provisioning is unavailable');
  sql(`select private.provision_owner('${owner.user.id}', '${owner.email}', 'Approved disposable integration fixture');
    insert into public.user_roles(user_id,role) values ('${analyst.user.id}','analyst');
    insert into public.products(id,name,slug,status) values ('${product}','Integration fixture','test-${suffix}','draft');
    insert into public.product_variants(id,product_id,sku,size,color,price_minor,active) values ('${variant}','${product}','test-${suffix}','M','Black',10000,true);
    insert into public.inventory(variant_id,on_hand) values ('${variant}',1);`);
  const anonymous = client();
  assert.equal(noError(await anonymous.from('products').select('id').eq('id', product)).length, 0);
  denied(await anonymous.from('profiles').select('id'));
  assert.equal(noError(await analyst.sessionClient.from('products').select('id').eq('id', product)).length, 1);
  pass('real PostgREST roles enforce published-only catalogue and staff draft reads');
  denied(await firstClient.from('product_variants').update({ price_minor: 1 }).eq('id', variant));
  denied(await firstClient.from('inventory').update({ on_hand: 100 }).eq('variant_id', variant));
  denied(await firstClient.rpc('adjust_inventory', { target_variant: variant, quantity_delta: -1, adjustment_reason: 'Unauthorized attempt' }));
  denied(await analyst.sessionClient.rpc('adjust_inventory', { target_variant: variant, quantity_delta: -1, adjustment_reason: 'Unauthorized attempt' }));
  pass('real customer and analyst sessions cannot mutate prices or inventory');
  const results = await Promise.all([1, 2].map(() => owner.sessionClient.rpc('adjust_inventory', { target_variant: variant, quantity_delta: -1, adjustment_reason: 'Concurrent API adjustment' })));
  assert.equal(results.filter(x => !x.error).length, 1);
  assert.equal(results.filter(x => x.error?.code === '22023').length, 1);
  assert.equal(noError(await owner.sessionClient.from('inventory').select('on_hand').eq('variant_id', variant).single()).on_hand, 0);
  pass('real concurrent PostgREST adjustments commit once without negative stock');
  sql(`create function private.${trigger}() returns trigger language plpgsql as $$ begin raise exception 'Test failure' using errcode='23514'; end $$;
    create trigger ${trigger} before insert on public.inventory_movements for each row execute function private.${trigger}();`);
  const rollback = await owner.sessionClient.rpc('adjust_inventory', { target_variant: variant, quantity_delta: 2, adjustment_reason: 'Rollback integration test' });
  assert.equal(rollback.error?.code, '23514');
  assert.equal(noError(await owner.sessionClient.from('inventory').select('on_hand').eq('variant_id', variant).single()).on_hand, 0);
  pass('real RPC ledger failure rolls back stock');
  noError(await firstClient.auth.refreshSession());
  assert.equal(noError(await firstClient.auth.getUser()).user.id, signup.user.id);
  const session = noError(await firstClient.auth.getSession()).session;
  const parts = session.access_token.split('.'); parts[2] = 'AAAA' + parts[2].slice(4);
  denied(await firstClient.auth.getUser(parts.join('.')));
  pass('real Auth refresh works and forged JWT signatures are rejected');
  sql(`delete from public.user_roles where user_id='${owner.user.id}' and role='owner';`);
  denied(await owner.sessionClient.rpc('adjust_inventory', { target_variant: variant, quantity_delta: 1, adjustment_reason: 'Revoked role test' }));
  pass('database role revocation applies without waiting for JWT expiry');
  noError(await firstClient.auth.signOut());
  assert.equal(noError(await firstClient.auth.getSession()).session, null);
  pass('real Auth logout clears the client session');
  console.log(`${passed} real local Supabase integration scenarios passed. Hosted/Next.js browser flows remain unverified.`);
} finally {
  sql(`drop trigger if exists ${trigger} on public.inventory_movements; drop function if exists private.${trigger}();
    delete from public.inventory_movements where variant_id='${variant}'; delete from public.inventory where variant_id='${variant}';
    delete from public.product_variants where id='${variant}'; delete from public.products where id='${product}';`);
  for (const id of users) noError(await admin.auth.admin.deleteUser(id));
}
