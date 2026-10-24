"use client";

import { useState } from "react";
import { Modal, SmartImage } from "@/components/ui";
import { imagesForColor } from "@/lib/product";
import type { Product } from "@/types";
import { ProductPurchasePanel } from "./ProductPurchasePanel";

/** Product preview (Quick View) with the full purchase panel. */
export function QuickAddModal({ open, product, brandName, initialColorId, onClose }: { open: boolean; product: Product; brandName?: string; initialColorId?: string; onClose: () => void }) {
  const [colorId, setColorId] = useState(initialColorId ?? product.colors[0]?.id ?? "");
  // Re-sync with the swatch the shopper hovered on the card each time it opens.
  const [previous, setPrevious] = useState({open, initialColorId});
  if (previous.open !== open || previous.initialColorId !== initialColorId) {
    setPrevious({open, initialColorId});
    if (open && initialColorId) setColorId(initialColorId);
  }
  const image = imagesForColor(product, colorId)[0];
  return (
    <Modal open={open} onClose={onClose} title={`Quick view: ${product.name}`} hideTitle className="sm:max-w-3xl">
      <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]">
        <div className="relative hidden aspect-[4/5] overflow-hidden rounded-card bg-[#F4F2F0] sm:block">
          {image && <SmartImage src={image.src} alt={image.alt} fill sizes="320px" className="object-cover" />}
        </div>
        <ProductPurchasePanel product={product} brandName={brandName} colorId={colorId} onColorChange={setColorId} compact onAdded={onClose} headingLevel="h2" />
      </div>
    </Modal>
  );
}
