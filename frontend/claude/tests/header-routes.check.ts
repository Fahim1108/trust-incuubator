import {describe,expect,it} from 'vitest';
import {usesCompactHeader} from '@/lib/header-routes';

describe('compact transactional and account headers',()=>{
  it('hides search throughout existing and planned account/payment steps',()=>{
    for(const path of ['/checkout','/checkout/review','/checkout/cod-payment','/order-review','/cod-payment','/online-payment','/order-confirmation','/payment/submitted','/payments/review','/order/confirmed','/account','/account/login','/account/register','/account/forgot-password','/account/reset-password','/account/orders/48271','/profile','/login','/registration','/auth/callback','/forgot-password','/reset-password']) expect(usesCompactHeader(path),path).toBe(true);
  });
  it('preserves shopping search and does not match unrelated path prefixes',()=>{
    for(const path of ['/','/shop','/categories','/category/shirts','/product/aa-shirt-001','/brands','/brand/example','/wishlist','/cart','/track-order','/checkout-guide','/accounting','/payment-info']) expect(usesCompactHeader(path),path).toBe(false);
  });
});
