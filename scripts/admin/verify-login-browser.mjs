import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {verifyHostedPreview} from './hosted-preview-browser.mjs';
export async function verifyLogin({baseURL,accessURL,proxy}){
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,...(proxy?{proxy}:{})});
 const context=await browser.newContext({baseURL});const page=await context.newPage();page.setDefaultTimeout(30000);
 const folder='artifacts/admin/login';await mkdir(folder,{recursive:true});
 try{
  await page.goto(accessURL||baseURL);await page.goto('/admin/login');await page.getByRole('heading',{name:'Welcome back'}).waitFor();await page.evaluate(()=>document.fonts.ready);
  const logo=page.getByAltText('Official Attires Arena logo');assert(await logo.evaluate(el=>el.complete&&el.naturalWidth>0));
  for(const width of [360,390,430,768,1440]){await page.setViewportSize({width,height:960});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow at '+width);if([390,1440].includes(width))await page.screenshot({path:`${folder}/hosted-${width}.png`,fullPage:true});}
  const password=page.getByLabel('Password',{exact:true});await password.fill('visibility-test-only');await page.getByRole('button',{name:'Show password',exact:true}).click();assert.equal(await password.getAttribute('type'),'text');await page.getByRole('button',{name:'Hide password',exact:true}).click();assert.equal(await password.getAttribute('type'),'password');await password.fill('');
  await page.getByRole('button',{name:'Forgot password?'}).click();await page.getByText('Contact your store Owner',{exact:false}).waitFor();
  // Exercise preference via submit event without sending any Auth request.
  await page.getByLabel('Email',{exact:true}).fill('login-ui-check@example.com');await page.getByLabel('Remember email').check();
  await page.locator('.aa-login-form').evaluate(form=>{form.addEventListener('submit',event=>event.preventDefault(),{once:true});form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
  assert.equal(await page.evaluate(()=>localStorage.getItem('aa-admin-remembered-email')),'login-ui-check@example.com');await page.reload();assert.equal(await page.getByLabel('Email',{exact:true}).inputValue(),'login-ui-check@example.com');assert.equal(await page.getByLabel('Password',{exact:true}).inputValue(),'');await page.getByLabel('Remember email').uncheck();assert.equal(await page.evaluate(()=>localStorage.getItem('aa-admin-remembered-email')),null);
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('heading',{name:'Welcome back'}).waitFor();
  await writeFile(`${folder}/hosted-results.json`,JSON.stringify({url:baseURL,widths:[360,390,430,768,1440],officialLogo:true,passwordToggle:true,rememberEmailPersistenceAndRemoval:true,recoveryGuidance:true,reducedMotionRendering:true,authenticationRetested:false,notes:'UI-only verification; no authentication request submitted or database writes.'},null,2));console.log('Hosted login UI verification passed; no Auth submissions or database writes.');
 }finally{await context.close();await browser.close();}
}
if(import.meta.url===new URL(process.argv[1],'file:').href)await verifyHostedPreview({},verifyLogin);
