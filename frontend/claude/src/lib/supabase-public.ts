import 'server-only';
import projects from '@/config/supabase-projects.json';
import {isProductionStorefront} from './storefront-policy';
/** Only the configured store project and public/anon credentials. Never a service-role client. */
export function publicSupabaseConfiguration() {
 const url=(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/$/,'');
 const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const ref=isProductionStorefront()?projects.production:projects.staging;
 if(url!==`https://${ref}.supabase.co`||!key)return null;
 if(key.startsWith('sb_publishable_'))return {url,key};
 try {
  const claims:unknown=JSON.parse(Buffer.from(key.split('.')[1]||'','base64url').toString());
  if(claims&&typeof claims==='object'&&'role' in claims&&claims.role==='anon')return {url,key};
 }catch { /* Reject malformed credentials. */ }
 return null;
}
