import {describe,it,expect} from 'vitest';
import {basicDraftSchema} from '../src/lib/admin/basic-draft-validation';
const input={id:'10000000-0000-4000-8000-000000000001',updated_at:'2026-10-30T12:00:00.123456+00:00',name:'  Linen shirt  ',description:'Measured garment details.'};
describe('generic draft write contract',()=>{
 it('preserves the database version precision and deliberate description whitespace',()=>{
  const parsed=basicDraftSchema.parse({...input,description:'  Garment notes\n'});
  expect(parsed.updated_at).toBe(input.updated_at);expect(parsed.name).toBe('Linen shirt');expect(parsed.description).toBe('  Garment notes\n');
 });
 it('rejects invalid targets, missing saved versions and oversized text',()=>{
  for(const extra of [{id:'not-an-id'},{updated_at:''},{updated_at:'tomorrow'},{name:' '},{name:'x'.repeat(201)},{description:'x'.repeat(20001)}])expect(basicDraftSchema.safeParse({...input,...extra}).success).toBe(false);
 });
 it('does not pass caller-supplied prices, roles, stock or publication fields to the RPC',()=>{
  const parsed=basicDraftSchema.parse({...input,status:'published',price_minor:1,on_hand:999,role:'owner'});
  expect(Object.keys(parsed).sort()).toEqual(['description','id','name','updated_at']);
 });
});
