import {notFound} from 'next/navigation';
import {isProductionStorefront} from '@/lib/storefront-policy';
import {AcceptInviteForm} from '@/components/admin/access/AcceptInviteForm';
export const metadata={title:'Secure Staging account setup | Attires Arena',referrer:'no-referrer' as const};
export default function AcceptInvitePage(){
 if(isProductionStorefront())notFound();
 return <main id="main" className="aa-auth"><p className="aa-eyebrow">Attires Arena / Staging only</p><h1>Set up your Staging account</h1><AcceptInviteForm/></main>;
}
