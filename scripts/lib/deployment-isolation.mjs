// Operator-only preflight. Never import into the application bundle.
import { readFile } from 'node:fs/promises';
const project = 'prj_QgA6P7BJr74v5GbojhBXyxkXRZAA';
const team = 'team_7KAKEOgqI7HTogjNKjt2yg2h';
export function assertIsolatedBindings(domains, bindings, databaseOrigin) {
  // An operation must match the explicitly configured Preview target, not just
  // be different from Production. Never infer safety from a project's name.
  const urls=bindings.filter(e=>/(^|_)SUPABASE_URL$/.test(e.key));
  const production=urls.filter(e=>e.target?.includes('production'));
  const preview=urls.filter(e=>e.target?.includes('preview'));
  function origin(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.origin:null;}catch{return null;}}
  if(!production.length||!preview.length||[...production,...preview].some(e=>!origin(e.value)))
    throw new Error('Cannot verify production and Preview database isolation; remote mutations are blocked.');
  const target=origin(databaseOrigin);
  if(!target)throw new Error('Invalid database target');
  if(production.some(e=>origin(e.value)===target))
    throw new Error('Production and staging share Supabase. Remote mutations are blocked.');
  if(preview.some(e=>e.gitBranch&&e.gitBranch!=='feature/claude-frontend-integration'))
    throw new Error('Unexpected branch-specific Preview binding; remote mutations blocked.');
  if(preview.some(e=>origin(e.value)!==target))
    throw new Error('Database target does not match every applicable Preview binding; remote mutations blocked.');
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

  const env = await get(`/v10/projects/${project}/env?decrypt=true`);
  if (env.pagination?.next) throw new Error('Incomplete environment inspection; remote mutations blocked.');
  // Sensitive variables remain unreadable. URLs may be encrypted but are public
  // configuration: read their individual decrypted records, never keys.
  const bindings=[];
  for(const e of env.envs.filter(e=>/(^|_)SUPABASE_URL$/.test(e.key))){
    const detail=await get(`/v1/projects/${project}/env/${e.id}?decrypt=true`);
    bindings.push({...e,value:detail.value});
  }
  assertIsolatedBindings(domains.domains, bindings, databaseOrigin);
}
