import {describe,it,expect} from 'vitest';
import {libraryFilters,literalSearch,libraryLink,minorPrice,productRecordSchema} from '../src/lib/admin/library-validation';
describe('trusted product library filters',()=>{
 it('normalizes repeated params, unknown sorts/statuses and invalid paging',()=>{
  expect(libraryFilters({q:['secret','other'],sort:'name;drop table products',status:'owner',page:'-1'})).toEqual({q:'',sort:'updated',status:'',page:1});
  expect(libraryFilters({q:'  Shirt  ',sort:'name',status:'draft',page:'2'})).toEqual({q:'Shirt',sort:'name',status:'draft',page:2});
 });
 it('treats SQL LIKE wildcard characters as literal search content',()=>{
  expect(literalSearch('50%_off\\')).toBe('%50\\%\\_off\\\\%');
 });
 it('roundtrips quoted and non-Latin searches safely in pagination links',()=>{
  const filters=libraryFilters({q:'শার্ট & 50%',status:'draft',sort:'newest'});
  const url=new URL(libraryLink(filters,3),'https://example.test');
  expect(url.searchParams.get('q')).toBe(filters.q);expect(url.searchParams.get('page')).toBe('3');
 });
 it('preserves the exact stored price, including the largest supported safe integer',()=>{
  expect(minorPrice(58029)).toBe('৳580.29');expect(minorPrice(0)).toBe('৳0.00');
  expect(minorPrice(Number.MAX_SAFE_INTEGER).endsWith('.91')).toBe(true);
  expect(()=>minorPrice(-1)).toThrow();expect(()=>minorPrice(1.2)).toThrow();
 });
 it('rejects unknown persisted publication states instead of inventing one',()=>{
  expect(productRecordSchema.shape.status.safeParse('review-approved').success).toBe(false);
 });
});
