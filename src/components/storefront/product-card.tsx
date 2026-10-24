import { ImageOff } from "lucide-react";
import type { CatalogueProduct } from "@/lib/catalogue/public-catalogue";
import { formatBdt, getProductPrice } from "@/lib/catalogue/pricing";
export function ProductCard({ product }: { product: CatalogueProduct }) {
  const price = getProductPrice(product.product_variants);
  return (
    <article className="product-card">
      <div className="product-image-unavailable">
        <ImageOff size={25} strokeWidth={1} aria-hidden="true" />
        <span>Photo coming soon</span>
      </div>
      <div className="product-card-info">
        <h3>{product.name}</h3>
        {price ? (
          <p className="product-price">
            {price.from && <span className="price-from">From </span>}
            <span>{formatBdt(price.priceMinor)}</span>
            {price.regularMinor !== null && (
              <del>
                <span className="sr-only">Regular price </span>
                {formatBdt(price.regularMinor)}
              </del>
            )}
          </p>
        ) : (
          <p className="price-unavailable">Pricing coming soon</p>
        )}
        <p className="product-card-note">Shopping available at launch</p>
      </div>
    </article>
  );
}
