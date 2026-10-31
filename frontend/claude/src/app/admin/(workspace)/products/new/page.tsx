import Link from 'next/link';
import {randomUUID} from 'node:crypto';
import {staffSession} from '@/lib/admin/access';
import {CreateDraftForm} from '@/components/admin/access/CreateDraftForm';
import {isProductionStorefront} from '@/lib/storefront-policy';
export default async function NewProduct(){
 const {roles}=await staffSession();
 const requestId=randomUUID();const staging=!isProductionStorefront();
 return <main id="main" className="aa-main"><Link className="aa-back-link" href={staging?'/admin/products/library':'/admin/products'}>← All products</Link><header className="aa-page-heading"><div><p className="aa-eyebrow">Catalog / New product</p><h1>Add product draft</h1><p>Start with the basics. Your product stays unpublished.</p></div></header>{roles.some(r=>r==='owner'||r==='product_manager')?<section className="aa-panel aa-create-product"><h2>Basic information</h2><p>{staging?'Save a draft, then continue to its images, organization, variants and stock.':'Create an unpublished product record.'}</p><CreateDraftForm requestId={requestId} workspaceHref={staging?'/admin/products/'+requestId:undefined}/></section>:<p>Your role cannot create products.</p>}</main>;
}
