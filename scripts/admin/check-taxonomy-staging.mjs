import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export async function checkTaxonomy({c,role,product,version,trackTerm,anonymous}){
 const entries=[];
 for(const kind of ['category','brand','collection','tag']){
  const id=randomUUID();const name='Synthetic '+kind+' '+id.slice(0,8);const term={name,slug:'qa-'+kind+'-'+id,published:kind==='brand'};
  const r=await c.rpc('admin_save_catalogue_term',{term_type:kind,target_id:id,expected_updated_at:null,term});
  if(!['owner','product_manager'].includes(role)){assert.equal(r.error?.code,'42501');return;}
  assert.ifError(r.error);trackTerm({id,kind});entries.push({id,kind,term,version:r.data});
 }
 const category=entries[0];
 const publicRead=await anonymous.from('catalogue_terms').select('id').eq('id',entries[1].id);assert.ifError(publicRead.error);assert.equal(publicRead.data.length,0);
 const renamed=await c.rpc('admin_save_catalogue_term',{term_type:'category',target_id:category.id,expected_updated_at:category.version,term:{...category.term,name:'Updated synthetic category'}});assert.ifError(renamed.error);
 assert.equal((await c.rpc('admin_save_catalogue_term',{term_type:'category',target_id:category.id,expected_updated_at:category.version,term:category.term})).error?.code,'PT409');
 const assigned=await c.rpc('admin_set_product_taxonomy',{target_id:product,expected_updated_at:await version(),category:category.id,term_ids:entries.slice(1).map(e=>e.id)});assert.ifError(assigned.error);
 const rows=await c.from('product_catalogue_terms').select('term_id').eq('product_id',product);assert.ifError(rows.error);assert.equal(rows.data.length,3);
 assert.equal((await c.rpc('admin_delete_catalogue_term',{term_type:'category',target_id:category.id,expected_updated_at:renamed.data})).error?.code,'23503');
 const spare=randomUUID();trackTerm({id:spare,kind:'tag'});
 const created=await c.rpc('admin_save_catalogue_term',{term_type:'tag',target_id:spare,expected_updated_at:null,term:{name:'Unused synthetic tag',slug:'qa-tag-'+spare,published:false}});assert.ifError(created.error);
 assert.ifError((await c.rpc('admin_delete_catalogue_term',{term_type:'tag',target_id:spare,expected_updated_at:created.data})).error);
 const deleted=await c.from('catalogue_terms').select('id').eq('id',spare);assert.ifError(deleted.error);assert.equal(deleted.data.length,0);
}
