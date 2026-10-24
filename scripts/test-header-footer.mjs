import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import sharp from 'sharp';
await mkdir('artifacts/header-footer',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const width of [390,768,1024,1280,1440,1920]){
 const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await p.goto('http://localhost:3001/',{waitUntil:'networkidle'});
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const header=p.locator('header');const logo=header.locator('img[alt="Attires Arena"]');const box=await logo.boundingBox();
 assert.ok(Math.abs(box.x+box.width/2-width/2)<1,'Logo centered');
 if(width>=1024){
 const nav=header.getByRole('navigation',{name:'Main',exact:true});await expect(nav).toBeVisible();assert.equal(await nav.count(),1);
 const n=await nav.boundingBox();assert.ok(n.x+n.width<=box.x,'Navigation left of logo');
 const search=header.locator('input[type=search]:visible');assert.equal(await search.count(),1);const s=await search.boundingBox();assert.ok(s.x>box.x+box.width,'Search right of logo');
 assert.ok(Math.abs((s.y+s.height/2)-(box.y+box.height/2))<3,'Single horizontal row');
 const hb=await header.boundingBox();assert.ok(hb.height<=97,'Compact header');
 const men=nav.getByRole('link',{name:'Men',exact:true});await men.focus();await expect(nav.getByRole('link',{name:'Shirts',exact:true})).toBeVisible();const submenu=await nav.getByRole('link',{name:'Shirts',exact:true}).boundingBox();assert.ok(submenu.x>=0,'Laptop dropdown stays on screen');
 await header.getByRole('button',{name:/^Open cart/}).click();await expect(p.getByRole('dialog')).toBeVisible();await p.keyboard.press('Escape');await expect(p.getByRole('dialog')).toHaveCount(0);
 }
 if(width===390){const image=await p.screenshot();const a=await sharp(image).extract({left:0,top:0,width:390,height:195}).raw().toBuffer();const b=await sharp('/tmp/aa-mobile-before.png').extract({left:0,top:0,width:390,height:195}).raw().toBuffer();assert.equal(a.equals(b),true,'Mobile header pixels unchanged');}
 if(width>=1024)await p.locator(':focus').evaluate(e=>e.blur());
 if(width===1440)await header.screenshot({path:'artifacts/header-footer/header-1440.png'});
 const footer=p.locator('footer');assert.equal(await footer.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(64, 0, 0)');
 await expect(footer.getByText('Created by Firoj Ahamed Fahim',{exact:true})).toBeVisible();assert.equal(await footer.locator('input,form').count(),0);
 assert.equal(await footer.locator('nav').count(),3);assert.equal(await footer.locator('a[href="#"]').count(),0);
 assert.equal(await footer.locator('img').getAttribute('src').then(src=>decodeURIComponent(src).includes('logo-white.png')),true);
 const credit=await footer.getByText('Created by Firoj Ahamed Fahim',{exact:true}).boundingBox();assert.ok(Math.abs(credit.x+credit.width/2-width/2)<1);
 for(const link of await footer.locator('nav a').all()){const href=await link.getAttribute('href');assert.ok(href.startsWith('/'));}
 if(width===1440){for(const link of await footer.locator('nav a').all()){const response=await p.request.get('http://localhost:3001'+await link.getAttribute('href'));assert.equal(response.status(),200,'Existing footer route works');}}
 if([390,768,1440].includes(width))await footer.screenshot({path:`artifacts/header-footer/footer-${width}.png`});
 console.log(`PASS ${width}px: header geometry, dropdown/cart, footer, credit, links, no overflow`);await p.close();
 }
}finally{await browser.close()}
