// Read-only permission diagnostic. Never print key/config values or change settings.
import {management,projectRef,query} from '../lib/supabase-development.mjs';
console.log(JSON.stringify({stagingProject:projectRef,readOnly:true}));
for(const [name,path] of [['auth_configuration','/config/auth'],['api_key_read','/api-keys?reveal=false']]){
 try{await management(path);console.log(JSON.stringify({check:name,allowed:true}));}
 catch(error){console.log(JSON.stringify({check:name,allowed:false,reason:error.message}));}
}
const count=await query('select count(*)::int as migrations from supabase_migrations.schema_migrations');
console.log(JSON.stringify({databaseReadAccess:true,migrations:count[0].migrations,secureDashboardTestKeysConfigured:!!process.env.SUPABASE_STAGING_PUBLISHABLE_KEY&&!!(process.env.SUPABASE_STAGING_SECRET_KEY||process.env.SUPABASE_STAGING_SERVICE_ROLE_KEY)}));
