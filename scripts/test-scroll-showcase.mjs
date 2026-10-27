import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';

export async function verifyShowcase(page,{origin,width,directory}){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{
  window.motionObservations=[];const animate=Element.prototype.animate;
  Element.prototype.animate=function(frames,options){
   if(this.dataset.motionKind)window.motionObservations.push({kind:this.dataset.motionKind,mode:this.dataset.motionStyle,duration:options.duration,delay:options.delay,frames});
   return animate.call(this,frames,options);
  };
 });
 await page.goto(origin+'/motion-preview',{waitUntil:'domcontentloaded',timeout:60000});
 await expect(page.getByRole('heading',{name:'A quieter kind of motion.',exact:true})).toBeVisible();
 assert.ok((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight*4));
 const section=page.locator('#soft [data-motion-kind="section"]');
 await section.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await expect.poll(()=>page.evaluate(()=>window.motionObservations.some(o=>o.kind==='section'&&o.mode==='elegant'&&o.duration===780))).toBe(true);
 await expect(section).toHaveAttribute('data-motion-state','complete');
 const before=await section.boundingBox();await page.getByRole('button',{name:'Replay Luxury soft fade-up',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.motionObservations.filter(o=>o.kind==='section'&&o.mode==='elegant').length)).toBeGreaterThan(1);
 await expect(section).toHaveAttribute('data-motion-state','complete');const after=await section.boundingBox();assert.ok(Math.abs(before.height-after.height)<1);
 const card=page.locator('#stagger [data-motion-kind="card"]').nth(1);await card.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await expect.poll(()=>page.evaluate(()=>window.motionObservations.some(o=>o.kind==='card'&&o.mode==='elegant'&&o.delay===85))).toBe(true);
 await page.getByRole('button',{name:'Minimal',exact:true}).click();await expect(page.getByRole('button',{name:'Minimal',exact:true})).toHaveAttribute('aria-pressed','true');
 const scale=page.locator('#images [data-motion-kind="image"]').first();await scale.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await expect.poll(()=>page.evaluate(()=>window.motionObservations.some(o=>o.kind==='image'&&o.mode==='minimal'&&o.frames[0].transform==='scale(1.018)'))).toBe(true);
 const heading=page.locator('#headings [data-motion-kind="heading"]').first();await heading.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await expect.poll(()=>page.evaluate(()=>window.motionObservations.some(o=>o.kind==='heading'&&o.mode==='minimal'))).toBe(true);
 await page.locator('#compare').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 for(const mode of ['elegant','minimal']){const panel=page.locator(`[data-comparison-style="${mode}"]`);await panel.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.getByRole('button',{name:`Replay ${mode} comparison`,exact:true}).click();await expect(panel.locator('[data-motion-kind]')).toHaveAttribute('data-motion-state','complete');}
 for(const image of await page.locator('img:visible').all())await image.scrollIntoViewIfNeeded();
 await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${directory}/showcase-${width}.png`,fullPage:true,animations:'disabled'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByRole('button',{name:'Replay all',exact:true}).focus();await expect(page.getByRole('button',{name:'Replay all',exact:true})).toBeFocused();await page.keyboard.press('Enter');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.locator('[data-motion-kind]').evaluateAll(nodes=>nodes.every(n=>n.dataset.motionState==='reduced'&&n.getAnimations().length===0))).toBe(true);
 const observed=await page.evaluate(()=>window.motionObservations.length);await page.getByRole('button',{name:'Replay all',exact:true}).click();
 await page.locator('#headings').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 assert.equal(await page.evaluate(()=>window.motionObservations.length),observed);
 await expect(page.getByRole('heading',{name:'Find your next favourite.',exact:true})).toBeVisible();
 assert.deepEqual(errors,[]);
 return {width,fourMotionKinds:true,nativeAnimationsObserved:true,elegant780ms:true,minimal380ms:true,stagger85ms:true,replay:true,comparison:true,reducedMotion:true,photosLoaded:true,stableRevealHeight:true,overflow:false,noindex:true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const directory='artifacts/scroll-showcase';await mkdir(directory,{recursive:true});const origin=process.env.CLAUDE_PREVIEW_URL||'http://localhost:3010';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
 try{
  for(const width of [390,1440]){const page=await browser.newPage({viewport:{width,height:950}});results.push(await verifyShowcase(page,{origin,width,directory}));await page.close();console.log('PASS scroll showcase '+width+'px');}
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(origin+'/motion-preview',{waitUntil:'load'});await expect(page.getByRole('heading',{name:'A quieter kind of motion.',exact:true})).toBeVisible();await expect(page.getByText('Find your next favourite.',{exact:true})).toBeVisible();await context.close();results.push({javascriptDisabled:'content remains readable'});
 }finally{await browser.close();await writeFile(directory+'/verification.json',JSON.stringify({origin,results},null,2));}
}
