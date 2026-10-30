'use client';
import {useActionState} from 'react';
import {saveTerm,assignProductTerms} from '@/lib/admin/taxonomy-actions';
type Term={id:string;name:string;slug:string;published:boolean;updated_at:string};
export function TaxonomyForm({kind,id,record}:{kind:string;id:string;record?:Term}){
 const [state,action,pending]=useActionState(saveTerm,{});
 return <form action={action} className="aa-form"><input type="hidden" name="kind" value={kind}/><input type="hidden" name="id" value={id}/><input type="hidden" name="updated_at" value={record?.updated_at||''}/>
 <label>Name<input name="name" required maxLength={120} defaultValue={record?.name||''}/></label><label>URL slug<input name="slug" required maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={record?.slug||''}/></label>
 <label><input type="checkbox" name="published" defaultChecked={record?.published||false}/> Published</label>
 <button name="operation" value="save" disabled={pending}>{pending?'Saving…':record?'Save catalogue record':'Create catalogue record'}</button>
 {record&&!record.published&&<><label><input type="checkbox" name="confirm"/> I confirm deletion if this record is unused.</label><button name="operation" value="delete" disabled={pending}>Delete unused record</button></>}
 {state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}</form>;
}
export function ProductTaxonomyForm({product,categories,terms,assigned}:{product:{id:string;updated_at:string;category_id:string|null};categories:{id:string;name:string}[];terms:{id:string;name:string;kind:string}[];assigned:string[]}){
 const [state,action,pending]=useActionState(assignProductTerms,{});
 return <section className="aa-panel"><h2>Product categories and discovery</h2><form action={action} className="aa-form"><input type="hidden" name="id" value={product.id}/><input type="hidden" name="updated_at" value={product.updated_at}/>
 <label>Category<select name="category" defaultValue={product.category_id||''}><option value="">Not assigned</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label>Brand<select name="terms" defaultValue={assigned.find(id=>terms.some(t=>t.id===id&&t.kind==='brand'))||''}><option value="">Not assigned</option>{terms.filter(t=>t.kind==='brand').map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
 {(['collection','tag'] as const).map(kind=><label key={kind}>{kind==='collection'?'Collections':'Tags'}<select name="terms" multiple size={4} defaultValue={assigned.filter(id=>terms.some(t=>t.id===id&&t.kind===kind))}>{terms.filter(t=>t.kind===kind).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>)}
 <p>Manage available records in Catalogue taxonomy. Publishing a brand record does not claim affiliation or authorisation.</p><button disabled={pending}>{pending?'Saving…':'Save product taxonomy'}</button>{state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}</form></section>;
}
