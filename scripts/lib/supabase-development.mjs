import { assertRemoteDatabaseIsolation } from './deployment-isolation.mjs';
// Guard every hosted verification operation to the explicitly authorized development project.
import projects from '../../frontend/claude/src/config/supabase-projects.json' with {type:'json'};
export const projectRef = projects.staging;
export const projectUrl = `https://${projectRef}.supabase.co`;
export function requireDevelopmentConfiguration() {
  if(projectRef===projects.production)throw new Error('Refusing Production as a staging target');
  if(process.env.SUPABASE_STAGING_URL&&process.env.SUPABASE_STAGING_URL.replace(/\/$/,'')!==projectUrl)
    throw new Error('Explicit staging URL does not match the verified project');
  if(!process.env.SUPABASE_ACCESS_TOKEN)throw new Error('Missing staging-authorized SUPABASE_ACCESS_TOKEN');
}
export async function management(path, { method = 'GET', body } = {}) {
  requireDevelopmentConfiguration();
  if(method!=='GET'&&!(path==='/database/query'&&body?.read_only===true))await assertRemoteDatabaseIsolation(projectUrl);
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}${path}`, {
    method, headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    let permissionMessage='';
    try {
      const body=await response.json();
      if(typeof body.message==='string'){
        const match=body.message.match(/^Missing required permission\(s\): ([a-z_, ]+)$/);
        const known=match?.[1].split(/[, ]+/).filter(p=>['auth_config_read','api_gateway_keys_read'].includes(p));
        if(known?.length)permissionMessage='; Missing required permission(s): '+known.join(', ');
      }
    }catch { /* Never log arbitrary provider responses or credentials. */ }
    throw new Error(`Staging management request failed: HTTP ${response.status}${permissionMessage}`);
  }
  const text = await response.text(); return text ? JSON.parse(text) : null;
}
export async function query(sql, readOnly = true) {
  return management('/database/query', { method: 'POST', body: { query: sql, read_only: readOnly } });
}
export function literal(value) { return "'" + String(value).replaceAll("'", "''") + "'"; }
export function uuid(value) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid fixture UUID');
  return literal(value);
}
export async function getTestAdminKey() {
  await assertRemoteDatabaseIsolation(projectUrl);
  const supplied=[process.env.SUPABASE_STAGING_SECRET_KEY,process.env.SUPABASE_STAGING_SERVICE_ROLE_KEY].filter(Boolean);
  if(new Set(supplied).size>1)throw new Error('Conflicting staging-only test administrator keys');
  if(supplied.length)return validateStagingTestSecret(supplied[0]);
  const keys = await management('/api-keys?reveal=true');
  const key = keys.find(item => item.name === 'service_role' || item.type === 'secret');
  if (!key?.api_key) throw new Error('An authorized test-only admin key is unavailable');
  return validateStagingTestSecret(key.api_key); // Operator-only in-memory verification; never application configuration.
}

export async function getStagingPublishableKey(){
  requireDevelopmentConfiguration();
  if(process.env.SUPABASE_STAGING_PUBLISHABLE_KEY)return validateStagingPublicKey(process.env.SUPABASE_STAGING_PUBLISHABLE_KEY);
  const keys=await management('/api-keys?reveal=true');
  const key=keys.find(k=>k.type==='publishable'||k.name==='anon');
  if(!key?.api_key)throw new Error('Staging publishable key is unavailable');
  return validateStagingPublicKey(key.api_key);
}

function validateStagingPublicKey(key){
 if(key.startsWith('sb_publishable_'))return key;
 try {const claims=JSON.parse(Buffer.from(key.split('.')[1]||'','base64url').toString());
  if(claims.role==='anon'&&(!claims.ref||claims.ref===projectRef))return key;
 }catch { /* Reject invalid and privileged credentials. */ }
 throw new Error('A staging publishable/anon key is required; privileged or foreign-project keys are rejected');
}

/** Classification only: the fixed staging gateway verifies key authenticity. */
export function validateStagingTestSecret(key){
 if(/^sb_secret_[A-Za-z0-9_-]+$/.test(key))return key;
 try {
  const claims=JSON.parse(Buffer.from(key.split('.')[1]||'','base64url').toString());
  if(claims.role==='service_role'&&claims.ref===projectRef)return key;
 }catch { /* Never include the supplied key in an error. */ }
 throw new Error('Use a staging-only secret or matching service-role key for temporary verification; never a Production or publishable key');
}
