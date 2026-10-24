"use client";

import { useState } from "react";
import { imagesForColor } from "@/lib/product";
import type { Product, SizeGuide } from "@/types";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchasePanel } from "./ProductPurchasePanel";

/** Shares the selected colour between the gallery and the purchase panel. */
export function ProductDetailClient({ product, brandName, sizeGuide, initialColorId }: { product: Product; brandName?: string; sizeGuide?: SizeGuide | null; initialColorId?: string }) {
  const valid = product.colors.some((c) => c.id === initialColorId);
  const [colorId, setColorId] = useState(valid ? initialColorId! : (product.colors[0]?.id ?? ""));
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <ProductGallery images={imagesForColor(product, colorId)} productName={product.name} />
      <div className="lg:sticky lg:top-28 lg:self-start">
        <ProductPurchasePanel product={product} brandName={brandName} colorId={colorId} onColorChange={setColorId} sizeGuide={sizeGuide} />
      </div>
    </div>
  );
}
