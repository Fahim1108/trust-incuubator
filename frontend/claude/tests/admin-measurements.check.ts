import {it,expect} from 'vitest';
import {draftSchema} from '../src/lib/admin/validation';
const base={id:'00000000-0000-4000-8000-000000000001',updated_at:'2026-10-28T00:00:00Z',name:'Real garment',description:'',price:'550',stock_quantity:'1',actual_size:'',actual_color:''};
it('keeps unknown measurements blank',()=>{const d=draftSchema.parse(base);expect(d.chest_inches).toBe('');expect(d.length_inches).toBe('');expect(d.condition).toBe('');});
it('validates physical inches and condition',()=>{expect(draftSchema.safeParse({...base,chest_inches:'22.5',length_inches:'28',condition:'very_good'}).success).toBe(true);for(const v of ['-1','0','101','22.555','twenty'])expect(draftSchema.safeParse({...base,chest_inches:v}).success).toBe(false);expect(draftSchema.safeParse({...base,condition:'new'}).success).toBe(false);});
