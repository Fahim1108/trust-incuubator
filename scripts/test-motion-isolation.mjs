import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';
export const restoredFiles=[
 'frontend/claude/src/app/(store)/category/[slug]/page.tsx','frontend/claude/src/app/globals.css','frontend/claude/src/app/motion.css',
 'frontend/claude/src/components/category/CategoryCard.tsx','frontend/claude/src/components/checkout/AdvanceOrderConfirmation.module.css','frontend/claude/src/components/checkout/CheckoutForm.tsx',
 'frontend/claude/src/components/home/Hero.tsx','frontend/claude/src/components/home/HomeBrowse.module.css','frontend/claude/src/components/home/HomepageView.tsx','frontend/claude/src/components/home/PromoBanners.tsx','frontend/claude/src/components/home/ShopBySize.tsx',
 'frontend/claude/src/components/motion/RouteMotion.tsx','frontend/claude/src/components/product/ProductCard.tsx','frontend/claude/src/components/product/ProductGallery.tsx',
 'frontend/claude/src/components/ui/Button.tsx','frontend/claude/src/components/ui/Reveal.tsx','frontend/claude/src/components/ui/SectionHeading.tsx','frontend/claude/src/config/motion.ts',
];
export function verifyRestoration(){
 assert.equal(execFileSync('git',['diff','45b5bac','--',...restoredFiles],{encoding:'utf8'}),'','All restored animation files must equal the pre-removal baseline');
 const protectedPaths=['src','supabase/migrations/20261024010934_foundation.sql','supabase/migrations/20261024010940_auth_security.sql','supabase/migrations/20261026000100_thrift_intake.sql','supabase/migrations/20261026000200_product_reviews.sql','frontend/claude/src/data','frontend/claude/src/services','frontend/claude/src/types','frontend/claude/src/components/layout/Footer.tsx','frontend/claude/src/components/layout/Header.tsx','frontend/claude/src/config/contact.ts','frontend/claude/src/config/payment-receiving.ts','frontend/claude/src/components/checkout/ManualAdvancePayment.tsx'];
 assert.equal(execFileSync('git',['diff','45b5bac','--',...protectedPaths],{encoding:'utf8'}),'','Unrelated features remain intact');
 return {baseline:'45b5bac',filesByteIdentical:restoredFiles.length,protectedFeaturesUnchanged:true};
}
export async function verifyIsolation(page,{origin,width,directory}){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{window.motionRecords=[];const original=Element.prototype.animate;Element.prototype.animate=function(frames,opts){window.motionRecords.push({route:this.hasAttribute('data-route-motion'),section:this.classList.contains('aa-reveal'),kind:this.dataset.showcaseKind,option:this.dataset.showcaseOption,frames,duration:opts?.duration,containsProduct:!!this.querySelector('[data-showcase-product]')});return original.call(this,frames,opts);};});
 const goto=path=>page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:60000});
 await goto('/');await page.waitForFunction(()=>localStorage.getItem('aa.claude-preview.cart.v1')!==null);await expect(page.locator('[data-section]')).toHaveCount(5);
 await page.locator('[data-section="featured"]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await expect.poll(()=>page.evaluate(()=>window.motionRecords.some(r=>r.section&&r.duration===450&&r.frames[0].transform==='translateY(12px)'))).toBe(true);
 const card=page.locator('article.aa-product-card:visible').first();await card.hover();
 await expect.poll(()=>card.locator('.aa-product-photo').evaluate(el=>Number(getComputedStyle(el).transform.match(/matrix\(([^,]+)/)?.[1]??1))).toBeGreaterThan(1.02);
 await page.locator('[aria-label="Shop by Categories"]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 const category=page.locator('[aria-label="Shop by Categories"] li').first();await category.hover();
 await expect.poll(()=>category.locator('img').evaluate(el=>Number(getComputedStyle(el).transform.match(/matrix\(([^,]+)/)?.[1]??1))).toBeGreaterThan(1.02);
 await page.locator('article.aa-product-card h3 a:visible').first().click();await page.waitForURL('**/product/**');
 await expect.poll(()=>page.evaluate(()=>window.motionRecords.some(r=>r.route&&r.frames[0].transform==='translateY(8px)'))).toBe(true);
 const photo=page.getByRole('img',{name:'White Navy Pinstripe Shirt',exact:true});await expect.poll(()=>photo.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);await photo.hover();
 await expect.poll(()=>photo.evaluate(el=>Number(getComputedStyle(el).transform.match(/matrix\(([^,]+)/)?.[1]??1))).toBeGreaterThan(1.7);
 await expect(page.locator('[data-whatsapp-support]')).toHaveAttribute('href','https://wa.me/8801886456664');
 await expect(page.locator('footer')).not.toContainText('WhatsApp:');
 await expect(page.locator('footer').getByRole('link',{name:'Firoj Ahamed Fahim',exact:true})).toHaveAttribute('href',/^https:\/\/wa.me\/8801632915921\?text=/);
 await goto('/motion-preview');await expect(page.getByRole('heading',{name:'Find your rhythm.',exact:true})).toBeVisible();
 await expect.poll(()=>page.locator('[data-showcase-kind]').evaluateAll(nodes=>nodes.length>0&&nodes.every(node=>node.dataset.previewState!=='ready'))).toBe(true);
 const staticGrid=async()=>assert.ok(await page.locator('[data-showcase-product], [data-showcase-product] img, [data-showcase-grid]').evaluateAll(nodes=>nodes.every(node=>{for(let el=node;el&&el.tagName!=='MAIN';el=el.parentElement){const s=getComputedStyle(el);if(s.opacity!=='1'||s.transform!=='none')return false;}return true;})));
 for(const option of ['A','B','C']){
  await page.getByRole('button',{name:new RegExp('^Option '+option+' —')}).click();
  await expect(page.getByRole('button',{name:new RegExp('^Option '+option+' —')})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('status')).toContainText('Option '+option);
  const before=await page.evaluate(()=>window.motionRecords.length);
  for(const scene of ['editorial','collection','details','type-study']){await page.locator('#'+scene+' [data-showcase-kind=heading]').first().evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await staticGrid();}
  if(option!=='C')await expect.poll(()=>page.evaluate(value=>window.motionRecords.some(r=>r.option===value&&r.kind==='heading'),option)).toBe(true);
  if(option==='B')await page.locator('[data-showcase-kind=image]').first().evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  if(option==='B')await expect.poll(()=>page.evaluate(()=>window.motionRecords.some(r=>r.option==='B'&&r.kind==='image'))).toBe(true);
  if(option==='C'){await expect.poll(()=>page.locator('[data-showcase-kind]').evaluateAll(nodes=>nodes.every(el=>el.getAnimations().length===0))).toBe(true);await page.getByRole('button',{name:'Replay',exact:true}).click();await staticGrid();assert.equal(await page.evaluate(()=>window.motionRecords.length),before);}
 }
 const records=await page.evaluate(()=>window.motionRecords);assert.ok(records.every(r=>!r.containsProduct&&r.option!=='C'));assert.ok(!records.some(r=>r.option==='A'&&r.kind==='image'));
 // Replay on A while an editorial target is in view must create fresh, scoped motion.
 await page.getByRole('button',{name:/^Option A —/}).click();await page.locator('#editorial').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 const count=await page.evaluate(()=>window.motionRecords.length);await page.getByRole('button',{name:'Replay',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.motionRecords.length)).toBeGreaterThan(count);
 for(const image of await page.locator('img:visible').all())await image.scrollIntoViewIfNeeded();
 await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(el=>el.complete&&el.naturalWidth>0))).toBe(true);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${directory}/showcase-${width}.png`,fullPage:true,animations:'disabled'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:/^Option B —/}).click();
 const reducedCount=await page.evaluate(()=>window.motionRecords.length);for(const scene of await page.locator('main section').all())await scene.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.getByRole('button',{name:'Replay',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.motionRecords.length),reducedCount);await staticGrid();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 return {width,storefrontRevealRestored:true,productHoverRestored:true,categoryHoverRestored:true,galleryHoverRestored:true,routeMotionRestored:true,footerAndWhatsAppPreserved:true,showcaseOptions:['A','B','C'],gridStaticAllOptions:true,replay:true,reducedMotion:true,overflow:false};
}
export async function runMotionIsolation(){
 const source=verifyRestoration();const directory='artifacts/motion-isolation';await mkdir(directory,{recursive:true});const origin=process.env.CLAUDE_PREVIEW_URL||'http://localhost:3013';const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
 try{for(const width of [390,1440]){const page=await browser.newPage({viewport:{width,height:1000}});results.push(await verifyIsolation(page,{origin,width,directory}));await page.close();console.log('PASS motion restoration and isolation '+width+'px');}}
 finally{await browser.close();await writeFile(directory+'/verification.json',JSON.stringify({origin,source,results},null,2));}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await runMotionIsolation();
