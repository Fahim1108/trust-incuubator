import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {mkdir,readFile} from 'node:fs/promises';
import {totpCode} from './verify-browser.mjs';
export async function verifyGenericDraftBrowser({baseURL,accessURL,proxy,email,password,secret,product,onCreatedId}){
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,...(proxy?{proxy}:{})});
 const context=await browser.newContext({baseURL,viewport:{width:1440,height:900}});
 context.setDefaultTimeout(30000);context.setDefaultNavigationTimeout(45000);
 const page=await context.newPage();
 async function tab(name){await page.getByRole('tab',{name,exact:true}).click();}
 async function capture(name){
  await mkdir('artifacts/admin/experience',{recursive:true});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>Array.from(document.images).filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0));
  for(const width of [390,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`artifacts/admin/experience/${name}-${width}.png`,fullPage:true});}
 }
 try{
  console.log('BROWSER: deployment access and protected product');
  await page.goto(accessURL);await page.goto('/admin/products/'+product);
  await page.waitForURL('**/admin/sign-in');
  await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Sign in securely'}).click();await page.waitForURL('**/admin/mfa');
  console.log('BROWSER: existing temporary TOTP verification');
  await page.getByLabel('Authenticator code').fill(totpCode(secret));
  await page.getByRole('button',{name:'Verify and continue'}).click();await page.waitForURL(url=>url.pathname==='/admin');
  await capture('dashboard');
  if(onCreatedId){
   await page.goto('/admin/products/new');const id=await page.locator('input[name=request_id]').inputValue();onCreatedId(id);
   await page.getByLabel('Product name',{exact:true}).fill('Disposable guided creation');
   await page.getByRole('button',{name:'Create draft',exact:true}).click();await page.getByRole('link',{name:'Continue to product workspace →',exact:true}).click();
   await page.waitForURL('**/admin/products/'+id);await page.getByRole('tab',{name:'Details',exact:true}).waitFor();
   console.log('BROWSER: guided draft creation opens its persisted product workspace');
  }
  await page.goto('/admin/products/'+product);
  console.log('BROWSER: persisted draft edit');
  await page.getByRole('heading',{name:'Edit draft details',exact:true}).waitFor();
  await page.getByLabel('Product name',{exact:true}).fill('Unsaved tab retention check');
  if(process.argv.includes('--gallery')){await tab('Images');await tab('Details');assert.equal(await page.getByLabel('Product name',{exact:true}).inputValue(),'Unsaved tab retention check');}
  const detailTab=page.getByRole('tab',{name:'Details',exact:true});await detailTab.focus();await detailTab.press('ArrowRight');await page.getByRole('tab',{name:'Details',exact:true}).click();
  await page.getByLabel('Product name',{exact:true}).fill('Hosted audited product edit');
  await page.locator('textarea[name="description"]').fill('Saved through the actual Staging product editor.');
  await page.getByRole('button',{name:'Save draft details',exact:true}).click();
  await page.getByRole('heading',{name:'Hosted audited product edit',exact:true}).waitFor();
  await page.reload();assert.equal(await page.getByLabel('Product name',{exact:true}).inputValue(),'Hosted audited product edit');
  await capture('details');
  if(process.argv.includes('--taxonomy')){
   const name='Hosted QA brand '+product.slice(0,8);
   await page.goto('/admin/taxonomy?kind=brand');
   const creation=page.locator('details').filter({has:page.getByText('Create brand',{exact:true})});
   await creation.locator('summary').click();
   await creation.getByLabel('Name',{exact:true}).fill(name);await creation.getByLabel('URL slug',{exact:true}).fill('qa-hosted-brand-'+product);
   await creation.getByRole('button',{name:'Create catalogue record',exact:true}).click();
   const record=page.locator('article').filter({has:page.getByRole('heading',{name,exact:true})});await record.waitFor();
   await record.locator('summary').click();await record.getByLabel('Name',{exact:true}).fill(name+' updated');await record.getByRole('button',{name:'Save catalogue record',exact:true}).click();
   await page.getByRole('heading',{name:name+' updated',exact:true}).waitFor();
   await mkdir('artifacts/admin/taxonomy',{recursive:true});
   for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:`artifacts/admin/taxonomy/records-${width}.png`,fullPage:true});
   }
   await page.goto('/admin/products/'+product);
   const originalVersion=await page.locator('input[name=updated_at]').first().inputValue();
   await page.getByLabel('Product name',{exact:true}).fill('Unsaved cross-tab edit');
   await tab('Organization');
   const brand=page.getByLabel('Brand',{exact:true});await brand.selectOption({label:name+' updated'});
   const selected=await brand.inputValue();
   await page.getByRole('button',{name:'Save product taxonomy',exact:true}).click();
   await page.getByText('Product category and terms saved.',{exact:true}).waitFor();
   await tab('Details');assert.equal(await page.getByLabel('Product name',{exact:true}).inputValue(),'Unsaved cross-tab edit');
   assert.equal(await page.locator('input[name=updated_at]').first().inputValue(),originalVersion);
   await page.getByRole('button',{name:'Save draft details',exact:true}).click();await page.getByRole('alert').filter({hasText:'This draft changed'}).waitFor();
   assert.equal(await page.getByLabel('Product name',{exact:true}).inputValue(),'Unsaved cross-tab edit');
   page.once('dialog',dialog=>dialog.accept());
   await page.reload();await tab('Organization');assert.equal(await page.getByLabel('Brand',{exact:true}).inputValue(),selected);
   console.log('BROWSER: unsaved fields survive another-tab save and retain stale-write protection');
   console.log('BROWSER: taxonomy creation/edit and product-brand assignment persist after reload');
  }
  if(process.argv.includes('--variants')){
   await tab('Variants');await page.locator('.aa-add-variant>summary').click();
   const sku='HOSTED-QA-'+product.slice(0,8);
   const form=page.locator('form').filter({has:page.getByRole('button',{name:'Create SKU',exact:true})});
   await form.getByLabel('SKU',{exact:true}).fill(sku);await form.getByLabel('Actual size',{exact:true}).fill('M');await form.getByLabel('Actual color',{exact:true}).fill('Synthetic UI');
   await form.getByLabel('Regular price (BDT)',{exact:true}).fill('550.50');await form.getByLabel('Sale price (BDT, optional)',{exact:true}).fill('500');
   await form.getByRole('button',{name:'Create SKU',exact:true}).click();
   await tab('Stock');
   const summary=page.getByRole('tabpanel',{name:'Stock',exact:true}).locator('article').filter({has:page.getByRole('heading',{name:sku,exact:true})});
   await summary.getByText('On hand: 0 · Reserved: 0 · Available: 0',{exact:true}).waitFor();
   const stock=summary.locator('details');await stock.locator('summary').click();
   await stock.getByLabel('Quantity change').fill('1');await stock.getByLabel('Adjustment reason').fill('Hosted synthetic inventory count');
   await stock.getByRole('button',{name:'Record stock adjustment',exact:true}).click();
   await summary.getByText('On hand: 1 · Reserved: 0 · Available: 1',{exact:true}).waitFor();
   await stock.getByLabel('Quantity change').fill('-2');await stock.getByLabel('Adjustment reason').fill('Invalid negative inventory check');await stock.getByRole('button',{name:'Record stock adjustment',exact:true}).click();
   await stock.getByRole('alert').waitFor();assert(await summary.getByText('On hand: 1 · Reserved: 0 · Available: 1',{exact:true}).count());
   console.log('BROWSER: exact pricing/SKU creation, zero initial stock, genuine audited stock addition and negative-stock rejection');
  }
  if(process.argv.includes('--gallery')){
   await tab('Images');
   await page.getByLabel('Product images',{exact:true}).setInputFiles([
    {name:'shirt-16.jpg',mimeType:'image/jpeg',buffer:await readFile('frontend/claude/public/inventory/thrift-shirts/AA-SHIRT-016-front.jpg')},
    {name:'shirt-17.jpg',mimeType:'image/jpeg',buffer:await readFile('frontend/claude/public/inventory/thrift-shirts/AA-SHIRT-017-front.jpg')},
   ]);
   await page.getByRole('button',{name:'Upload product images',exact:true}).click();
   await page.getByText('2/20 images. Gallery changes remain unpublished.',{exact:true}).waitFor();
   const first=page.locator('.aa-gallery article').first();
   const beforeAlt=await first.locator('input[name=updated_at]').first().inputValue();
   await first.getByLabel('Image description').fill('Synthetic front photo');
   await first.getByRole('button',{name:'Save image description',exact:true}).click();
   await page.waitForFunction(previous=>document.querySelector('.aa-gallery input[name=updated_at]')?.value!==previous,beforeAlt);
   await page.reload();await tab('Images');assert.equal(await page.locator('.aa-gallery article').first().getByLabel('Image description').inputValue(),'Synthetic front photo');
   await page.locator('.aa-gallery article').last().getByRole('button',{name:'Make cover image',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.aa-gallery article input[name=alt]')?.value==='');
   await page.reload();await tab('Images');assert.equal(await page.locator('.aa-gallery article').last().getByLabel('Image description').inputValue(),'Synthetic front photo');
   await page.locator('.aa-gallery article').last().getByRole('button',{name:'Remove from gallery',exact:true}).click();
   await page.getByText('1/20 images. Gallery changes remain unpublished.',{exact:true}).waitFor();
   console.log('BROWSER: binary multi-upload, persisted image description, cover reorder and removal passed');
  }
  await capture('images');
  await mkdir('artifacts/admin/generic-draft',{recursive:true});
  for(const width of [360,390,430,768,1440]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>Array.from(document.images).filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width===390||width===1440)await page.screenshot({path:`artifacts/admin/generic-draft/editor-${width}.png`,fullPage:true});
  }
  await page.goto('/admin/products/library');await page.setViewportSize({width:1440,height:900});
  await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('Hosted audited product edit');
  await page.getByRole('searchbox',{name:'Search products',exact:true}).press('Enter');
  await page.waitForURL(url=>url.pathname==='/admin/products/library'&&url.searchParams.get('q')==='Hosted audited product edit');
  await page.getByLabel('Status',{exact:true}).selectOption('draft');await page.getByRole('button',{name:'Apply filters',exact:true}).click();
  await page.waitForURL(url=>url.searchParams.get('status')==='draft');
  await capture('products');
  await page.setViewportSize({width:390,height:900});
  await page.getByRole('navigation',{name:'Mobile admin navigation'}).getByRole('button',{name:'More',exact:true}).click();
  await page.getByRole('dialog',{name:'Administration menu'}).waitFor();await page.getByRole('button',{name:'Close menu',exact:true}).click();
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/admin/sign-in');
  await page.goto('/admin/products/'+product);await page.waitForURL('**/admin/sign-in');
 }catch(error){
  console.log('BROWSER safe form errors:',JSON.stringify(await page.getByRole('alert').allTextContents().catch(()=>[])));
  await mkdir('artifacts/admin/generic-draft',{recursive:true});
  await page.screenshot({path:'artifacts/admin/generic-draft/browser-failure.png',fullPage:true}).catch(()=>{});
  // Playwright errors may contain the temporary access URL. Never log it.
  throw new Error('Hosted draft browser verification failed: '+String(error.message).replace(/https?:\/\/[^\s"']+/g,'[URL withheld]').slice(0,500));
 }finally{await browser.close();}
}
