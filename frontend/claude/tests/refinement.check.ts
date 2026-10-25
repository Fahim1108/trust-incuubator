import { describe,expect,it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { sizeLabelsFromGuide } from '@/lib/size-labels';
import { queryProducts } from '@/lib/catalog-query';
import { mockProducts,mockCategories,mockBrands,mockSizeGuides } from '@/mocks';
import { dataSource } from '@/services/adapters';
import { OrderTimeline } from '@/components/account/OrderTimeline';
describe('non-payment storefront refinements',()=>{
 it('uses explicit clothing guide measurements and never relabels footwear',()=>{
  expect(sizeLabelsFromGuide(mockSizeGuides.tops).M).toBe('M (40)');
  expect(sizeLabelsFromGuide(mockSizeGuides.shoes)).toEqual({});
  expect(sizeLabelsFromGuide()).toEqual({});
 });
 it('preserves raw size filter keys and excludes unrelated footwear facets on shirts',()=>{
  const r=queryProducts(mockProducts,mockCategories,mockBrands,{categorySlugs:['shirts'],sizes:['M']});
  expect(r.total).toBeGreaterThan(0); expect(r.facets.sizeLabels?.M).toBe('M (40)');expect(r.facets.sizes).not.toContain('41');
  expect(r.items.every(p=>p.variants.some(v=>v.size==='M'))).toBe(true);
 });
 it('requires size and color on the same variant',()=>{
  const product=mockProducts.find(p=>p.sizes.length>1&&p.colors.length>1)!;
  const fixture={...product,variants:[{...product.variants[0]!,size:'M',colorId:'red'},{...product.variants[0]!,size:'L',colorId:'blue'}]};
  expect(queryProducts([fixture],mockCategories,mockBrands,{sizes:['M'],colorIds:['blue']}).total).toBe(0);
 });
 it('never exposes fixture customer sessions or orders as real',async()=>{
  expect(await dataSource.getCurrentCustomer()).toBeNull();expect(await dataSource.getOrders()).toEqual([]);expect(await dataSource.getOrderByNumber('DEMO-10241')).toBeNull();
 });
 it('marks only the supplied current stage and does not infer missing timestamps',()=>{
  const html=renderToStaticMarkup(createElement(OrderTimeline,{status:'shipped',events:[{status:'pending',label:'Order Placed',at:'2026-10-20T09:00:00Z'},{status:'shipped',label:'Shipped',at:'2026-10-22T09:00:00Z'}]}));
  expect(html.match(/aria-current="step"/g)).toHaveLength(1);expect(html).toContain('Current stage');expect(html).toContain('Processing');
 });
 it('stops current-stage animation for terminal orders',()=>{
  for(const status of ['delivered','cancelled','returned'] as const){const html=renderToStaticMarkup(createElement(OrderTimeline,{status,events:[]}));expect(html).toContain('Final status');expect(html).not.toContain('Current stage');}
 });
});
