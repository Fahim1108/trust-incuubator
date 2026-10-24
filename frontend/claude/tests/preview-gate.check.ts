import {afterEach,describe,expect,it,vi} from 'vitest';
import {proxy} from '../src/proxy';
afterEach(()=>vi.unstubAllEnvs());
describe('sample preview access gate',()=>{
 it('is disabled without the explicit preview flag',()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW',undefined);expect(proxy().status).toBe(404);});
 it('is disabled in Vercel production even with the flag',()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','production');expect(proxy().status).toBe(404);});
 it('permits explicitly enabled non-production design review',()=>{vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','preview');expect(proxy().status).toBe(200);});
});
