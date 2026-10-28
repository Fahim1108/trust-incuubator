import Link from 'next/link';
import {randomUUID} from 'node:crypto';
import {staffSession} from '@/lib/admin/access';
import {CreateDraftForm} from '@/components/admin/access/CreateDraftForm';
export default async function NewProduct(){
 const {roles}=await staffSession();
 return <main id="main" className="aa-main"><Link href="/admin/products">← Products</Link><h1>Add product draft</h1>{roles.some(r=>r==='owner'||r==='product_manager')?<section className="aa-panel"><p>Create a real unpublished product record. No size, photograph, stock or price is invented. Image and full garment setup for new records remain unavailable.</p><CreateDraftForm requestId={randomUUID()}/></section>:<p>Your role cannot create products.</p>}</main>;
}
