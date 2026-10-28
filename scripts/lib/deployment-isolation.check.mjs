import test from 'node:test';
import assert from 'node:assert/strict';
import { assertIsolatedBindings } from './deployment-isolation.mjs';
const domains = [{ name: 'www.attiresarena.com' }];
const origin = 'https://staging.supabase.co';
const binding = (value, target = ['production']) => ({ key: 'SUPABASE_URL', value, target });
test('blocks the current shared Preview/Production database', () => {
  assert.throws(() => assertIsolatedBindings(domains, [binding(origin, ['preview', 'production'])], origin), /share Supabase/);
});
test('blocks identical origins with different trailing slashes', () => {
  assert.throws(() => assertIsolatedBindings(domains, [binding(origin + '/')], origin), /share Supabase/);
});
test('allows a separately configured staging database', () => {
  assert.doesNotThrow(() => assertIsolatedBindings(domains, [binding('https://production.supabase.co'), binding(origin, ['preview'])], origin));
});
test('fails closed when production binding is absent or unreadable', () => {
  for (const bindings of [[], [binding(undefined)]]) assert.throws(() => assertIsolatedBindings(domains, bindings, origin), /Cannot verify/);
});
test('recognizes public Supabase URL bindings and apex domain', () => {
  assert.throws(() => assertIsolatedBindings([{name:'attiresarena.com'}], [{...binding(origin),key:'NEXT_PUBLIC_SUPABASE_URL'}], origin), /share Supabase/);
});
test('a preview-only project without the live domain is permitted', () => {
  assert.doesNotThrow(() => assertIsolatedBindings([{name:'example.vercel.app'}], [], origin));
});
