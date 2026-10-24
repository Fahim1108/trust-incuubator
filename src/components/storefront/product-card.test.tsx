import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductCard } from "./product-card";
const product = {
  id: "test-only",
  name: "Test-only product",
  slug: "test-only",
  description: "",
  category_id: null,
  product_variants: [],
};
describe("homepage product cards (isolated fixtures)", () => {
  it("renders validated sale prices without enabling purchasing", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{
          ...product,
          product_variants: [
            { price_minor: 249000, sale_price_minor: 189000, active: true },
          ],
        }}
      />,
    );
    expect(html).toContain("৳ 1,890");
    expect(html).toContain("<del>");
    expect(html).toContain("৳ 2,490");
    expect(html).toContain("Shopping available at launch");
    expect(html).not.toContain("<button");
  });
  it("does not substitute editorial photos or prices for missing catalogue data", () => {
    const html = renderToStaticMarkup(<ProductCard product={product} />);
    expect(html).toContain("Photo coming soon");
    expect(html).toContain("Pricing coming soon");
    expect(html).not.toContain("৳");
    expect(html).not.toContain("<img");
  });
});
