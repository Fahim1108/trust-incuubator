import {z} from 'zod';
export const setupSessionSchema=z.object({accessToken:z.string().min(20).max(16384),refreshToken:z.string().min(20).max(4096)});
export const setupPasswordSchema=z.object({password:z.string().min(12).max(128),confirmPassword:z.string().min(12).max(128)}).refine(v=>v.password===v.confirmPassword,{message:'Passwords must match.'});
export function setupFragment(hash:string){
 const params=new URLSearchParams(hash.replace(/^#/,''));
 if(!['invite','recovery'].includes(params.get('type')||''))return null;
 const result=setupSessionSchema.safeParse({accessToken:params.get('access_token'),refreshToken:params.get('refresh_token')});
 return result.success?result.data:null;
}
