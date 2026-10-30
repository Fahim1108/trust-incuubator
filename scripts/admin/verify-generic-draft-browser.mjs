import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {totpCode} from './verify-browser.mjs';
export async function verifyGenericDraftBrowser({baseURL,accessURL,proxy,email,password,secret,product}){
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,...(proxy?{proxy}:{})});
 const context=await browser.newContext({baseURL,viewport:{width:1440,height:900}});
 const page=await context.newPage();
 try{
  await page.goto(accessURL);await page.goto('/admin/products/'+product);
  await page.waitForURL('**/admin/sign-in');
  await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Sign in securely'}).click();await page.waitForURL('**/admin/mfa');
  await page.getByLabel('Authenticator code').fill(totpCode(secret));
  await page.getByRole('button',{name:'Verify and continue'}).click();await page.waitForURL(url=>url.pathname==='/admin');
  await page.goto('/admin/products/'+product);
  await page.getByRole('heading',{name:'Edit draft details',exact:true}).waitFor();
  await page.getByLabel('Product name',{exact:true}).fill('Hosted audited product edit');
  await page.getByLabel('Description',{exact:true}).fill('Saved through the actual Staging product editor.');
  await page.getByRole('button',{name:'Save draft details',exact:true}).click();
  await page.getByRole('heading',{name:'Hosted audited product edit',exact:true}).waitFor();
  await page.reload();assert.equal(await page.getByLabel('Product name',{exact:true}).inputValue(),'Hosted audited product edit');
  await mkdir('artifacts/admin/generic-draft',{recursive:true});
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:`artifacts/admin/generic-draft/editor-${width}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/admin/sign-in');
  await page.goto('/admin/products/'+product);await page.waitForURL('**/admin/sign-in');
 }finally{await browser.close();}
}
