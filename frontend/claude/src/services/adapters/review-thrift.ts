import intake from '@/data/inventory/thrift-shirts.json';
import type {Product} from '@/types';

/** Local test SKU projection only. Never creates database SKUs or publishes inventory drafts. */
export function reviewShirts(): Product[] {
  if (process.env.CLAUDE_DESIGN_PREVIEW !== '1' || process.env.VERCEL_ENV === 'production') return [];
  return intake.map(row => {
    const pattern = row.proposed_pattern === 'Solid' ? 'solid' : row.proposed_pattern === 'Striped' ? 'striped' : 'checked';
    const image = {src:row.image_path,alt:row.name};
    return {
      id:row.source_id,slug:row.source_id.toLowerCase(),name:row.name,status:'draft',
      reviewOnly:true,displaySizeEstimate:'M',physicalStock:row.stock_quantity,
      categoryId:'cat-shirts',brandId:'',price:row.price_minor / 100,
      fixedVariantId:`preview-${row.source_id}`,apparelSizing:true,sizes:['M'],sizeOptions:['S','M','L','XL','2XL'],variants:[{id:`preview-${row.source_id}`,sku:`preview-${row.source_id}`,colorId:'fixed',size:'M',stock:row.stock_quantity}],colors:[{id:'fixed',name:row.proposed_color,hex:'#6B0202'}],
      defaultImages:[image],imagesByColor:{fixed:[image]},
      description:'An individual thrift shirt. The original photographs show the actual piece.',
      shortDescription:'One individual piece. Size and garment details are awaiting confirmation.',
      details:[],badges:[],isNewArrival:false,isFeatured:false,isBestSeller:false,
      rating:{average:0,count:0},createdAt:'',tags:[pattern,'thrift','shirt'],
      shirtAttributes:{pattern:[pattern],occasion:pattern === 'checked' ? ['casual'] : ['formal','casual']},
    };
  });
}
