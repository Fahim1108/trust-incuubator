import {afterEach,expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ShopBySize} from '@/components/home/ShopBySize';
import {ShirtStyles} from '@/components/home/ShirtStyles';
import {reviewShirts} from '@/services/adapters/review-thrift';
import {curatedInventoryCollection,ownerCatalogue} from '@/services/adapters/owner-catalogue';
import {campaignHero} from '@/config/campaign-banners';
import {APPAREL_SIZES} from '@/lib/catalogue-dimensions';

afterEach(()=>vi.unstubAllEnvs());
function preview(){vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');vi.stubEnv('VERCEL_ENV','preview');for(const name of ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])vi.stubEnv(name,'');}
it('shows all seven size groups without treating a provisional preview M as actual stock',()=>{
 preview();const products=reviewShirts();const html=renderToStaticMarkup(createElement(ShopBySize,{products}));
 for(const size of APPAREL_SIZES)expect(html).toContain(`>${size}</span>`);
 expect(html.match(/aria-disabled="true"/g)).toHaveLength(7);expect(html).not.toContain('href=');
 const first=products[0];if(!first)throw new Error('Missing test inventory');
 const verified={...first,status:'published' as const,reviewOnly:false};
 const confirmed=renderToStaticMarkup(createElement(ShopBySize,{products:[verified]}));
 expect(confirmed).toContain('href="/shop?sizes=M&amp;available=1"');expect(confirmed.match(/aria-disabled="true"/g)).toHaveLength(6);
});
it('exposes styles only when matching verified published records exist',()=>{
 preview();const products=reviewShirts();expect(renderToStaticMarkup(createElement(ShirtStyles,{products}))).toBe('');
 const first=products[0];if(!first)throw new Error('Missing test inventory');
 const verified={...first,status:'published' as const,reviewOnly:false,shirtAttributes:{pattern:['striped'],occasion:['formal']},collectionSlugs:['winter']};
 const html=renderToStaticMarkup(createElement(ShirtStyles,{products:[verified]}));
 expect(html).toContain('/shop?shirt=striped');expect(html).toContain('/shop?shirt=formal');expect(html).toContain('/collections/winter');expect(html).not.toContain('linen');
});
it('curates only original inventory and preserves photos, prices and lack of fabricated publication dates',()=>{
 preview();const products=reviewShirts();const arrivals=curatedInventoryCollection(products,'new-arrivals');const featured=curatedInventoryCollection(products,'featured');
 expect(arrivals).toHaveLength(8);expect(featured).toHaveLength(8);expect(new Set([...arrivals,...featured].map(p=>p.id)).size).toBe(16);
 expect([...arrivals,...featured].every(p=>products.includes(p)&&p.createdAt==='')).toBe(true);expect(curatedInventoryCollection(products,'best-sellers')).toEqual([]);
});
it('preserves required homepage order and manual hero navigation',async()=>{
 preview();const settings=await ownerCatalogue.getStorefrontSettings();expect(settings.homepage.filter(s=>s.enabled).map(s=>s.type)).toEqual(['hero','categories','sizes','new-arrivals','featured']);expect(campaignHero.autoplayMs).toBe(0);expect(campaignHero.slides.map(s=>s.id)).toEqual(['banner-01','banner-02','banner-03']);
 expect(settings.header.navigation.find(n=>n.label==='Shirts')?.children).toEqual([{label:'All Shirts',href:'/category/shirts'}]);
});
