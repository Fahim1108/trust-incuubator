import type { ActionResult } from '@/types';
import type { StorefrontDataSource } from '../types';
const unavailable = async (): Promise<ActionResult<never>> => ({ok:false,reason:'not_connected',message:'This service is not connected. No data was saved.'});
// Explicitly disconnected contracts, with no fixture imports or fake successes.
export const unavailableServices = {
 async getCurrentCustomer(){return null;},
 async getOrders(){return [];},
 async getOrderByNumber(){return null;},
 async submitManualPayment(){return {ok:false as const,reason:'not_connected' as const,message:'Payment submission is unavailable. Do not send money.'};},
 placeOrder:unavailable, signIn:unavailable, register:unavailable, requestPasswordReset:unavailable,
 updateProfile:unavailable, saveAddress:unavailable, deleteAddress:unavailable,
 subscribeNewsletter:unavailable, submitContactForm:unavailable, saveStorefrontDraft:unavailable,
 publishStorefrontSettings:unavailable, uploadMedia:unavailable,
} satisfies Pick<StorefrontDataSource,'getCurrentCustomer'|'getOrders'|'getOrderByNumber'|'submitManualPayment'|'placeOrder'|'signIn'|'register'|'requestPasswordReset'|'updateProfile'|'saveAddress'|'deleteAddress'|'subscribeNewsletter'|'submitContactForm'|'saveStorefrontDraft'|'publishStorefrontSettings'|'uploadMedia'>;
