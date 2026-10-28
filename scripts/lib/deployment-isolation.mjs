// Operator-only preflight. Never import into the application bundle.
import { readFile } from 'node:fs/promises';
const project = 'prj_QgA6P7BJr74v5GbojhBXyxkXRZAA';
const team = 'team_7KAKEOgqI7HTogjNKjt2yg2h';
export function assertIsolatedBindings(domains, bindings, databaseOrigin) {
  if (!domains.some(d => /(^|\.)attiresarena\.com$/i.test(d.name))) return;
  const urls = bindings.filter(e => /(^|_)SUPABASE_URL$/.test(e.key));
  const production = urls.filter(e => e.target?.includes('production'));
  if (!production.length || production.some(e => !e.value)) {
    throw new Error('Cannot verify production database isolation; remote mutations are blocked.');
  }
  const origin = new URL(databaseOrigin).origin;
  if (production.some(e => new URL(e.value).origin === origin)) {
    throw new Error('Production and staging share Supabase. Remote mutations and this admin release are blocked until an isolated staging database is configured.');
  }
}
export async function assertRemoteDatabaseIsolation(databaseOrigin) {
  const token = process.env.VERCEL_DEPLOY_TOKEN || JSON.parse(await readFile(
    process.env.VERCEL_AUTH_FILE || '/workspace/.vercel-cli-attires/auth.json', 'utf8'
  )).token;
  async function get(path) {
    const response = await fetch(`https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${team}`, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Cannot verify production isolation (HTTP ${response.status}); remote mutations blocked.`);
    return response.json();
  }
  const domains = await get(`/v9/projects/${project}/domains`);
  if (domains.pagination?.next) throw new Error('Incomplete domain inspection; remote mutations blocked.');
  if (!domains.domains.some(d => /(^|\.)attiresarena\.com$/i.test(d.name))) return;
  const env = await get(`/v10/projects/${project}/env?decrypt=true`);
  if (env.pagination?.next) throw new Error('Incomplete environment inspection; remote mutations blocked.');
  assertIsolatedBindings(domains.domains, env.envs, databaseOrigin);
}
