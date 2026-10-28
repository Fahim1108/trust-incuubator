import { assertRemoteDatabaseIsolation } from './deployment-isolation.mjs';
// Guard every hosted verification operation to the explicitly authorized development project.
export const projectRef = 'euoannuvovsbwxjqnriw';
export const projectUrl = `https://${projectRef}.supabase.co`;
export function requireDevelopmentConfiguration() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') !== projectUrl) throw new Error('Refusing a different project origin');
  for (const name of ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ACCESS_TOKEN']) {
    if (!process.env[name]) throw new Error(`Missing required binding: ${name}`);
  }
}
export async function management(path, { method = 'GET', body } = {}) {
  requireDevelopmentConfiguration();
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}${path}`, {
    method, headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Development management request failed: HTTP ${response.status}`);
  const text = await response.text(); return text ? JSON.parse(text) : null;
}
export async function query(sql, readOnly = true) {
  if (!readOnly) await assertRemoteDatabaseIsolation(projectUrl);
  return management('/database/query', { method: 'POST', body: { query: sql, read_only: readOnly } });
}
export function literal(value) { return "'" + String(value).replaceAll("'", "''") + "'"; }
export function uuid(value) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid fixture UUID');
  return literal(value);
}
export async function getTestAdminKey() {
  await assertRemoteDatabaseIsolation(projectUrl);
  const keys = await management('/api-keys?reveal=true');
  const key = keys.find(item => item.name === 'service_role' || item.type === 'secret');
  if (!key?.api_key) throw new Error('An authorized test-only admin key is unavailable');
  return key.api_key; // In-memory test use only. Never put this key in app configuration or reports.
}
