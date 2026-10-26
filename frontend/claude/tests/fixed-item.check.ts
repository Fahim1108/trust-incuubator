import {expect,it} from 'vitest';
import {fixedCustomerItem} from '@/lib/fixed-item';
import {mockProducts} from '@/mocks';
it('publishes only the explicitly configured SKU without deleting admin variants',()=>{const p=mockProducts[0]!;const count=p.variants.length;const result=fixedCustomerItem(p)!;expect(result.variants).toHaveLength(1);expect(result.sizes).toEqual([result.variants[0]!.size]);expect(result.colors).toHaveLength(1);expect(p.variants).toHaveLength(count);expect(count).toBeGreaterThan(1);});
it('never guesses a physical size/color from ambiguous catalogue data',()=>{expect(fixedCustomerItem({...mockProducts[0]!,fixedVariantId:undefined})).toBeNull();expect(fixedCustomerItem({...mockProducts[0]!,fixedVariantId:'invalid'})).toBeNull();});
it('does not switch to another SKU if the fixed physical item is sold out',()=>{const p=mockProducts[0]!;const result=fixedCustomerItem({...p,variants:p.variants.map(v=>v.id===p.fixedVariantId?{...v,stock:0}:v)})!;expect(result.variants[0]!.stock).toBe(0);});
