// Preview feature branch only. Never edits Production or reads privileged keys.
import {readFile} from 'node:fs/promises';
import {assertRemoteDatabaseIsolation} from '../lib/deployment-isolation.mjs';
import {projectUrl,query} from '../lib/supabase-development.mjs';
await assertRemoteDatabaseIsolation(projectUrl);
const installed=await query("select to_regprocedure('public.admin_update_product_draft(uuid,timestamptz,text,text)') is not null and to_regprocedure('public.admin_edit_product_gallery(uuid,timestamptz,jsonb)') is not null and to_regprocedure('public.admin_save_product_variant(uuid,timestamptz,uuid,jsonb)') is not null as ready");
if(!installed[0]?.ready)throw new Error('Staging migrations are not installed');
const token=process.env.VERCEL_DEPLOY_TOKEN||JSON.parse(await readFile(process.env.VERCEL_AUTH_FILE||'/workspace/.vercel-cli-attires/auth.json','utf8')).token;
const flags=['STAGING_GENERIC_DRAFT_EDITOR','STAGING_PRODUCT_GALLERY','STAGING_VARIANT_MANAGEMENT'];
const r=await fetch('https://api.vercel.com/v10/projects/prj_QgA6P7BJr74v5GbojhBXyxkXRZAA/env?teamId=team_7KAKEOgqI7HTogjNKjt2yg2h&upsert=true',{
 method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(flags.map(key=>({key,value:'1',type:'plain',target:['preview'],gitBranch:'feature/claude-frontend-integration'}))),signal:AbortSignal.timeout(30000),
});
if(!r.ok)throw new Error('Preview flag configuration HTTP '+r.status);
console.log('Enabled installed product workflows for the feature branch Preview only. Production configuration unchanged.');
