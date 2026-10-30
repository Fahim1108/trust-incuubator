import {notFound} from 'next/navigation';
import {staffSession} from '@/lib/admin/access';
import {isProductionStorefront} from '@/lib/storefront-policy';
import {DraftMediaForm} from '@/components/admin/access/DraftMediaForm';
export default async function DraftMedia(){
 if(isProductionStorefront())notFound();
 const {roles}=await staffSession();
 return <main id="main" className="aa-main"><h1>Private draft media</h1><section className="aa-panel">{roles.some(r=>r==='owner'||r==='product_manager')?<DraftMediaForm/>:<p>Your role cannot upload draft images.</p>}</section></main>;
}
