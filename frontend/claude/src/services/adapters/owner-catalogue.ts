import {campaignHero} from '@/config/campaign-banners';
import {reviewShirts} from './review-thrift';
import {publishedShirts,approvedReviews} from './published-thrift';
import {mockDataSource} from './mock';
import {mockCategories} from '@/mocks/categories';
import {defaultStorefrontSettings} from '@/config';
import {queryProducts} from '@/lib/catalog-query';
import type {StorefrontDataSource} from '../types';
/** Prefer verified database publications; review-only records are never purchase variants. */
export async function browsableShirts(){
 const published=await publishedShirts();
 const slugs=new Set(published.map(p=>p.slug));
 return [...published,...reviewShirts().filter(p=>!slugs.has(p.slug))];
}
/** Only Shirts is available; all other category links remain future-facing. */
const categories=mockCategories.map(c=>({...c,available:c.slug==='shirts',description:c.slug==='shirts'?'Individual thrift shirts, carefully selected.':'Coming soon.',...(c.slug==='shirts'?{image:{src:'/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',alt:'Attires Arena thrift shirts'},thumbnail:{src:'/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',alt:'Attires Arena thrift shirts'}}:{})}));
export const ownerCatalogue:StorefrontDataSource={...mockDataSource,
 async getHomepageProducts(){return []; /* Never equate import-created timestamps with owner-approved publish/arrival dates. */},async getProducts(query={}){return queryProducts(await browsableShirts(),categories,[],query);},async getProductBySlug(slug){return (await browsableShirts()).find(p=>p.slug===slug)??null;},async getProductsByIds(ids){return (await browsableShirts()).filter(p=>ids.includes(p.id));},async getRelatedProducts(){return [];},async getCollection(){return [];},async searchSuggestions(term,limit=6){return (await browsableShirts()).filter(p=>p.name.toLowerCase().includes(term.toLowerCase())).slice(0,limit).map(p=>({slug:p.slug,name:p.name,price:p.price,image:p.defaultImages[0]!,categoryName:"Shirts"}));},async getBrands(){return [];},async getBrandBySlug(){return null;},async getReviews(id){return approvedReviews(id);},async getInitialCart(){return [];},
 async getCategories(){return categories;},async getCategoryBySlug(slug){return categories.find(c=>c.slug===slug)??null;},
 async getStorefrontSettings(){return {...defaultStorefrontSettings,description:'Attires Arena — individual thrift shirts in Bangladesh.',footer:{...defaultStorefrontSettings.footer,columns:defaultStorefrontSettings.footer.columns.map(c=>({...c,links:c.links.filter(l=>l.href!=='/collections/winter')}))},demo:{...defaultStorefrontSettings.demo,seedCart:false,showNotices:false},hero:campaignHero,homepage:defaultStorefrontSettings.homepage.map(s=>({...s,productIds:undefined,subtitle:undefined,title:s.id==='featured'?'Featured Shirts':s.title})),header:{...defaultStorefrontSettings.header,announcement:{...defaultStorefrontSettings.header.announcement,items:['Thrift Shirts','Carefully Selected','Individual Pieces']},navigation:defaultStorefrontSettings.header.navigation.map(n=>n.label==='Men'?{...n,label:'Shirts',href:'/category/shirts',children:[{label:'All Shirts',href:'/category/shirts'},{label:'Solid',href:'/shop?shirt=solid'},{label:'Striped',href:'/shop?shirt=striped'},{label:'Checked / Plaid',href:'/shop?shirt=checked'},{label:'Formal',href:'/shop?shirt=formal'},{label:'Casual',href:'/shop?shirt=casual'}]}:n)}};},
};
