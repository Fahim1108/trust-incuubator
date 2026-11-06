/**
 * Read-only readiness checks. These describe what staff still need to record;
 * they never change publication state. Publication is enforced in the database.
 */
export type ReadinessCheck = {key: string; label: string; short: string; ok: boolean | null; hint: string};

export type GarmentFacts = {
  actual_size: string | null;
  actual_color: string | null;
  chest_inches?: number | null;
  length_inches?: number | null;
  condition?: string | null;
  price_minor: number;
  stock_quantity: number;
  size_verified: boolean;
  details_verified: boolean;
};

const text = (value: string | null | undefined) => Boolean(value && value.trim());

/** Physical thrift garment: one real item, actual measurements, no invented variants. */
export function garmentReadiness(product: {name: string; description: string}, facts: GarmentFacts): ReadinessCheck[] {
  return [
    {key: 'name', label: 'Product name', short: 'Name', ok: text(product.name), hint: 'Name the garment as customers should see it.'},
    {key: 'description', label: 'Description', short: 'Description', ok: text(product.description), hint: 'Describe the actual garment, including any flaws.'},
    {key: 'size', label: 'Actual size recorded', short: 'Size', ok: text(facts.actual_size), hint: 'Record the size on the physical label or as measured.'},
    {key: 'color', label: 'Actual color recorded', short: 'Color', ok: text(facts.actual_color), hint: 'Record the real colour of this garment.'},
    {key: 'measurements', label: 'Chest and length measured', short: 'Measurements', ok: Boolean(facts.chest_inches && facts.length_inches), hint: 'Measure the garment flat, in inches.'},
    {key: 'condition', label: 'Condition recorded', short: 'Condition', ok: text(facts.condition), hint: 'Choose the honest condition grade.'},
    {key: 'price', label: 'Price above zero', short: 'Price', ok: facts.price_minor > 0, hint: 'Enter the real selling price in BDT.'},
    {key: 'stock', label: 'Physical garment in stock', short: 'Stock', ok: facts.stock_quantity === 1, hint: 'Quantity is 1 only while the original garment is on hand.'},
    {key: 'verified', label: 'Size and details verified', short: 'Verification', ok: facts.size_verified && facts.details_verified, hint: 'Verification has no staff workflow yet; saving a draft clears it.'},
  ];
}

export type StandardFacts = {
  description: string;
  categoryAssigned: boolean;
  /** null when the private gallery is not readable in this environment. */
  imageCount: number | null;
  variants: {active: boolean; price_minor: number}[];
  /** null when inventory is incomplete or truncated. */
  available: number | null;
};

/** Standard (non-thrift) product: SKUs, prices and stock come from variant inventory. */
export function standardReadiness(product: {name: string}, facts: StandardFacts): ReadinessCheck[] {
  return [
    {key: 'name', label: 'Product name', short: 'Name', ok: text(product.name), hint: 'Name the product as customers should see it.'},
    {key: 'description', label: 'Description', short: 'Description', ok: text(facts.description), hint: 'Add a description in Basic information.'},
    {key: 'category', label: 'Category assigned', short: 'Category', ok: facts.categoryAssigned, hint: 'Choose a category in Category & taxonomy.'},
    {key: 'images', label: 'At least one product image', short: 'Images', ok: facts.imageCount === null ? null : facts.imageCount > 0, hint: 'Upload photographs in Media.'},
    {key: 'sku', label: 'Active SKU with a price', short: 'SKU', ok: facts.variants.some(v => v.active && v.price_minor > 0), hint: 'Add an active SKU with its real size, colour and price.'},
    {key: 'stock', label: 'Stock available', short: 'Stock', ok: facts.available === null ? null : facts.available > 0, hint: 'Record physical stock with a reason.'},
  ];
}

/** Labels for checks that are known to be incomplete (unknown checks are not reported as missing). */
export function missingLabels(checks: ReadinessCheck[]): string[] {
  return checks.filter(c => c.ok === false).map(c => c.short);
}

/** Exactly what the database still lacks before Publish/Unpublish can be offered safely. */
export const publicationBackendGaps = [
  'A permission-checked, MFA-protected publish/unpublish RPC with expected_updated_at conflict protection and an audit entry. No such RPC exists; staff cannot change product status.',
  'A staff verification RPC for thrift garments (size_verified and details_verified). Saving a garment draft currently resets both to false, and the database refuses to publish unverified garments.',
  'A public read path for non-thrift products: the storefront reads only the published thrift catalogue, and gallery images are in a private bucket with no public copy.',
  'Server-side readiness validation inside the publish RPC (active priced SKU, stock, category, image) so the browser cannot publish an incomplete product.',
] as const;
