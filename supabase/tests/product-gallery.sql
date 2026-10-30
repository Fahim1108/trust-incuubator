-- Local authorization simulation only. Actual Storage API tests are separate.
reset role;
insert into storage.objects(bucket_id,name,metadata) values
 ('attires-product-drafts','20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001.png','{"mimetype":"image/png"}'),
 ('attires-product-drafts','20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000002.png','{"mimetype":"image/png"}');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal2"}',true);
select test.denied($q$select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',now(),'{"operation":"attach","path":"arbitrary"}')$q$,'42501','customer cannot attach gallery image');
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select test.denied($q$select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',now(),'{"operation":"remove"}')$q$,'42501','AAL1 Owner cannot change gallery');
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),'{"operation":"attach","path":"20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001.png","alt":"Front view"}');
select test.assert_true((select count(*)=1 from public.product_media where product_id='10000000-0000-4000-8000-000000000001'),'uploaded object attached to real product');
select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),'{"operation":"attach","path":"20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000002.png"}');
with changed as(delete from storage.objects where name='20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001.png' returning id) select test.assert_true(count(*)=0,'linked bytes protected from deletion') from changed;
with changed as(update storage.objects set metadata='{}' where name='20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001.png' returning id) select test.assert_true(count(*)=0,'linked bytes protected from replacement') from changed;
select test.denied($q$select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',now(),'{"operation":"remove"}')$q$,'PT409','gallery rejects stale version');
select test.denied($q$select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),'{"operation":"attach","path":"20000000-0000-4000-8000-000000000003/30000000-0000-4000-8000-000000000003.png"}')$q$,'22023','cannot attach another account object');
select test.denied($q$select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),'{"operation":"reorder","ids":[]}')$q$,'22023','cannot omit images when reordering');
select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),jsonb_build_object('operation','reorder','ids',(select jsonb_agg(id order by position desc) from public.product_media where product_id='10000000-0000-4000-8000-000000000001')));
select test.assert_true((select alt_text='' from public.product_media where product_id='10000000-0000-4000-8000-000000000001' and position=0),'gallery cover order persists');
select public.admin_edit_product_gallery('10000000-0000-4000-8000-000000000001',(select updated_at from public.products where id='10000000-0000-4000-8000-000000000001'),jsonb_build_object('operation','remove','id',(select id from public.product_media where product_id='10000000-0000-4000-8000-000000000001' and position=0)));
select test.assert_true((select count(*)=1 and min(position)=0 from public.product_media where product_id='10000000-0000-4000-8000-000000000001'),'removal compacts gallery ordering');
select test.assert_true((select count(*)=4 from public.admin_audit_logs where target_id='10000000-0000-4000-8000-000000000001' and action='product.gallery_updated'),'every real gallery mutation audited');
reset role;
