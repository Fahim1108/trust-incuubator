import {readFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const record=JSON.parse(await readFile('artifacts/admin/deployment.json','utf8'));
const token=process.env.VERCEL_DEPLOY_TOKEN||JSON.parse(await readFile('/workspace/.vercel-cli-attires/auth.json','utf8')).token;
async function api(path,method='GET',body){const r=await fetch('https://api.vercel.com'+path+(path.includes('?')?'&':'?')+'teamId='+record.team,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error('Vercel HTTP '+r.status);return r.json();}
const d=await api('/v13/deployments/'+record.id);
if(d.target!=='staging'||d.projectId!==record.project)throw new Error('Not the staging Preview');
let secret,browser;
try{
 const shared=await api('/aliases/'+record.id+'/protection-bypass','PATCH',{ttl:600});
 const current=await api('/v13/deployments/'+record.id);
 secret=Object.keys(current.protectionBypass||shared.protectionBypass||{}).find(k=>!Object.keys(d.protectionBypass||{}).includes(k))||shared.secret;
 if(!secret)throw new Error('No temporary deployment share link');
 const u=new URL(process.env.HTTPS_PROXY||process.env.HTTP_PROXY);
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,proxy:{server:u.protocol+'//'+u.host,...(u.username?{username:decodeURIComponent(u.username),password:decodeURIComponent(u.password)}:{})}});
 const page=await browser.newPage();await page.goto(record.url+'/?_vercel_share='+encodeURIComponent(secret));
 for(const path of ['/admin/sign-in','/admin/products']){
  await page.goto(record.url+path);console.log(JSON.stringify({path,resultPath:new URL(page.url()).pathname,heading:await page.locator('h1').allTextContents(),passwordInputs:await page.locator('input[type=password]').count(),missingConfig:await page.getByRole('alert').allTextContents()}));
 }
}finally{if(browser)await browser.close();if(secret)await api('/aliases/'+record.id+'/protection-bypass','PATCH',{revoke:{secret,regenerate:false}});}
