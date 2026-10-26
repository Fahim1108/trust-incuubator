'use server';
import {getCurrentCustomer} from '@/services';
/** No browser identity, totals, phone matching or localStorage value can authorise redemption. */
export async function redeemRewardAction(code:string){
 if(typeof code!=='string'||!code.trim()||code.length>80)return {ok:false as const,reason:'validation',message:'Enter a valid coupon code.'};
 const customer=await getCurrentCustomer();
 if(!customer)return {ok:false as const,reason:'authentication_required',message:'Please sign in to redeem your coupon.'};
 // Orders, ownership claims, eligibility and atomic redemption do not exist yet. Never grant a local discount.
 return {ok:false as const,reason:'not_connected',message:'Coupon redemption is currently unavailable. You can continue checkout without a coupon.'};
}
