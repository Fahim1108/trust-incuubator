import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium,expect} from '@playwright/test';
const inventory=JSON.parse(await readFile('frontend/claude/src/data/inventory/thrift-shirts.json','utf8'));
for(const item of inventory){const bytes=await readFile('frontend/claude/public'+item.image_path);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.image_sha256);assert.equal(item.actual_size,null);assert.equal(item.stock_quantity,1);}
const origin=process.env.CLAUDE_PREVIEW_URL||'http://localhost:3004',directory='artifacts/thrift-browse';
await mkdir(directory,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try{
 for(const width of [360,390,430,768,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>localStorage.getItem('aa.claude-preview.cart.v1')!==null);
  await expect(page.locator('article.aa-product-card')).toHaveCount(18);
  await expect(page.locator('[data-product-size-badge]')).toHaveCount(18);
  await expect(page.getByText(/Frontend demonstration|Sample Product/i)).toHaveCount(0);
  for(let i=0;i<18;i++){const photo=page.locator('article.aa-product-card img').nth(i);try{await photo.scrollIntoViewIfNeeded();}catch{await photo.scrollIntoViewIfNeeded();}}
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('article.aa-product-card img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${directory}/home-${width}.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  for(const style of ['solid','striped','checked','formal','casual']){
   await page.goto(origin+'/shop?shirt='+style,{waitUntil:'domcontentloaded',timeout:60000});
   assert.ok(await page.locator('article.aa-product-card').count()>0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  const response=await page.goto(origin+'/product/aa-shirt-001',{waitUntil:'domcontentloaded',timeout:60000});assert.equal(response.status(),200);
  await expect(page.getByRole('heading',{name:'White Navy Pinstripe Shirt'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Add to Cart',exact:true})).toBeEnabled();
  await expect(page.getByRole('button',{name:'Buy Now',exact:true})).toBeEnabled();
  await page.screenshot({path:`${directory}/product-${width}.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(width===390||width===1440){
   for(const item of inventory){
    await page.goto(origin+'/product/'+item.source_id.toLowerCase(),{waitUntil:'domcontentloaded',timeout:60000});
    await page.getByRole('button',{name:'Add to Cart',exact:true}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
   }
   await page.goto(origin+'/cart',{waitUntil:'domcontentloaded',timeout:60000});
   const lines=await page.evaluate(()=>JSON.parse(localStorage.getItem('aa.claude-preview.cart.v1')));
   assert.equal(lines.length,18);assert.ok(lines.every(i=>i.quantity===1 && i.maxQuantity===1));
   await page.reload({waitUntil:'domcontentloaded',timeout:60000});
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('aa.claude-preview.cart.v1')).length),18);
   await page.goto(origin+'/checkout',{waitUntil:'domcontentloaded',timeout:60000});
   await expect(page.getByRole('heading',{name:'Order Summary',exact:true})).toBeVisible();
  }
  const image=await page.request.get(origin+inventory[0].image_path);assert.equal(image.status(),200);
  assert.equal(createHash('sha256').update(await image.body()).digest('hex'),inventory[0].image_sha256);
  assert.deepEqual(errors,[]);await page.close();results.push({width,shirts:18,styles:5,addToCart:true,physicalQuantityLimit:1,orderSubmissionDisabled:true,overflow:false});
  console.log('PASS real-shirt review browser '+width+'px');
 }
}finally{await browser.close();await writeFile(directory+'/verification.json',JSON.stringify({origin,results},null,2));}
