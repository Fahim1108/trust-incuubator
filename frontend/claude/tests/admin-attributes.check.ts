import {it,expect} from 'vitest';
import {draftSchema} from '../src/lib/admin/validation';
const base={id:'00000000-0000-4000-8000-000000000001',updated_at:'2026-10-28T00:00:00Z',name:'Shirt',description:'',price:'550',stock_quantity:'1',actual_size:'',actual_color:''};
it('supports compatible simultaneous attributes',()=>expect(draftSchema.parse({...base,attributes:['Solid','Formal','Long Sleeve']}).attributes).toHaveLength(3));
it('rejects unsupported attributes and overlong SEO',()=>{expect(draftSchema.safeParse({...base,attributes:['Fictional']}).success).toBe(false);expect(draftSchema.safeParse({...base,seo_title:'x'.repeat(71)}).success).toBe(false);expect(draftSchema.safeParse({...base,seo_description:'x'.repeat(161)}).success).toBe(false);});
