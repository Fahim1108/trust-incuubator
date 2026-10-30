import {z} from 'zod';
export const basicDraftSchema=z.object({id:z.uuid(),updated_at:z.iso.datetime({offset:true}),name:z.string().trim().min(1).max(200),description:z.string().max(20000)});
