import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs, SectionHeading } from "@/components/ui";
import { selectHomepageCollections } from "@/lib/merchandising";
import { getCollection, getBrands, getProducts, getHomepageProducts, getStorefrontSettings } from "@/services";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if(slug==='winter'){
    const [result,brands]=await Promise.all([getProducts({collection:'winter',inStock:true,pageSize:100}),getBrands()]);
    if(!result.items.length) return <div className="container py-16 text-center"><SectionHeading as="h1" title="Coming Soon"/><p>We&apos;re expanding our collection. Stay tuned.</p></div>;
    return <div className="container py-8"><SectionHeading as="h1" title="Winter Collection"/>{result.items.length?<ProductGrid products={result.items} brands={brands} columns={4}/>:<p className="text-sm text-ink-muted">No winter products are available yet.</p>}</div>;
  }
  const [settings, candidates, brands] = await Promise.all([getStorefrontSettings(), getHomepageProducts(), getBrands()]);
  const section = settings.homepage.find(s => s.id === slug && s.enabled && ["new-arrivals", "featured", "trending", "most-popular"].includes(s.type));
  if (!section) notFound();
  const products = slug==='new-arrivals'||slug==='featured'
    ? await getCollection(slug)
    : selectHomepageCollections(settings.homepage, candidates).get(section.id) ?? [];
  if (!products.length) notFound();
  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: section.title ?? section.adminLabel }]} />
      <SectionHeading as="h1" className="mt-5" title={section.title ?? section.adminLabel} subtitle={section.subtitle} />
      <ProductGrid products={products} brands={brands} columns={4} className="md:!grid-cols-4" />
    </div>
  );
}
