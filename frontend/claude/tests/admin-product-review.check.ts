import {expect,it} from 'vitest';
import {matchesProductFilter,missingProductFacts} from '../src/lib/admin/product-review';
import {snapshotSchema} from '../src/lib/admin/validation';
const item=snapshotSchema.shape.items.element.parse({id:'00000000-0000-4000-8000-000000000001',name:'Garment',description:'',status:'draft',slug:'garment',updated_at:'2026-10-28T00:00:00Z',source_id:'AA-SHIRT-001',image_path:'/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',price_minor:55000,stock_quantity:1,actual_size:null,actual_color:null,size_verified:false,details_verified:false});
it('identifies missing facts without guessing them',()=>expect(missingProductFacts(item)).toEqual(['Missing Size','Missing Measurement','Missing Condition']));
it('filters the real state and verification status',()=>{expect(matchesProductFilter(item,'missing-size')).toBe(true);expect(matchesProductFilter({...item,actual_size:'M'},'missing-size')).toBe(true);expect(matchesProductFilter(item,'published')).toBe(false);expect(matchesProductFilter(item,'sold-out')).toBe(false);expect(matchesProductFilter({...item,stock_quantity:0},'sold-out')).toBe(true);});
