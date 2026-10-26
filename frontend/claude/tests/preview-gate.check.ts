import {afterEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {proxy} from '../src/proxy';
afterEach(()=>vi.unstubAllEnvs());
describe('sample preview access gate',async()=>{
 it('is disabled without the explicit preview flag',async()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW',undefined);expect((await proxy()).status).toBe(404);});
 it('is disabled in Vercel production even with the flag',async()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','production');expect((await proxy()).status).toBe(404);});
 it('permits explicitly enabled non-production design review',async()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','preview');expect((await proxy()).status).toBe(200);});
});

it('returns a non-streamed 404 for unpublished items without exposing draft details',async()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','preview');for(const key of ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])vi.stubEnv(key,'');const response=await proxy(new NextRequest('https://preview.example/product/does-not-exist'));expect(response.status).toBe(404);expect(response.headers.get('Cache-Control')).toBe('no-store');expect(await response.text()).toContain('Page not found');});
