import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export const testImage=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
export async function checkGallery({c,user,role,product,version,trackPath}){
 const bucket='attires-product-drafts';
 const initial=await version();
 const path=user.id+'/'+randomUUID()+'.png';trackPath(path);
 const uploaded=await c.storage.from(bucket).upload(path,testImage,{contentType:'image/png'});
 if(!['owner','product_manager'].includes(role)){
  assert(uploaded.error);
  assert.equal((await c.rpc('admin_edit_product_gallery',{target_id:product,expected_updated_at:initial,command:{operation:'attach',path}})).error?.code,'42501');return;
 }
 assert.ifError(uploaded.error);
 const result=await c.rpc('admin_edit_product_gallery',{target_id:product,expected_updated_at:initial,command:{operation:'attach',path,alt:'Temporary binary image'}});assert.ifError(result.error);
 const gallery=await c.from('product_media').select('id,storage_path,alt_text').eq('product_id',product).eq('storage_path',path);assert.ifError(gallery.error);assert.equal(gallery.data.length,1);
 assert.equal((await c.rpc('admin_edit_product_gallery',{target_id:product,expected_updated_at:initial,command:{operation:'remove',id:gallery.data[0].id}})).error?.code,'PT409');
 const removed=await c.storage.from(bucket).remove([path]);
 // Storage may report success for zero deleted rows: verify the actual object.
 const existing=await c.storage.from(bucket).download(path);assert.ifError(existing.error);assert.deepEqual(Buffer.from(await existing.data.arrayBuffer()),testImage);
 const replacement=await c.storage.from(bucket).update(path,testImage,{contentType:'image/png'});assert(replacement.error);
 assert(removed.error||Array.isArray(removed.data));
 const foreign=await c.rpc('admin_edit_product_gallery',{target_id:product,expected_updated_at:await version(),command:{operation:'attach',path:randomUUID()+'/'+randomUUID()+'.png'}});assert(foreign.error);
 const signed=await c.storage.from(bucket).createSignedUrl(path,30);assert.ifError(signed.error);
 const publicResponse=await fetch(c.storage.from(bucket).getPublicUrl(path).data.publicUrl,{signal:AbortSignal.timeout(15000)});assert(!publicResponse.ok);
 const detached=await c.rpc('admin_edit_product_gallery',{target_id:product,expected_updated_at:await version(),command:{operation:'remove',id:gallery.data[0].id}});assert.ifError(detached.error);
 assert.ifError((await c.storage.from(bucket).remove([path])).error);
 const remaining=await c.storage.from(bucket).list(user.id);assert.ifError(remaining.error);
 assert(!remaining.data.some(o=>o.name===path.split('/')[1]));
 assert((await c.storage.from(bucket).createSignedUrl(path,30)).error);
}
