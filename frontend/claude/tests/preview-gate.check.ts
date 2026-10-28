import {afterEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {proxy} from '../src/proxy';
afterEach(()=>vi.unstubAllEnvs());
describe('storefront environment boundary',()=>{
 it('keeps non-production design review opt-in',async()=>{vi.stubEnv('VERCEL_ENV','preview');vi.stubEnv('CLAUDE_DESIGN_PREVIEW',undefined);expect((await proxy()).status).toBe(404);});
 it.each([undefined,'1'])('opens Production independently of the review flag (%s)',async flag=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW',flag);vi.stubEnv('VERCEL_ENV','production');expect((await proxy(new NextRequest('https://www.attiresarena.com/'))).status).toBe(200);});
 it('permits explicitly enabled Preview review',async()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','preview');expect((await proxy()).status).toBe(200);});
 it.each(['/motion-preview','/loader-preview','/motion-preview/nested'])('blocks experiment route %s in Production',async path=>{vi.stubEnv('VERCEL_ENV','production');vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');expect((await proxy(new NextRequest('https://www.attiresarena.com'+path))).status).toBe(404);});
});
it('returns a non-streamed 404 for unknown products without exposing draft details',async()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','preview');for(const key of ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])vi.stubEnv(key,'');const response=await proxy(new NextRequest('https://preview.example/product/does-not-exist'));expect(response.status).toBe(404);expect(response.headers.get('Cache-Control')).toBe('no-store');expect(await response.text()).toContain('Page not found');});
