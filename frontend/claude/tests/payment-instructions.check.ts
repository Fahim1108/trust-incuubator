import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {PaymentInstructions} from '@/components/checkout/PaymentInstructions';
import type {PaymentDestination} from '@/types/manual-payment';
const destination:PaymentDestination={provider:'bkash',recipientNumber:'configured-in-test',accountType:'personal',transferInstructions:'Approved transfer instructions'};
it('renders the requested Bangla steps while warning that collection remains disabled',()=>{
  const html=renderToStaticMarkup(createElement(PaymentInstructions,{destination,available:false}));
  expect(html).toContain('যেভাবে পেমেন্ট করবেন');expect(html).toContain('Send Money');expect(html).toContain('Transaction ID (TrxID)');expect(html).toContain('Payment collection is unavailable. Do not send money.');
});
it('does not direct Merchant accounts to Personal Send Money',()=>{
  const html=renderToStaticMarkup(createElement(PaymentInstructions,{destination:{...destination,accountType:'merchant',transferInstructions:'Use approved merchant payment flow.'},available:true}));
  expect(html).toContain('Use approved merchant payment flow.');expect(html).not.toContain('Send Money');expect(html).not.toContain('Personal Number');
});
