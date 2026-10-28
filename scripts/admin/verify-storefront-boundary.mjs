// Read-only browser verification. Never sign in, mutate Supabase, or visit the live domain.
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.STOREFRONT_TEST_URL||'http://127.0.0.1:3100';
const mode=process.env.STOREFRONT_TEST_MODE||'production';
const origin=new URL(base);
assert(['production','preview'].includes(mode));
assert(['localhost','127.0.0.1'].includes(origin.hostname)||/^attires-arena-frontend-preview-[a-z0-9]+-fahim-s-projects1\.vercel\.app$/.test(origin.hostname),'Refusing live or unknown hostname');
const headers=process.env.STOREFRONT_TEST_BYPASS?{'x-vercel-protection-bypass':process.env.STOREFRONT_TEST_BYPASS}:{};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const directory=`artifacts/production-boundary/${origin.hostname==='127.0.0.1'?'local':'hosted'}-${mode}`;
await mkdir(directory,{recursive:true});
try {
 const page=await browser.newPage({extraHTTPHeaders:headers});
 const statuses={};
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  const response=await page.goto(base+'/',{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  assert(!await page.getByText('Design preview is disabled',{exact:true}).count());
  if(mode==='production'){
   await page.locator('[data-catalogue-empty]').waitFor();
   assert.equal(await page.locator('a[href^="/product/"]').count(),0);
  }else assert((await page.locator('a[href="/product/aa-shirt-001"]').count())>0);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');
  await page.screenshot({path:`${directory}/home-${width}.png`,fullPage:true});
 }
 for(const path of ['/product/aa-shirt-001','/shop','/category/shirts','/collections/new-arrivals','/motion-preview','/loader-preview','/admin','/admin/sign-in']){
  const response=await page.goto(base+path,{waitUntil:'networkidle'});
  if(path==='/admin')await page.waitForURL('**/admin/sign-in');
  statuses[path]={status:response.status(),path:new URL(page.url()).pathname};
  if(path==='/product/aa-shirt-001')assert.equal(response.status(),mode==='production'?404:200);
  if(['/motion-preview','/loader-preview'].includes(path))assert.equal(response.status(),mode==='production'?404:200);
  if(path==='/admin')assert.equal(new URL(page.url()).pathname,'/admin/sign-in');
  if(mode==='production'&&['/shop','/category/shirts'].includes(path))assert.equal(await page.locator('a[href^="/product/"]').count(),0);
 }
 await page.goto(base+'/',{waitUntil:'networkidle'});
 const search=page.getByRole('combobox',{name:'Search products'}).filter({visible:true}).first();
 await search.fill('White');await search.press('Enter');
 await page.waitForURL('**/shop?q=White');
 if(mode==='production')assert.equal(await page.locator('a[href^="/product/"]').count(),0);
 const result={base,mode,widths:[390,1440],statuses,searchPassed:true,unauthorizedAdminBlocked:true,databaseMutations:0};
 await writeFile(`${directory}/results.json`,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}finally{await browser.close();}
