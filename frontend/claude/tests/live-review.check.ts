import {beforeEach,afterEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({cookies:vi.fn(),getUser:vi.fn(),roles:vi.fn(),aal:vi.fn(),rpc:vi.fn()}));
vi.mock('next/headers',()=>({cookies:mocks.cookies}));
vi.mock('@/lib/admin/supabase',()=>({adminClient:async()=>({auth:{getUser:mocks.getUser,mfa:{getAuthenticatorAssuranceLevel:mocks.aal}},from:()=>({select:()=>({eq:mocks.roles})}),rpc:mocks.rpc})}));
import {dataSource} from '@/services/adapters';
import {readLiveReviewDrafts} from '@/services/adapters/live-review-thrift';
const item={id:'10000000-0000-4000-8000-000000000001',slug:'aa-shirt-001',source_id:'AA-SHIRT-001',name:'Saved owner name',description:'Saved owner description',status:'draft',updated_at:'2026-10-28T12:00:00Z',image_path:'/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',price_minor:100000,stock_quantity:1,actual_size:'XL',actual_color:'Blue',chest_inches:23,length_inches:29,condition:'good',attributes:['Solid','Casual'],size_verified:false,details_verified:false};
function snapshot(data= item){return {data:{products:18,published:0,drafts:18,available:0,sold_out:0,pending_sizes:18,items:[data]},error:null};}
beforeEach(()=>{
 vi.stubEnv('VERCEL_ENV','preview');vi.stubEnv('CLAUDE_DESIGN_PREVIEW','1');
 for(const key of ['SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])vi.stubEnv(key,'');
 mocks.cookies.mockResolvedValue({getAll:()=>[{name:'aa-admin-auth.0',value:'not-a-real-session'}]});
 mocks.getUser.mockResolvedValue({data:{user:{id:'owner',is_anonymous:false}},error:null});
 mocks.roles.mockResolvedValue({data:[{role:'owner'}],error:null});mocks.aal.mockResolvedValue({data:{currentLevel:'aal2'},error:null});mocks.rpc.mockResolvedValue(snapshot());
});
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
it('shows saved name, price, details, size, color and measurements to an MFA Owner',async()=>{
 const product=await dataSource.getProductBySlug('aa-shirt-001');expect(product).toMatchObject({name:item.name,description:item.description,price:1000,sizes:['XL'],displaySizeEstimate:undefined,reviewOnly:true,status:'draft'});expect(product?.colors[0]?.name).toBe('Blue');expect(product?.details).toEqual(['Actual chest: 23 inches','Actual length: 29 inches','Condition: good','Solid','Casual']);expect((await dataSource.getProducts()).items[0]?.name).toBe(item.name);expect((await dataSource.getCollection('new-arrivals'))[0]?.name).toBe(item.name);expect((await dataSource.searchSuggestions('Saved owner'))[0]?.name).toBe(item.name);
});
it('reads subsequent saved changes instead of caching or resurrecting the import',async()=>{
 expect((await dataSource.getProductBySlug(item.slug))?.name).toBe(item.name);
 mocks.rpc.mockResolvedValue(snapshot({...item,name:'Next persisted edit',price_minor:60000,stock_quantity:0}));
 const updated=await dataSource.getProductBySlug(item.slug);expect(updated?.name).toBe('Next persisted edit');expect(updated?.price).toBe(600);expect(updated?.variants[0]?.stock).toBe(0);
});
it('does not expose saved staff draft information to anonymous Preview visitors',async()=>{mocks.cookies.mockResolvedValue({getAll:()=>[]});expect((await dataSource.getProductBySlug(item.slug))?.name).not.toBe(item.name);expect(mocks.rpc).not.toHaveBeenCalled();});
it('requires actual DB membership and MFA, not customer metadata',async()=>{mocks.roles.mockResolvedValue({data:[],error:null});expect(await readLiveReviewDrafts()).toBeNull();expect(mocks.rpc).not.toHaveBeenCalled();mocks.roles.mockResolvedValue({data:[{role:'owner'}],error:null});mocks.aal.mockResolvedValue({data:{currentLevel:'aal1'},error:null});expect(await readLiveReviewDrafts()).toBeNull();expect(mocks.rpc).not.toHaveBeenCalled();});
it('never reads live drafts in Production even with the Preview flag and Owner cookie',async()=>{vi.stubEnv('VERCEL_ENV','production');expect(await readLiveReviewDrafts()).toBeNull();expect(await dataSource.getProductBySlug(item.slug)).toBeNull();expect(mocks.cookies).not.toHaveBeenCalled();expect(mocks.rpc).not.toHaveBeenCalled();});
it('fails honestly on an authorized snapshot failure instead of showing stale import data',async()=>{mocks.rpc.mockResolvedValue({data:null,error:{message:'offline'}});await expect(dataSource.getProductBySlug(item.slug)).rejects.toThrow('Saved review products could not be loaded');});
it('removes archived drafts from the signed-in review catalogue',async()=>{mocks.rpc.mockResolvedValue(snapshot({...item,status:'archived'}));expect(await dataSource.getProductBySlug(item.slug)).toBeNull();});
