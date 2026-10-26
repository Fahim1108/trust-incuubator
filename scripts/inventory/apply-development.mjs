import {readFile} from 'node:fs/promises';
const ref='euoannuvovsbwxjqnriw';
const token=process.env.SUPABASE_ACCESS_TOKEN;if(!token)throw new Error('SUPABASE_ACCESS_TOKEN missing; configure securely.');
async function query(sql){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql})});if(!r.ok)throw new Error(`Development query failed (${r.status})`);return r.json();}
const migrations=['20261026000100_thrift_intake','20261026000200_product_reviews'];
const history=await query('select version from supabase_migrations.schema_migrations order by version');
const applied=new Set(history.map(r=>r.version));
for(const name of migrations){const version=name.split('_')[0];if(applied.has(version))continue;const sql=await readFile(`supabase/migrations/${name}.sql`,'utf8');
 await query(sql.replace(/commit;\s*$/i,`insert into supabase_migrations.schema_migrations(version,name,statements) values ('${version}','${name.slice(version.length+1)}',ARRAY[]::text[]);\n${process.argv.includes('--apply')?'commit;':'rollback;'}`));
 console.log(`${process.argv.includes('--apply')?'Applied':'Dry-run passed'} development migration ${version}`);
}
const seed=await readFile('scripts/inventory/thrift-drafts.sql','utf8');
if(process.argv.includes('--apply')){await query(seed);const rows=await query("select count(*)::int as drafts,count(*) filter(where actual_size is null)::int as sizes_pending,min(price_minor)::int as minimum_price_minor,max(price_minor)::int as maximum_price_minor,sum(stock_quantity)::int as physical_quantity from public.thrift_intake i join public.products p on p.id=i.product_id where p.status='draft'");console.log(JSON.stringify(rows));}
else console.log('No inventory applied. Use --apply only for this fixed development project after local verification.');
