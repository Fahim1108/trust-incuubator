import {staffSession} from '@/lib/admin/access';
import {galleryRecord} from '@/lib/admin/gallery-validation';
import {ProductGalleryEditor} from './ProductGalleryEditor';
export async function PrivateProductGallery({id,updated_at}:{id:string;updated_at:string}){
 const {client}=await staffSession();
 const result=await client.from('product_media').select('id,storage_path,alt_text,position').eq('product_id',id).order('position');
 if(result.error)throw new Error('Private product gallery could not be loaded.');
 const images=await Promise.all(galleryRecord.array().parse(result.data).map(async image=>{
  const signed=await client.storage.from('attires-product-drafts').createSignedUrl(image.storage_path,120);
  return {...image,url:signed.error?null:signed.data.signedUrl};
 }));
 return <ProductGalleryEditor target={{id,updated_at}} images={images}/>;
}
