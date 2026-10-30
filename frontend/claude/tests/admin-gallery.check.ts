import {describe,it,expect} from 'vitest';
import {galleryCommand} from '../src/lib/admin/gallery-validation';
describe('private product gallery commands',()=>{
 const id='20000000-0000-4000-8000-000000000001';
 it('requires unique valid image IDs and bounded alt text',()=>{
  expect(galleryCommand.safeParse({operation:'reorder',ids:[id,id]}).success).toBe(false);
  expect(galleryCommand.safeParse({operation:'reorder',ids:['bad']}).success).toBe(false);
  expect(galleryCommand.safeParse({operation:'alt',id,alt:'x'.repeat(301)}).success).toBe(false);
  expect(galleryCommand.safeParse({operation:'alt',id,alt:'লাল শার্টের সামনের অংশ'}).success).toBe(true);
 });
 it('rejects unknown operations and strips unrelated payment/publication fields',()=>{
  expect(galleryCommand.safeParse({operation:'publish',id}).success).toBe(false);
  expect(galleryCommand.parse({operation:'remove',id,status:'published'})).toEqual({operation:'remove',id});
 });
});
