import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';

export async function verifyQuietMotion(page,{origin,width,directory}){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{window.quietObservations=[];const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){window.quietObservations.push({tag:this.tagName,text:this.textContent?.slice(0,80),heading:this.dataset.quietHeading,hasProducts:!!this.querySelector('article,img'),frames,duration:options?.duration,delay:options?.delay});return original.call(this,frames,options);};});
 const goto=path=>page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:60000});
 const stable=async()=>{
  const state=await page.locator('article.aa-product-card,article.aa-product-card img,[aria-label="Shop by Categories"] ul,[aria-label="Shop by Size"] ul').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().width).map(node=>{const chain=[];for(let el=node;el&&el.tagName!=='BODY';el=el.parentElement){const c=getComputedStyle(el);chain.push({opacity:c.opacity,transform:c.transform,scale:c.scale});}return chain;}));
  for(const chain of state)for(const s of chain){assert.equal(s.opacity,'1');assert.equal(s.transform,'none');assert.ok(s.scale==='none'||s.scale==='1');}
 };
 await goto('/');await page.waitForFunction(()=>localStorage.getItem('aa.claude-preview.cart.v1')!==null);await expect(page.locator('[data-section]')).toHaveCount(5);
 const initial=await page.locator('[data-heading-state="initial"]').allTextContents();
 await expect(page.locator('article.aa-product-card')).toHaveCount(16);await stable();
 for(const section of ['categories','sizes','new-arrivals','featured']){const target=page.locator(`[data-section="${section}"]`);await target.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await stable();}
 await expect.poll(()=>page.evaluate(()=>window.quietObservations.length)).toBeGreaterThan(0);
 const observations=await page.evaluate(()=>window.quietObservations);
 for(const o of observations){assert.ok(['H1','H2','H3','H4'].includes(o.tag));assert.equal(o.heading,'true');assert.equal(o.hasProducts,false);assert.ok(o.duration>=300&&o.duration<=400);assert.ok(!o.delay);assert.ok(o.frames.every(f=>Object.keys(f).every(k=>k==='opacity')));assert.ok(!initial.some(text=>text===o.text));}
 const count=observations.length;
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));for(const section of ['new-arrivals','featured'])await page.locator(`[data-section="${section}"]`).evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 assert.equal(await page.evaluate(()=>window.quietObservations.length),count);
 const image=page.locator('article.aa-product-card img:visible').first();await image.hover();await expect(image).toHaveCSS('transform','none');await stable();
 const ripple=page.locator('[data-whatsapp-support]');await expect(ripple).toHaveCount(1);assert.ok((await ripple.evaluate(el=>getComputedStyle(el,'::before').animationName)).includes('whatsapp-ripple'));
 for(const img of await page.locator('article.aa-product-card img:visible').all())await img.scrollIntoViewIfNeeded();await page.locator('footer').scrollIntoViewIfNeeded();
 await expect.poll(()=>page.locator('article.aa-product-card img:visible').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${directory}/home-${width}.png`,fullPage:true,animations:'disabled'});
 // Client-side navigation, not just hard reload: route containers must not animate products.
 await page.locator('article.aa-product-card h3 a:visible').first().click();await page.waitForURL('**/product/**');
 const gallery=page.getByRole('img',{name:'White Navy Pinstripe Shirt',exact:true});await expect.poll(()=>gallery.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);await gallery.hover();await expect(gallery).toHaveCSS('transform','none');
 await page.getByRole('button',{name:'Buy Now',exact:true}).click();await page.waitForURL('**/checkout');await expect(page.locator('[data-checkout-content]')).toBeVisible();
 await expect(page.locator('[data-route-motion]')).toHaveCSS('transform','none');await expect(page.locator('[data-route-motion]')).toHaveCSS('opacity','1');
 await goto('/account/login');await expect(page.locator('[data-route-motion]')).toHaveCSS('transform','none');
 await goto('/account/register');await expect(page.locator('[data-route-motion]')).toHaveCSS('transform','none');
 await goto('/shop');await expect(page.locator('article.aa-product-card')).toHaveCount(12);await stable();
 await goto('/motion-preview');await expect(page.getByRole('heading',{name:'Quiet by design.',exact:true})).toBeVisible();
 for(const section of await page.locator('main section').all()){await section.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));assert.ok(await section.locator('img').evaluateAll(images=>images.every(img=>getComputedStyle(img).transform==='none')));}
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.locator('[data-quiet-heading]').evaluateAll(nodes=>nodes.every(node=>node.getAnimations().length===0))).toBe(true);
 await goto('/');for(const section of await page.locator('[data-section]').all())await section.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 assert.equal(await page.evaluate(()=>window.quietObservations.length),0);await stable();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 return {width,headingsOnly:true,opacityOnly350ms:true,triggerOnce:true,initialHeadingsStatic:true,productsStatic:true,hoverNoZoom:true,routeMotionDisabled:true,photosLoaded:true,whatsappRipplePreserved:true,reducedMotion:true,overflow:false};
}
export async function runQuietMotion(){const directory='artifacts/quiet-motion';await mkdir(directory,{recursive:true});const origin=process.env.CLAUDE_PREVIEW_URL||'http://localhost:3012';const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const results=[];try{for(const width of [360,390,430,768,1440]){const page=await browser.newPage({viewport:{width,height:950}});results.push(await verifyQuietMotion(page,{origin,width,directory}));await page.close();console.log('PASS quiet motion '+width+'px');}}finally{await browser.close();await writeFile(directory+'/verification.json',JSON.stringify({origin,results},null,2));}}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await runQuietMotion();
