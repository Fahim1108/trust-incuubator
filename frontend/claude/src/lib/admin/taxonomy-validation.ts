import {z} from 'zod';
export const termKind=z.enum(['category','brand','collection','tag']);
export const termRecord=z.object({id:z.uuid(),name:z.string(),slug:z.string(),published:z.boolean(),updated_at:z.iso.datetime({offset:true})});
export const termEdit=z.object({kind:termKind,id:z.uuid(),updated_at:z.union([z.literal(''),z.iso.datetime({offset:true})]),name:z.string().trim().min(1).max(120),slug:z.string().max(160).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),published:z.enum(['on','']).transform(v=>v==='on')});
export const productTerms=z.object({id:z.uuid(),updated_at:z.iso.datetime({offset:true}),category:z.union([z.literal(''),z.uuid()]),terms:z.array(z.uuid()).max(40).refine(ids=>new Set(ids).size===ids.length)});
