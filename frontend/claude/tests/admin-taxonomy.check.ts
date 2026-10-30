import {it,expect} from 'vitest';
import {termEdit,productTerms} from '../src/lib/admin/taxonomy-validation';
const id='20000000-0000-4000-8000-000000000001';
it('validates named catalogue records, slugs and optimistic versions',()=>{
 const record={kind:'brand',id,updated_at:'',name:'  Actual Brand ',slug:'actual-brand',published:''};
 expect(termEdit.parse(record).name).toBe('Actual Brand');
 expect(termEdit.safeParse({...record,slug:'Invalid / slug'}).success).toBe(false);
 expect(termEdit.safeParse({...record,kind:'staff'}).success).toBe(false);
 expect(termEdit.safeParse({...record,updated_at:'invalid'}).success).toBe(false);
});
it('rejects duplicate or malformed product assignment IDs',()=>{
 const input={id,updated_at:'2026-10-30T16:00:00.123456Z',category:'',terms:[id]};
 expect(productTerms.safeParse(input).success).toBe(true);
 expect(productTerms.safeParse({...input,terms:[id,id]}).success).toBe(false);
 expect(productTerms.safeParse({...input,terms:['injected']}).success).toBe(false);
});
