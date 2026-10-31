import {it,expect} from 'vitest';
import {summarizeVariants} from '../src/lib/admin/product-summary';
it('derives price range and stock from the actual variant records',()=>{
 expect(summarizeVariants([{price_minor:60000,sale_price_minor:55000,inventory:{available:1}},{price_minor:50000,sale_price_minor:null,inventory:{available:2}}])).toEqual({skuCount:2,truncated:false,priceMin:50000,priceMax:55000,available:3});
});
it('never substitutes zero for missing inventory or missing variant setup',()=>{
 expect(summarizeVariants([]).available).toBeNull();
 expect(summarizeVariants([]).priceMin).toBeNull();
 expect(summarizeVariants([{price_minor:50000,sale_price_minor:null,inventory:null}]).available).toBeNull();
 expect(summarizeVariants([{price_minor:50000,sale_price_minor:null,inventory:{available:0}}]).available).toBe(0);
});
it('does not report partial totals as complete when the bounded read is truncated',()=>{
 const row={price_minor:50000,sale_price_minor:null,inventory:{available:1}};
 expect(summarizeVariants(Array.from({length:101},()=>row))).toMatchObject({truncated:true,priceMin:null,priceMax:null,available:null});
});
