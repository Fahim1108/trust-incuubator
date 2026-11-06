import {describe,it,expect} from 'vitest';
import {garmentReadiness,standardReadiness,missingLabels,publicationBackendGaps} from '../src/lib/admin/product-readiness';
const garment={actual_size:'L',actual_color:'Blue',chest_inches:22,length_inches:29,condition:'good',price_minor:85000,stock_quantity:1,size_verified:false,details_verified:false};
describe('product readiness (read-only, never publishes)',()=>{
 it('reports exactly the physical garment facts that are still missing',()=>{
  const checks=garmentReadiness({name:'Oxford shirt',description:''},{...garment,actual_size:null,chest_inches:null});
  expect(missingLabels(checks)).toEqual(['Description','Size','Measurements','Verification']);
 });
 it('never treats an unverified garment as ready, because verification has no staff workflow yet',()=>{
  const checks=garmentReadiness({name:'Oxford shirt',description:'Real garment'},garment);
  expect(checks.find(c=>c.key==='verified')?.ok).toBe(false);
  expect(checks.filter(c=>c.key!=='verified').every(c=>c.ok)).toBe(true);
 });
 it('treats a sold or missing single garment (quantity 0) as out of stock, not as more units',()=>{
  expect(garmentReadiness({name:'x',description:'y'},{...garment,stock_quantity:0}).find(c=>c.key==='stock')?.ok).toBe(false);
 });
 it('requires an active priced SKU for standard products and does not invent unknown image or stock facts',()=>{
  const checks=standardReadiness({name:'Tee'},{description:'Cotton',categoryAssigned:true,imageCount:null,variants:[{active:false,price_minor:50000}],available:null});
  expect(missingLabels(checks)).toEqual(['SKU']);
  expect(checks.find(c=>c.key==='images')?.ok).toBeNull();
  expect(checks.find(c=>c.key==='stock')?.ok).toBeNull();
 });
 it('rejects zero-price active SKUs and empty inventory',()=>{
  const checks=standardReadiness({name:'Tee'},{description:'',categoryAssigned:false,imageCount:0,variants:[{active:true,price_minor:0}],available:0});
  expect(missingLabels(checks)).toEqual(['Description','Category','Images','SKU','Stock']);
 });
 it('documents the backend publication work instead of offering a client-side publish',()=>{
  expect(publicationBackendGaps.some(g=>g.includes('publish/unpublish RPC'))).toBe(true);
 });
});
