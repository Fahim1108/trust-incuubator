import {describe, expect, it} from 'vitest';
import { dataSource } from '@/services/adapters';
import { signInAction, registerAction, requestPasswordResetAction, subscribeNewsletterAction, getProductsByIdsAction, placeOrderAction, publishStorefrontSettingsAction } from '@/services/actions';
import { defaultStorefrontSettings } from '@/config';
import { STORAGE_KEYS } from '@/lib/storage';
describe('isolated Claude preview adapter contracts — no live Supabase calls',()=>{
 it('keeps auth actions disconnected and never reports successful authentication',async()=>{
  const attempts=await Promise.all([signInAction({identifier:'test@example.invalid',password:'not-a-real-password'}),registerAction({fullName:'Fixture',email:'test@example.invalid',phone:'01700000000',password:'not-a-real-password'}),requestPasswordResetAction({identifier:'test@example.invalid'})]);
  for(const result of attempts)expect(result).toMatchObject({ok:false,reason:'not_connected'});
 });
 it('cannot claim a successful newsletter submission',async()=>{expect(await subscribeNewsletterAction('test@example.invalid')).toMatchObject({ok:false,reason:'not_connected'});});
 it('does not return a product for unknown IDs',async()=>{expect(await getProductsByIdsAction(['not-real'])).toEqual([]);});
 it('returns null for nonexistent order lookup (fixtures only)',async()=>{expect(await dataSource.getOrderByNumber('DOES-NOT-EXIST')).toBeNull();});
 it('separates sample local storage from the real storefront',()=>{for(const key of Object.values(STORAGE_KEYS))expect(key).toMatch(/^aa\.claude-preview\./);});
 it('cannot create an order or claim a payment success',async()=>{
  const result=await placeOrderAction({customer:{fullName:'Fixture',phone:'01700000000'},address:{fullName:'Fixture',phone:'01700000000',division:'Dhaka',district:'Dhaka',area:'Test area',addressLine:'Test-only address'},paymentMethod:'cod',items:[],saveAddress:false});
  expect(result).toMatchObject({ok:false,reason:'not_connected'});
 });
 it('cannot publish appearance settings',async()=>{expect(await publishStorefrontSettingsAction(defaultStorefrontSettings)).toMatchObject({ok:false,reason:'not_connected'});});
});
