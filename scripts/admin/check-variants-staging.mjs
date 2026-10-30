import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export async function checkVariants({c,role,product,version}){
 const id=randomUUID();const variant={sku:'QA-'+id,size:'M',color:'Synthetic '+role,price_minor:55050,sale_price_minor:50000,active:true};
 const initial=await version();
 const payload={target_id:product,expected_updated_at:initial,target_variant:id,variant};
 const save=await c.rpc('admin_save_product_variant',payload);
 if(!['owner','product_manager'].includes(role)){assert.equal(save.error?.code,'42501');assert.equal((await c.rpc('admin_adjust_product_stock',{target_id:product,expected_updated_at:initial,target_variant:id,quantity_delta:1,adjustment_reason:'Rejected synthetic count'})).error?.code,'42501');return;}
 assert.ifError(save.error);
 const rows=await c.from('product_variants').select('price_minor,sale_price_minor,size').eq('id',id).single();assert.ifError(rows.error);assert.equal(rows.data.price_minor,55050);assert.equal(rows.data.sale_price_minor,50000);
 const stock=async()=>{const r=await c.from('inventory').select('on_hand,reserved').eq('variant_id',id).single();assert.ifError(r.error);return r.data;};
 assert.deepEqual(await stock(),{on_hand:0,reserved:0});
 const adjustment={target_id:product,expected_updated_at:await version(),target_variant:id,quantity_delta:2,adjustment_reason:'Synthetic two-unit count'};
 assert.ifError((await c.rpc('admin_adjust_product_stock',adjustment)).error);assert.equal((await stock()).on_hand,2);
 assert.equal((await c.rpc('admin_adjust_product_stock',adjustment)).error?.code,'PT409');
 assert.equal((await c.rpc('admin_adjust_product_stock',{...adjustment,expected_updated_at:await version(),quantity_delta:-3})).error?.code,'22023');assert.equal((await stock()).on_hand,2);
 const movement=await c.from('inventory_movements').select('delta,on_hand_after').eq('variant_id',id);assert.ifError(movement.error);assert.deepEqual(movement.data,[{delta:2,on_hand_after:2}]);
 const audit=await c.from('admin_audit_logs').select('action').eq('target_id',product).eq('action','inventory.adjusted').contains('changes',{variant_id:id});assert.ifError(audit.error);assert.equal(audit.data.length,1);
}
