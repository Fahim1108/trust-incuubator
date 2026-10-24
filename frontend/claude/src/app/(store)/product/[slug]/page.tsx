import { Clock, MapPin, PackageCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductRail } from "@/components/product/ProductRail";
import { ReviewList } from "@/components/product/ReviewList";
import { Accordion, Breadcrumbs, SectionHeading } from "@/components/ui";
import { commerce } from "@/config";
import { formatPrice } from "@/lib/format";
import { getBrands, getCategories, getProductBySlug, getProducts, getRelatedProducts, getReviews, getSizeGuide } from "@/services";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateStaticParams() {
  const { items } = await getProducts({ pageSize: 500 });
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: product.defaultImages[0] ? [{ url: product.defaultImages[0].src }] : undefined },
  };
}

export default async function ProductPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const sp = await searchParams;
  const [brands, categories, reviews, related, sizeGuide] = await Promise.all([
    getBrands(),
    getCategories(),
    getReviews(product.id),
    getRelatedProducts(product, 6),
    product.sizeGuideId ? getSizeGuide(product.sizeGuideId) : Promise.resolve(null),
  ]);
  const brand = brands.find((b) => b.id === product.brandId);
  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div className="pb-10">
      <div className="container pt-5 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
        <div className="mt-5">
          <ProductDetailClient product={product} brandName={brand?.name} sizeGuide={sizeGuide} initialColorId={typeof sp.color === "string" ? sp.color : undefined} />
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Accordion
            defaultOpen={["description"]}
            items={[
              { id: "description", title: "Description", content: <p>{product.description}</p> },
              {
                id: "details",
                title: "Details & Care",
                content: (
                  <div className="space-y-4">
                    <ul className="list-disc space-y-1 pl-5">
                      {product.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                    {product.material && (
                      <p>
                        <span className="font-medium text-ink">Material:</span> {product.material}
                      </p>
                    )}
                    {product.care && (
                      <div>
                        <p className="font-medium text-ink">Care</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5">
                          {product.care.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                id: "delivery",
                title: "Delivery & Returns",
                content: (
                  <p>
                    Cash on Delivery is available across Bangladesh. You can check the item before paying the rider. Unused items with tags can be returned or exchanged within {commerce.returnWindowDays} days.
                  </p>
                ),
              },
            ]}
          />
          <section aria-labelledby="delivery-heading" className="rounded-card border border-line p-5 sm:p-6">
            <h2 id="delivery-heading" className="font-serif text-2xl text-ink">
              Delivery Information
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} aria-hidden />
                <div>
                  <p className="font-medium text-ink">Inside Dhaka</p>
                  <p className="text-ink-muted">1–2 working days · {formatPrice(commerce.deliveryCharges.insideDhaka)}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} aria-hidden />
                <div>
                  <p className="font-medium text-ink">Outside Dhaka</p>
                  <p className="text-ink-muted">3–5 working days · {formatPrice(commerce.deliveryCharges.outsideDhaka)}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} aria-hidden />
                <div>
                  <p className="font-medium text-ink">Free delivery</p>
                  <p className="text-ink-muted">On orders over {formatPrice(commerce.freeDeliveryThreshold)}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} aria-hidden />
                <div>
                  <p className="font-medium text-ink">Order confirmation</p>
                  <p className="text-ink-muted">Our team calls to confirm COD orders before dispatch.</p>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-16">
          <ReviewList reviews={reviews} average={product.rating.average} count={product.rating.count} />
        </div>

        {related.length > 0 && (
          <section className="mt-16" aria-label="You may also like">
            <SectionHeading title="You May Also Like" cta={category ? { label: `More ${category.name}`, href: `/category/${category.slug}` } : undefined} />
            <ProductRail products={related} brands={brands} />
          </section>
        )}
      </div>
    </div>
  );
}
