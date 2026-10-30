import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {publicSupabaseConfiguration} from '@/lib/supabase-public';
import projects from '@/config/supabase-projects.json';
beforeEach(()=>{vi.stubEnv('SUPABASE_PUBLISHABLE_KEY','sb_publishable_unit_fixture');vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','');});
afterEach(()=>vi.unstubAllEnvs());
it('accepts only the staging URL in Vercel Preview',()=>{vi.stubEnv('VERCEL_ENV','preview');vi.stubEnv('SUPABASE_URL',`https://${projects.staging}.supabase.co`);expect(publicSupabaseConfiguration()).not.toBeNull();vi.stubEnv('SUPABASE_URL',`https://${projects.production}.supabase.co`);expect(publicSupabaseConfiguration()).toBeNull();});
it('preserves only the existing Production URL in Production',()=>{vi.stubEnv('VERCEL_ENV','production');vi.stubEnv('SUPABASE_URL',`https://${projects.production}.supabase.co`);expect(publicSupabaseConfiguration()).not.toBeNull();vi.stubEnv('SUPABASE_URL',`https://${projects.staging}.supabase.co`);expect(publicSupabaseConfiguration()).toBeNull();});
it('rejects privileged credentials in either environment',()=>{for(const env of ['production','preview']){vi.stubEnv('VERCEL_ENV',env);vi.stubEnv('SUPABASE_URL',`https://${env==='production'?projects.production:projects.staging}.supabase.co`);vi.stubEnv('SUPABASE_PUBLISHABLE_KEY','sb_secret_forbidden');expect(publicSupabaseConfiguration()).toBeNull();}});
it('rejects an unrelated project rather than accepting arbitrary environment configuration',()=>{vi.stubEnv('VERCEL_ENV','preview');vi.stubEnv('SUPABASE_URL','https://unrelated.supabase.co');expect(publicSupabaseConfiguration()).toBeNull();});
