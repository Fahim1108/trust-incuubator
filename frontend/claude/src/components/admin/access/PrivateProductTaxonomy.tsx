import {staffSession} from '@/lib/admin/access';
import {ProductTaxonomyForm} from './TaxonomyForms';
import {z} from 'zod';
export async function PrivateProductTaxonomy({product}:{product:{id:string;updated_at:string;category_id:string|null}}){
 const {client}=await staffSession();
 const [categories,terms,assigned]=await Promise.all([
  client.from('categories').select('id,name').order('name').limit(501),
  client.from('catalogue_terms').select('id,name,kind').order('name').limit(501),
  client.from('product_catalogue_terms').select('term_id').eq('product_id',product.id),
 ]);
 if(categories.error||terms.error||assigned.error)throw new Error('Product taxonomy could not be read.');
 if(categories.data.length>500||terms.data.length>500)return <p>Taxonomy selection exceeds 500 records. A searchable picker is required before editing these assignments.</p>;
 const simple=z.object({id:z.uuid(),name:z.string()});
 return <ProductTaxonomyForm product={product} categories={simple.array().parse(categories.data)} terms={simple.extend({kind:z.enum(['brand','collection','tag'])}).array().parse(terms.data)} assigned={z.array(z.object({term_id:z.uuid()})).parse(assigned.data).map(r=>r.term_id)}/>;
}
