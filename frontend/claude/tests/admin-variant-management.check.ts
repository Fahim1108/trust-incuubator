import {it,expect} from 'vitest';
import {variantEditSchema,stockEditSchema,editablePrice} from '../src/lib/admin/variant-management';
const target={id:'20000000-0000-4000-8000-000000000001',updated_at:'2026-10-30T16:00:00.123456+00:00',variant_id:'30000000-0000-4000-8000-000000000001'};
it('converts exact BDT prices and validates sale and actual size',()=>{
 const v={...target,sku:'REAL-001',size:'M',color:'Maroon',price:'550.50',sale_price:'500',active:'on'};
 expect(variantEditSchema.parse(v).price).toBe(55050);
 expect(variantEditSchema.safeParse({...v,sale_price:'600'}).success).toBe(false);
 expect(variantEditSchema.safeParse({...v,size:'N/A'}).success).toBe(false);
 expect(variantEditSchema.safeParse({...v,price:'1.001'}).success).toBe(false);
 expect(editablePrice(55050)).toBe('550.50');
});
it('requires nonzero signed stock change, saved version and reason',()=>{
 expect(stockEditSchema.parse({...target,delta:'-1',reason:'Damaged item'}).delta).toBe(-1);
 expect(stockEditSchema.safeParse({...target,delta:'0',reason:'Count'}).success).toBe(false);
 expect(stockEditSchema.safeParse({...target,delta:'1.5',reason:'Count'}).success).toBe(false);
});
