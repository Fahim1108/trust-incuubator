import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';

export async function verifyRefinement(page,{origin,width,directory,extended=true}){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 page.setDefaultTimeout(15000);
 const navigate=path=>page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:60000});
 const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await navigate('/');await page.waitForFunction(()=>localStorage.getItem('aa.claude-preview.cart.v1')!==null);
 await expect(page.locator('header input[type="search"]:visible')).toBeVisible();
 await expect(page.locator('[data-section]')).toHaveCount(5);
 assert.deepEqual(await page.locator('[data-section]').evaluateAll(nodes=>nodes.map(n=>n.dataset.section)),['hero','categories','sizes','new-arrivals','featured']);
 await expect(page.locator('article.aa-product-card')).toHaveCount(16);
 const hrefs=await page.locator('article.aa-product-card h3 a').evaluateAll(links=>links.map(l=>l.getAttribute('href')));assert.equal(new Set(hrefs).size,16);
 const sizes=page.getByRole('region',{name:'Shop by Size',exact:true});
 await expect(sizes.locator('[aria-disabled="true"]')).toHaveCount(7);await expect(sizes.locator('a')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'The Thrift Shirt Collection',exact:true})).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Shop by Brands',exact:true})).toHaveCount(0);
 const carousel=page.getByRole('region',{name:'Attires Arena campaigns'});
 const frame=carousel.locator('[data-banner-frame]');
 const dimensions=await frame.boundingBox();assert.ok(dimensions.height>=(width<768?220:380)&&dimensions.height<=(width<768?300:460));
 assert.ok(await carousel.locator('img').evaluateAll(imgs=>imgs.every(i=>getComputedStyle(i).objectFit==='contain')));
 const active=()=>carousel.locator('[aria-roledescription="slide"][aria-hidden="false"]');
 const first=await active().getAttribute('aria-label');await page.mouse.move(0,0);await page.waitForTimeout(3300);assert.equal(await active().getAttribute('aria-label'),first);
 await carousel.getByRole('button',{name:'Previous banner'}).click();await expect(active()).toHaveAttribute('aria-label',/^3 of 3/);
 await carousel.getByRole('button',{name:'Next banner'}).click();await expect(active()).toHaveAttribute('aria-label',/^1 of 3/);
 await expect(carousel.getByRole('button',{name:'Pause banners'})).toHaveCount(0);
 for(const image of await page.locator('main article.aa-product-card img:visible').all()) {try{await image.scrollIntoViewIfNeeded();}catch{await image.scrollIntoViewIfNeeded();}}
 await page.locator('footer').scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('main article.aa-product-card img,footer img').evaluateAll(imgs=>imgs.filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
 await page.evaluate(()=>scrollTo(0,0));await noOverflow();
 await page.screenshot({path:`${directory}/home-${width}.png`,fullPage:true,animations:'disabled'});
 await navigate('/product/aa-shirt-001');
 await expect(page.getByRole('button',{name:'Add to Cart',exact:true})).toBeEnabled();
 const guide=page.getByRole('button',{name:'Size Guide',exact:true});await expect(guide).toBeVisible();
 const quantity=await page.getByText('Quantity',{exact:true}).boundingBox(),guideBox=await guide.boundingBox();assert.ok(guideBox.y>quantity.y);
 await guide.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('row')).toHaveCount(8);await expect(dialog.getByText('Over Size',{exact:true})).toBeVisible();
 await expect(dialog.getByText('Not specified',{exact:true})).toBeVisible();await expect(dialog.getByText('Individual thrift garments may vary in measurements. Please check the actual product measurements when available.')).toBeVisible();
 await noOverflow();await page.screenshot({path:`${directory}/size-guide-${width}.png`,fullPage:true,animations:'disabled'});
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(guide).toBeFocused();
 await page.getByRole('button',{name:'Add to Cart',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
 await navigate('/checkout');await expect(page.locator('[data-checkout-content]')).toBeVisible();await expect(page.locator('header input[type="search"]')).toHaveCount(0);
 for(const [field,value] of [['fullName','Preview Test Customer'],['phone','01700000000'],['addressLine','Preview test address only']])await page.locator('#checkout-'+field).fill(value);
 await page.locator('#checkout-division').selectOption('Dhaka');await page.locator('#checkout-district').selectOption('Dhaka');await page.locator('#checkout-area').selectOption('Banani');
 await expect(page.locator('[data-summary-advance]')).toHaveText('৳70');
 await page.getByRole('button',{name:'Continue to Payment',exact:true}).click();
 await expect(page.getByText('অর্ডার কনফার্ম করতে ডেলিভারি চার্জ পে করুন।',{exact:true})).toBeVisible();
 const panel=page.locator('[data-advance-payment]');
 for(const mode of ['cod','online']){
  if(mode==='online')await page.getByRole('radio',{name:/^Full Online Payment/}).check();
  await expect(panel.getByRole('heading',{name:'যেভাবে পেমেন্ট করবেন',exact:true})).toBeVisible();
  await expect(panel.getByText('২. আপনার bKash/Nagad অ্যাপ খুলে Send Money অপশনে যান।',{exact:true})).toBeVisible();
  for(const method of ['bKash','Nagad']){
   await panel.getByRole('tab',{name:'Personal '+method,exact:true}).click();
   await expect(panel.locator('[data-recipient-number]')).toHaveText('01635706962');
   await expect(panel.getByRole('button',{name:'Copy Number',exact:true})).toBeEnabled();
   await expect(panel.getByRole('button',{name:'Submit Payment',exact:true})).toBeDisabled();
  }
  await expect(panel.getByText('Not created yet',{exact:true})).toBeVisible();await noOverflow();
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`${directory}/payment-${mode}-${width}.png`,fullPage:true,animations:'disabled'});
 }
 await page.getByRole('button',{name:'Review Order',exact:true}).click();await expect(page.getByRole('button',{name:/Place Order/})).toBeDisabled();
 await expect(page.getByRole('heading',{name:'Your Order Is Confirmed!',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Edit',exact:true}).first().click();await expect(page.locator('#checkout-fullName')).toHaveValue('Preview Test Customer');
 await page.getByRole('textbox',{name:'Coupon code',exact:true}).fill('NONISSUED10');await page.getByRole('button',{name:'Apply',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Sign in to redeem your coupon',exact:true})).toBeVisible();await page.getByRole('button',{name:'Continue as guest',exact:true}).click();
 await expect(page.locator('#checkout-fullName')).toHaveValue('Preview Test Customer');await noOverflow();
 if(extended){
  for(const route of ['/account/login','/account/register','/account/forgot-password']){await navigate(route);await expect(page.locator('header input[type="search"]')).toHaveCount(0);await noOverflow();}
  for(const route of ['/shop','/category/shirts']){await navigate(route);await expect(page.locator('header input[type="search"]:visible')).toBeVisible();await expect(page.getByRole('heading',{name:/\(18\)/})).toBeVisible();await noOverflow();}
  for(const filter of ['sizes=M','shirt=linen','collection=winter']){await navigate('/shop?'+filter);await expect(page.locator('article.aa-product-card')).toHaveCount(0);}
  await navigate('/category/pants');await expect(page.getByRole('heading',{name:'Coming Soon',exact:true})).toBeVisible();
 }
 assert.deepEqual(errors,[]);
 return {width,manualCompactHero:true,homeSections:5,originalProducts:18,guide:'official modal, focus restored',compactHeader:true,banglaPayments:true,liveSubmission:false,guestContextRetained:true,verifiedSizeFiltersOnly:true,overflow:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const directory='artifacts/final-refinement';await mkdir(directory,{recursive:true});
 const origin=process.env.CLAUDE_PREVIEW_URL||'http://localhost:3007';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
 try{for(const width of [360,390,430,768,1440]){const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});results.push(await verifyRefinement(page,{origin,width,directory}));await page.close();console.log(`PASS final refinement ${width}px`);}}
 finally{await browser.close();await writeFile(directory+'/verification.json',JSON.stringify({origin,results},null,2));}
}
