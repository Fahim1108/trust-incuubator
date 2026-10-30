import {describe,it,expect} from 'vitest';
import {setupFragment,setupPasswordSchema} from '../src/lib/admin/setup-validation';
describe('staging invitation setup',()=>{
 it('requires a recognized invitation/recovery and both credentials',()=>{
  expect(setupFragment('#type=invite&access_token=short')).toBeNull();
  expect(setupFragment('#type=signup&access_token='+ 'a'.repeat(40)+'&refresh_token='+'b'.repeat(40))).toBeNull();
  expect(setupFragment('#type=invite&access_token='+ 'a'.repeat(40)+'&refresh_token='+'b'.repeat(40))).not.toBeNull();
 });
 it('requires strong matching passwords while preserving intentional whitespace',()=>{
  expect(setupPasswordSchema.safeParse({password:'short',confirmPassword:'short'}).success).toBe(false);
  expect(setupPasswordSchema.safeParse({password:'long-enough-secret',confirmPassword:'different-secret'}).success).toBe(false);
  const password='  long unique password  ';
  expect(setupPasswordSchema.parse({password,confirmPassword:password}).password).toBe(password);
 });
});
