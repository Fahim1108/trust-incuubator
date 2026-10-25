import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
const origin=process.env.CLAUDE_PREVIEW_URL||'http://localhost:3001',directory='artifacts/ui-refinement';
await mkdir(directory,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try{
 for(const width of [360,390,430,768,1024,1280,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},...(width===390||width===1440?{recordVideo:{dir:directory, size:{width:Math.min(width,1440),height:1000}}}:{})});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin,{waitUntil:'networkidle'});
  await expect(page.getByRole('button',{name:/Quick view/i})).toHaveCount(0);
  await expect(page.getByText('Created by Firoj Ahamed Fahim',{exact:true})).toBeVisible();
  await expect(page.locator('footer a[href="https://wa.me/8801632915921"]')).toBeVisible();
  if(width>=1024){
   const logo=page.locator('header a[href="/"]').filter({has:page.locator('img')});const box=await logo.boundingBox();assert.ok(Math.abs(box.x+box.width/2-width/2)<2,'Centered header logo');
   const links=await page.locator('nav[aria-label="Main"] > ul > li > a').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};}));
   for(let i=1;i<links.length;i++)assert.ok(links[i].left>=links[i-1].right,'Navigation overlaps');
   await page.getByLabel('Account menu',{exact:true}).click();await expect(page.getByRole('navigation',{name:'Customer account'}).getByRole('link',{name:'Sign In',exact:true})).toBeVisible();
  }
  const wish=page.getByRole('button',{name:/^Add .* to wishlist$/}).first();await wish.click();await expect(page.getByRole('button',{name:/^Remove .* from wishlist$/}).first()).toHaveAttribute('aria-pressed','true');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.goto(origin+'/category/shirts',{waitUntil:'networkidle'});
  if(width<1024)await page.getByRole('button',{name:/^Filter/}).click();
  await expect(page.getByRole('button',{name:'Price',exact:true})).toHaveCount(0);await expect(page.getByRole('textbox',{name:'Min',exact:true})).toHaveCount(0);
  const size=page.getByRole('button',{name:'M (40)',exact:true});await expect(size).toBeVisible();await size.click();await page.waitForURL(url=>url.searchParams.get('size')==='M'||url.searchParams.get('sizes')==='M');
  await expect(size).toHaveAttribute('aria-pressed','true');
  await page.goto(origin+'/product/premium-cotton-shirt',{waitUntil:'networkidle'});
  const sizeRadio=page.getByRole('radio',{name:'Size M',exact:true});await sizeRadio.click();await expect(sizeRadio).toHaveAttribute('aria-checked','true');
  await expect(page.getByText('Size: M (40)',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Buy Now',exact:true})).toHaveCSS('background-color','rgb(64, 0, 0)');
  await expect(page.getByRole('button',{name:'Add to Cart',exact:true})).toHaveCSS('background-color','rgb(255, 255, 255)');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(350); // Screenshot only: settle the existing sticky header.
  await page.screenshot({path:`${directory}/product-${width}.png`,fullPage:true,animations:'disabled'});
  if(width>=768){await page.getByRole('button',{name:'Buy Now',exact:true}).hover();await page.waitForTimeout(250);}
  await page.getByRole('button',{name:'Add to Cart',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
  await page.goto(origin+'/account',{waitUntil:'networkidle'});assert.equal(new URL(page.url()).pathname,'/account/login');
  await page.getByRole('textbox',{name:'Email or Mobile',exact:true}).fill('ui-test@example.invalid');
  await page.getByLabel('Password',{exact:true}).fill('not-a-real-password');
  await page.getByRole('button',{name:'Show password',exact:true}).click();await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','text');
  // Hold the genuine action request for inspection; preserve its actual failure response.
  await page.route('**/account/login',async route=>{if(route.request().method()==='POST'){await new Promise(r=>setTimeout(r,600));}await route.continue();});
  await page.getByRole('button',{name:'Sign In',exact:true}).click();
  await expect(page.getByRole('button',{name:'Sign In',exact:true})).toBeDisabled();
  const art=page.locator('[data-aa-loader] [data-loader-ring]');
  if(width<768)await expect(art).toBeVisible();else await expect(art).toBeHidden();
  await expect(page.getByText(/Sign in is not connected yet/)).toBeVisible();
  await page.goto(origin+'/track-order',{waitUntil:'networkidle'});await expect(page.getByRole('button',{name:'Track',exact:true})).toBeDisabled();
  await page.goto(origin+'/motion-preview',{waitUntil:'networkidle'});
  const stage=page.locator('[aria-current="step"] [data-tracking-indicator]');await expect(stage).toHaveCSS('animation-duration','2.4s');
  await page.getByRole('button',{name:'Test Loading Animation',exact:true}).click();
  const overlay=page.locator('[data-aa-loader="overlay"]');
  if(width<768){await expect(overlay.locator('[data-loader-ring]')).toBeVisible();await expect(overlay.locator('[data-loader-ring]')).toHaveCSS('animation-duration','1.6s');}else await expect(overlay.locator('[data-loader-ring]')).toBeHidden();
  await expect(page.locator('[data-demo-result]')).toContainText('Demonstration finished',{timeout:5000});
  await page.emulateMedia({reducedMotion:'reduce'});await expect(stage).toHaveCSS('animation-name','none');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(350);
  await page.screenshot({path:`${directory}/motion-${width}.png`,fullPage:true,animations:'disabled'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  await context.close();results.push({width,status:'passed'});console.log(`PASS refinement ${width}px`);
 }
}finally{await browser.close();await writeFile(directory+'/verification.json',JSON.stringify({origin,results,limitations:'No live authentication, tracking or payment services. Tracking fixture only on gated motion-preview.'},null,2));}
