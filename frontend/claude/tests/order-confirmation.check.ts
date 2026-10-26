import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {AdvanceOrderConfirmation} from '@/components/checkout/AdvanceOrderConfirmation';
import {canDisplayConfirmedOrder} from '@/lib/manual-payment';
import type {VerifiedAdvanceOrder} from '@/types/manual-payment';

const receipt:VerifiedAdvanceOrder={orderId:'private-internal-uuid',orderReference:'48271',createdAt:'2026-10-27T00:00:00Z',orderStatus:'confirmed',advanceStatus:'advance_verified',provider:'bkash',totalMinor:110000,advanceMinor:7000,remainingMinor:103000};
const render=(order:VerifiedAdvanceOrder|null)=>renderToStaticMarkup(createElement(AdvanceOrderConfirmation,{order}));
it('shows the real customer reference and verified totals without exposing the internal UUID',()=>{
  const html=render(receipt);expect(html).toContain('Your Order Is Confirmed!');expect(html).toContain('Thanks for your Order');expect(html).toContain('48271');expect(html).toContain('Advance verified');expect(html).not.toContain('private-internal-uuid');expect(html).not.toContain('Purchased items');expect(html).not.toContain('Delivery information');
});
it('renders supplied immutable item and delivery snapshots only',()=>{
  const html=render({...receipt,subtotalMinor:103000,deliveryMinor:7000,discountMinor:0,items:[{name:'Purchased thrift shirt',quantity:2,unitPriceMinor:51500,lineTotalMinor:103000,size:'M',color:'White'}],delivery:{recipientName:'Test customer',addressLines:['Verified street address'],district:'Dhaka',division:'Dhaka',zoneLabel:'Inside Dhaka',estimatedDelivery:'Confirmed courier estimate'}});
  expect(html).toContain('Purchased thrift shirt');expect(html).toContain('Qty 2');expect(html).toContain('M · White');expect(html).toContain('Verified street address');expect(html).toContain('Confirmed courier estimate');expect(html).toContain('Delivery cost');expect(html).not.toContain('private-internal-uuid');
});
it('does not accept pending/unverified receipts or malformed optional snapshots',()=>{
  for(const invalid of [{...receipt,orderStatus:'pending_payment'},{...receipt,advanceStatus:'submitted'},{...receipt,items:[{name:'Item',quantity:1,unitPriceMinor:NaN,lineTotalMinor:51500}]},{...receipt,items:[{name:'Item',quantity:2,unitPriceMinor:51500,lineTotalMinor:50000}]},{...receipt,items:[{name:'Item',quantity:2,unitPriceMinor:51500,lineTotalMinor:103000}],subtotalMinor:100000,deliveryMinor:10000,discountMinor:0},{...receipt,delivery:{recipientName:'Customer',addressLines:[]}},{...receipt,subtotalMinor:100000,deliveryMinor:7000,discountMinor:0}]){
    expect(canDisplayConfirmedOrder(invalid)).toBe(false);
    expect(render(canDisplayConfirmedOrder(invalid)?invalid:null)).toBe('');
  }
});

it('rejects a sum of individually safe line totals that exceeds safe integer precision',()=>{
 const invalid={...receipt,subtotalMinor:Number.MAX_SAFE_INTEGER,items:[{name:'First',quantity:1,unitPriceMinor:Number.MAX_SAFE_INTEGER,lineTotalMinor:Number.MAX_SAFE_INTEGER},{name:'Second',quantity:1,unitPriceMinor:1,lineTotalMinor:1}]};
 expect(canDisplayConfirmedOrder(invalid)).toBe(false);expect(render(canDisplayConfirmedOrder(invalid)?invalid:null)).toBe('');
});
