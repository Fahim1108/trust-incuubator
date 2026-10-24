import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
const origin='http://localhost:3001';
await mkdir('artifacts/claude',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report=[];
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const routes=['/','/shop','/categories','/brands','/product/premium-cotton-shirt','/cart','/checkout','/account','/account/login','/account/register','/account/forgot-password','/wishlist','/track-order','/about','/contact','/faq','/shipping-policy','/return-policy','/privacy-policy','/terms'];
  for(const route of routes){
   const res=await page.goto(origin+route,{waitUntil:'networkidle'});
   assert.equal(res.status(),200,`${width}px ${route}`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow: ${width}px ${route}`);
   await expect(page.getByRole('complementary',{name:'Design preview notice'})).toBeVisible();
   assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
   if(route==='/'){
    await page.screenshot({path:`artifacts/claude/home-${width}.png`,fullPage:true});
    await page.screenshot({path:`artifacts/claude/preview-${width}.png`});
    assert.equal(await page.locator('img[alt="Attires Arena"]').first().evaluate(e=>e.complete&&e.naturalWidth>0),true);
   }
   if(route.startsWith('/product/')){
    const second=page.getByRole('button',{name:/^Show image 2 of/});await second.click();await expect(second).toHaveAttribute('aria-current','true');
    await page.getByRole('button',{name:'Open zoomed image',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
   }
   if(['/shop','/product/premium-cotton-shirt','/checkout'].includes(route))await page.screenshot({path:`artifacts/claude/${route.split('/')[1]}-${width}.png`,fullPage:true});
   report.push({width,route,status:'passed'});
  }
  assert.deepEqual(errors,[],`Browser exceptions ${width}px`);
  const admin=await page.goto(origin+'/admin/appearance');assert.equal(admin.status(),404);
  await page.goto(origin+'/',{waitUntil:'networkidle'});
  const cartButton=page.getByRole('button',{name:width<768?/^Cart \(/:/^Open cart/}).last();
  await cartButton.click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  console.log(`PASS ${width}px: 20 routes, white pages, no overflow or browser exceptions, logo, cart drawer, admin 404`);
  const wish=page.getByRole('button',{name:/^Add .* to wishlist$/}).first();
  const removedName=(await wish.getAttribute('aria-label')).replace(/^Add /,'Remove ').replace(/ to wishlist$/,' from wishlist');
  await wish.click(); await expect(page.getByRole('button',{name:removedName,exact:true}).first()).toHaveAttribute('aria-pressed','true');
  await page.reload({waitUntil:'networkidle'});
  await expect(page.getByRole('button',{name:removedName,exact:true}).first()).toHaveAttribute('aria-pressed','true');
  const search=page.locator('input[type=search]:visible').first();
  await search.fill('cotton'); await search.press('Enter');
  await page.waitForURL(url=>url.pathname==='/shop'&&url.searchParams.get('q')==='cotton');
  await page.getByRole('combobox',{name:/sort/i}).selectOption('price-asc');
  await page.waitForURL(url=>url.searchParams.get('sort')==='price-asc');
  console.log(`PASS ${width}px: wishlist persistence, search and URL sorting`);
  await page.close();
 }
}finally{await browser.close();await writeFile('artifacts/claude/verification.json',JSON.stringify(report,null,2)+'\n');}
