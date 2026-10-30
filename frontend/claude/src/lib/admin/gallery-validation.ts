import {z} from 'zod';
import {basicDraftSchema} from './basic-draft-validation';
export const galleryTarget=basicDraftSchema.pick({id:true,updated_at:true});
export const galleryCommand=z.discriminatedUnion('operation',[
 z.object({operation:z.literal('remove'),id:z.uuid()}),
 z.object({operation:z.literal('alt'),id:z.uuid(),alt:z.string().max(300)}),
 z.object({operation:z.literal('reorder'),ids:z.array(z.uuid()).max(20).refine(a=>new Set(a).size===a.length)}),
]);
export const galleryRecord=z.object({id:z.uuid(),storage_path:z.string(),alt_text:z.string(),position:z.number().int().min(0).max(19)});
