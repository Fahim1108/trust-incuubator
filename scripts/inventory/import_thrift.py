"""Validate owner ZIP; preserve photos; generate idempotent draft intake SQL. Never apply remotely by default."""
import argparse,csv,hashlib,io,json,re,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('archive');args=p.parse_args()
with zipfile.ZipFile(args.archive) as z:
 rows=list(csv.DictReader(io.StringIO(z.read('product_manifest.csv').decode('utf-8-sig'))))
 if len(rows)!=18:raise ValueError('Expected 18 inventory rows')
 records=[];seen=set();hashes=set()
 for r in rows:
  key=r['product_id'];name=r['image_filename'];price=int(r['price_bdt']);qty=int(r['stock_quantity'])
  if not re.fullmatch(r'AA-SHIRT-\d{3}',key) or key in seen or name!=key+'-front.jpg':raise ValueError('Invalid or duplicate identity')
  if not 500<=price<=600 or qty!=1 or r['stock_status']!='in_stock' or r['actual_size'].strip() or r['size_verification']!='pending_actual_measurement' or r['publish_status']!='draft_pending_size_confirmation':raise ValueError('Unexpected inventory state; review new batch before import')
  data=z.read('images/'+name)
  if not data.startswith(b'\xff\xd8\xff'):raise ValueError('Expected original JPEG')
  digest=hashlib.sha256(data).hexdigest()
  if digest in hashes:raise ValueError('Duplicate image')
  seen.add(key);hashes.add(digest)
  dest=ROOT/'frontend/claude/public/inventory/thrift-shirts'/name;dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists() and dest.read_bytes()!=data:raise ValueError('Existing photo differs; refusing overwrite')
  dest.write_bytes(data)
  records.append(dict(source_id=key,name=r['suggested_name'],image_path='/inventory/thrift-shirts/'+name,image_sha256=digest,price_minor=price*100,stock_quantity=1,stock_status='in_stock',actual_size=None,size_verified=False,details_verified=False,publish_status='draft',proposed_pattern=r['suggested_pattern'],proposed_color=r['visible_color'],unverified_label=r['label_observation_unverified']))
 out=ROOT/'frontend/claude/src/data/inventory/thrift-shirts.json';out.write_text(json.dumps(records,indent=2)+'\n')
 # No guessed variant is inserted: the existing schema requires a real size.
 def q(s):return "'"+s.replace("'","''")+"'"
 sql=['begin;']
 for r in records:
  slug=r['source_id'].lower()
  sql.append(f"do $guard$ begin if exists(select 1 from public.products p where slug={q(slug)} and not exists(select 1 from public.thrift_intake i where i.product_id=p.id and i.source_id={q(r['source_id'])})) then raise exception 'Product identity collision'; end if; end $guard$;")
  sql.append(f"insert into public.products(name,slug,status) values ({q(r['name'])},{q(slug)},'draft') on conflict(slug) do nothing;")
  sql.append(f"insert into public.thrift_intake(source_id,product_id,image_path,image_sha256,price_minor,stock_quantity,proposed_metadata) select {q(r['source_id'])},id,{q(r['image_path'])},{q(r['image_sha256'])},{r['price_minor']},1,{q(json.dumps({k:r[k] for k in ['proposed_pattern','proposed_color','unverified_label']}))}::jsonb from public.products where slug={q(slug)} on conflict(source_id) do nothing;")
 sql.append('commit;');(ROOT/'scripts/inventory/thrift-drafts.sql').write_text('\n'.join(sql)+'\n')
 print('Validated 18 drafts, 18 unique unchanged JPEGs; quantity 1 each, size unset. Generated SQL only; no database connection made.')
