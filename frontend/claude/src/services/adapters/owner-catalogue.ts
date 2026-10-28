import {readLiveReviewDrafts,projectSavedReview} from "./live-review-thrift";
import "server-only";
import { reviewInventoryEnabled } from "@/lib/storefront-policy";
import { officialShirtSizeGuide } from "@/config/shirt-size-guide";
import { previewPaymentConfiguration } from "@/config/payment-receiving";
import { unavailableServices } from "./unavailable";
import {campaignHero} from '@/config/campaign-banners';
import {reviewShirts} from './review-thrift';
import {publishedShirts,approvedReviews} from './published-thrift';

import {storeCategories} from '@/config/catalogue';
import {defaultStorefrontSettings} from '@/config';
import {queryProducts} from '@/lib/catalog-query';
import {availableShirtTypes,publishedAvailable} from '@/lib/catalogue-dimensions';
import type {Product} from '@/types';
import type {StorefrontDataSource} from '../types';

/** Verified publications supersede the matching design-review copy, never duplicate it. */
export async function browsableShirts(options:{liveReview?:boolean}={}){
 const published=await publishedShirts();
 const slugs=new Set(published.map(p=>p.slug));
 let review=reviewInventoryEnabled()?reviewShirts():[];
 if(reviewInventoryEnabled()&&options.liveReview!==false){
  const saved=await readLiveReviewDrafts();
  if(saved!==null)review=saved.filter(item=>item.status!=='archived').flatMap(item=>{
   const base=review.find(p=>p.slug===item.source_id.toLowerCase());
   return base?[projectSavedReview(item,base)]:[];
  });
 }
 return [...published,...review.filter(p=>!slugs.has(p.slug))];
}
const categories=storeCategories.map(c=>({...c,available:c.slug==='shirts',description:c.slug==='shirts'?'Individual thrift shirts, carefully selected.':'Coming soon.',...(c.slug==='shirts'?{image:{src:'/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',alt:'Attires Arena thrift shirts'},thumbnail:{src:'/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',alt:'Attires Arena thrift shirts'}}:{})}));

/** Explicit owner inventory curation. Source order is not represented as a publication timestamp. */
export function curatedInventoryCollection(products:Product[],kind:'new-arrivals'|'featured'|'best-sellers',limit=8){
 if(kind==='best-sellers')return [];
 const inventory=products.filter(p=>/^aa-shirt-\d{3}$/.test(p.slug)).sort((a,b)=>a.slug.localeCompare(b.slug));
 return (kind==='new-arrivals'?inventory:inventory.slice(8)).slice(0,Math.max(0,Math.min(limit,8)));
}
export const ownerCatalogue:StorefrontDataSource={...unavailableServices,
 async getHomepageProducts(){return []; /* Publication dates must come from trusted publication metadata. */},
 async getProducts(query={}){
  const products=await browsableShirts();
  // Provisional preview sizes and visually proposed metadata never satisfy verified facets.
  const requiresVerified=Boolean(query.sizes?.length||query.shirtType||query.collection);
  const verified=products.filter(p=>!p.reviewOnly&&publishedAvailable(p));
  const result=queryProducts(requiresVerified?verified:products,categories,[],query);
  const sizes=queryProducts(verified,categories,[],query).facets;
  return {...result,facets:{...result.facets,sizes:sizes.sizes,sizeLabels:sizes.sizeLabels}};
 },
 async getProductBySlug(slug){return (await browsableShirts()).find(p=>p.slug===slug)??null;},
 async getProductsByIds(ids){return (await browsableShirts()).filter(p=>ids.includes(p.id));},
 async getRelatedProducts(){return [];},
 async getCollection(kind,limit=8){return curatedInventoryCollection(await browsableShirts(),kind,limit);},
 async searchSuggestions(term,limit=6){return (await browsableShirts()).filter(p=>p.name.toLowerCase().includes(term.toLowerCase())).slice(0,limit).map(p=>({slug:p.slug,name:p.name,price:p.price,image:p.defaultImages[0]!,categoryName:'Shirts'}));},
 async getBrands(){return [];},async getBrandBySlug(){return null;},
 async getReviews(id){return (await publishedShirts()).some(p=>p.id===id)?approvedReviews(id):[];},async getInitialCart(){return [];},
 async getCategories(){
  if(reviewInventoryEnabled())return categories;
  const hasPublished=(await publishedShirts()).length>0;
  return categories.map(c=>({...c,available:c.slug==='shirts'&&hasPublished}));
 },async getCategoryBySlug(slug){return (await this.getCategories()).find(c=>c.slug===slug)??null;},
 async getSizeGuide(id){return id==='tops'?officialShirtSizeGuide:null;},
 async getManualPaymentConfiguration(){
  const configuration=previewPaymentConfiguration();
  return reviewInventoryEnabled()?configuration:{...configuration,destinations:[],available:false};
 },
 async getHomepageConfiguration(){const s=await this.getStorefrontSettings();return {sections:s.homepage,hero:s.hero,promoBanners:s.promoBanners,valueProps:s.valueProps};},
 async getStorefrontSettings(){
  const verified=(await publishedShirts()).filter(p=>!p.reviewOnly&&publishedAvailable(p));
  const classifications=availableShirtTypes(verified).map(([,slug,label])=>({label,href:`/shop?shirt=${slug}`}));
  const winter=verified.some(p=>p.collectionSlugs?.includes('winter'));
  return {...defaultStorefrontSettings,
   description:'Attires Arena — individual thrift shirts in Bangladesh.',
   commerce:{...defaultStorefrontSettings.commerce,demoCoupons:[]},
   footer:{...defaultStorefrontSettings.footer,columns:defaultStorefrontSettings.footer.columns.map(c=>({...c,links:c.links.filter(l=>l.href!=='/collections/winter'||winter)}))},
   demo:{...defaultStorefrontSettings.demo,seedCart:false,showNotices:false},hero:campaignHero,
   homepage:defaultStorefrontSettings.homepage.map(s=>({...s,productIds:undefined,subtitle:undefined})),
   header:{...defaultStorefrontSettings.header,announcement:{...defaultStorefrontSettings.header.announcement,items:['Thrift Shirts','Carefully Selected','Individual Pieces']},navigation:defaultStorefrontSettings.header.navigation.map(n=>n.label==='Men'?{...n,label:'Shirts',href:'/category/shirts',children:[{label:'All Shirts',href:'/category/shirts'},...classifications,...(winter?[{label:'Winter',href:'/collections/winter'}]:[])]}:n)},
  };
 },
};
